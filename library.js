/* eslint-disable no-await-in-loop */

'use strict';

// const nconf = require.main.require('nconf');
// const winston = require.main.require('winston');

const db = require.main.require('./src/database');
const meta = require.main.require('./src/meta');
const plugins = require.main.require('./src/plugins');
const user = require.main.require('./src/user');
const batch = require.main.require('./src/batch');
const routeHelpers = require.main.require('./src/routes/helpers');

const multipart = require.main.require('connect-multiparty');
const multipartMiddleware = multipart();

const plugin = {};

plugin.init = async (params) => {
	const controllers = require('./lib/controllers');
	const { router/* , middleware, controllers */ } = params;

	routeHelpers.setupAdminPageRoute(router, '/admin/plugins/import-users-csv', controllers.renderAdminPage);
};

plugin.addRoutes = async ({ router, middleware/* , helpers */ }) => {
	const controllers = require('./lib/controllers');
	const middlewares = [
		middleware.ensureLoggedIn,
		middleware.admin.checkPrivileges,
	];

	router.post('/import-users-csv', [
		multipartMiddleware,
		// next 3 lines from setupApiRoute (here because I need multipart before authenticateRequest)
		middleware.authenticateRequest,
		middleware.pluginHooks,
		middleware.logApiUsage,
		...middlewares,
	], controllers.handleUpload);
};

plugin.addAdminNavigation = (header) => {
	header.plugins.push({
		route: '/plugins/import-users-csv',
		icon: 'fa-tint',
		name: 'Import Users via CSV',
	});

	return header;
};

const findIndex = (headers, matches) => headers.indexOf(headers.filter((value) => {
	value = value.replace(/\s/g, '').trim().toLowerCase();

	return matches.indexOf(value) !== -1;
}).pop());

plugin.normalizeCSV = async (records) => {
	// First row is headers
	const headers = records.shift();

	const usernameIndex = findIndex(headers, ['user', 'username']);
	const firstNameIndex = findIndex(headers, ['first', 'firstname']);
	const lastNameIndex = findIndex(headers, ['last', 'lastname']);
	const emailIndex = findIndex(headers, ['mail', 'email']);

	let { additionalFields } = await meta.settings.get('import-users-csv');
	additionalFields = additionalFields ? additionalFields.split(',').filter(Boolean) : [];
	const additionalFieldsIndex = additionalFields.map(field => findIndex(headers, [field]));

	if (!emailIndex) {
		throw new Error('An email address was not found in the uploaded CSV.');
	}

	if (!usernameIndex && !firstNameIndex && !lastNameIndex) {
		throw new Error('Could not resolve a possible username from the uploaded CSV');
	}

	const fieldsFound = ['username', 'email'];
	additionalFields.forEach((field, idx) => {
		if (additionalFieldsIndex[idx] !== -1) {
			fieldsFound.push(field);
		}
	});

	const users = records.reduce((users, record) => {
		let username = '';
		if (usernameIndex !== -1) {
			username += record[usernameIndex];
		} else {
			if (firstNameIndex !== -1) {
				username += record[firstNameIndex];
			}

			if (lastNameIndex !== -1) {
				username += ` ${record[lastNameIndex]}`;
			}
		}

		const email = String(record[emailIndex]).trim();

		if (!username || !email) {
			return users;
		}

		// Additional fields
		const fields = additionalFields.reduce((fields, cur, idx) => {
			if (additionalFieldsIndex[idx] !== -1) {
				fields[cur] = record[additionalFieldsIndex[idx]];
			}

			return fields;
		}, {});

		users.push({ username, email, ...fields });

		return users;
	}, []);

	return { users, fields: fieldsFound };
};

plugin.deduplicate = async (users) => {
	const emails = users.map(u => u.email);
	const existing = await db.sortedSetScores('email:uid', emails.map(email => String(email).toLowerCase()));

	// Filter out existing users
	const filtered = users.filter((user, idx) => existing[idx] === null);
	const ignoreCount = users.length - filtered.length;

	return { users: filtered, ignoreCount };
};

plugin.createUsers = async (users) => {
	// Create users in sync so as to not trip the locking mechanism on username dupes
	const uids = [];
	for (let x = 0; x < users.length; x++) {
		const uid = await user.create({ username: users[x].username });
		uids.push(uid);
	}

	// Automatically confirm emails + update fields
	await Promise.all(uids.map(async (uid, idx) => {
		await user.setUserField(uid, 'email', users[idx].email);
		await user.email.confirmByUid(uid);

		const updatePayload = { ...users[idx] };
		delete updatePayload.username;
		delete updatePayload.email;
		updatePayload.uid = uid;
		await user.updateProfile(uid, updatePayload, Object.keys(updatePayload));
	}));

	plugins.hooks.fire('action:importUsersCSV.created', { uids, users });

	return uids;
};

plugin.executePostRegistration = async (adminUid, users) => {
	// Post-registration behaviour
	let { behaviour, password: newPassword } = await meta.settings.get('import-users-csv');
	behaviour = behaviour || 'manual'; // manual behaviour === do nothing

	if (behaviour === 'auto') {
		await batch.processArray(users, async (users) => {
			await Promise.all(users.map(async (userObj) => {
				await user.reset.send(userObj.email);
			}));
		}, {
			interval: 1000,
			batch: 100,
		});
	}

	if (behaviour === 'password' && newPassword) {
		await batch.processArray(users, async (users) => {
			await Promise.all(users.map(async (userObj) => {
				console.log(`changing password for ${userObj.email}, to ${newPassword}`);
				await user.changePassword(adminUid, {
					uid: userObj.uid,
					newPassword,
				});
			}));
		}, {
			interval: 1000,
			batch: 10,
		});

		// Trigger password reset on first login
		const uids = users.map(user => user.uid);
		await db.setObjectField(uids.map(uid => `user:${uid}`), 'passwordExpiry', Date.now());
	}
};

module.exports = plugin;
