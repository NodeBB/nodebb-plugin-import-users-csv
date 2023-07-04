'use strict';

const { readFile, unlink } = require('fs').promises;
const { parse } = require('csv-parse');
const util = require('util');

const nconf = require.main.require('nconf');
const controllerHelpers = require.main.require('./src/controllers/helpers');

const main = require('../library');

const Controllers = module.exports;

Controllers.renderAdminPage = function (req, res/* , next */) {
	res.render('admin/plugins/import-users-csv', {
		title: 'User Import (.csv)',
		upload_url: `${nconf.get('url')}/api/v3/plugins/import-users-csv`,
	});
};

Controllers.handleUpload = async (req, res) => {
	if (!req.files.upload) {
		return controllerHelpers.formatApiResponse(400, res);
	}

	const parseAsync = util.promisify(parse);
	const { path } = req.files.upload;
	const contents = await readFile(path, 'utf-8');
	try {
		const records = await parseAsync(contents);
		let users = await main.normalizeCSV(records);
		users = await main.deduplicate(users);

		controllerHelpers.formatApiResponse(201, res, { users });
	} catch (e) {
		controllerHelpers.formatApiResponse(400, res, e);
	} finally {
		await unlink(path);
	}
};
