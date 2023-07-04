'use strict';

// const nconf = require.main.require('nconf');
// const winston = require.main.require('winston');

const meta = require.main.require('./src/meta');
const routeHelpers = require.main.require('./src/routes/helpers');

const multipart = require.main.require('connect-multiparty');
const multipartMiddleware = multipart();

const plugin = {};

plugin.init = async (params) => {
	const controllers = require('./lib/controllers');
	const { router/* , middleware, controllers */ } = params;

	// router.post('/import-users-csv', [(req, res, next) => {
	// 	res.locals.isAPI = true;
	// 	next();
	// }, middleware.authenticateRequest, middleware.ensureLoggedIn], (req, res) => {
	// 	console.log(req.body);
	// });

	routeHelpers.setupAdminPageRoute(router, '/admin/plugins/import-users-csv', controllers.renderAdminPage);
};

plugin.addRoutes = async ({ router, middleware, helpers }) => {
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
	additionalFields = additionalFields.split(',');
	const additionalFieldsIndex = additionalFields.map(field => findIndex(headers, [field]));

	if (!emailIndex) {
		throw new Error('An email address was not found in the uploaded CSV.');
	}

	if (!usernameIndex && !firstNameIndex && !lastNameIndex) {
		throw new Error('Could not resolve a possible username from the uploaded CSV');
	}

	const users = records.reduce((users, record) => {
		let username = '';
		if (usernameIndex !== -1) {
			username += record[usernameIndex];
		} else {
			if (firstNameIndex !== -1) {
				username += record[firstNameIndex];
			}

			if (lastNameIndex !== -1) {
				username += record[firstNameIndex];
			}
		}

		const email = record[emailIndex];

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

	return users;
};

plugin.deduplicate = async records => records; // ;)

module.exports = plugin;
