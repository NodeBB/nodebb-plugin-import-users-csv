/* eslint-disable import/no-unresolved */

'use strict';

import { post } from 'api';
import { error } from 'alerts';
import { load, save } from 'settings';
import { alert } from 'bootbox';
import { render } from 'benchpress';

export async function init() {
	const uploadBtn = document.querySelector('[data-action="upload"]');
	if (uploadBtn) {
		const uploadForm = uploadBtn.closest('form');
		uploadBtn.addEventListener('click', async () => {
			const data = new FormData(uploadForm);
			await post('/plugins/import-users-csv', data).then(showImported).catch(error);
		});
	}

	load('import-users-csv', $('.import-users-csv-settings'), () => {
		$('#additionalFields').tagsinput({
			tagClass: 'badge bg-info',
			confirmKeys: [13, 44],
			trimValue: true,
		});
	});
	$('#save').on('click', saveSettings);
}

function saveSettings() {
	save('import-users-csv', $('.import-users-csv-settings'));
}

export async function showImported({ users, fields, createCount, ignoreCount }) {
	const message = await render('admin/partials/import-users-csv/results', { users, fields, createCount, ignoreCount });
	alert({
		title: `User Import`,
		size: 'lg',
		message,
	});
}
