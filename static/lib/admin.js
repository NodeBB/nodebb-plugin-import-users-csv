'use strict';

/*
	This file is located in the "modules" block of plugin.json
	It is only loaded when the user navigates to /admin/plugins/import-users-csv page
	It is not bundled into the min file that is served on the first load of the page.
*/
define('admin/plugins/import-users-csv', ['api', 'alerts', 'settings'], function (api, alerts, settings) {
	var ACP = {};

	ACP.init = function () {
		const uploadBtn = document.querySelector('[data-action="upload"]');
		if (uploadBtn) {
			const uploadForm = uploadBtn.closest('form');
			uploadBtn.addEventListener('click', async () => {
				const data = new FormData(uploadForm);
				await api.post('/plugins/import-users-csv', data).then((users) => {
					console.log(users);
				}).catch(alerts.error);
			});
		}

		settings.load('import-users-csv', $('.import-users-csv-settings'), () => {
			$('#additionalFields').tagsinput({
				tagClass: 'badge bg-info',
				confirmKeys: [13, 44],
				trimValue: true,
			});
		});
		$('#save').on('click', saveSettings);
	};

	function saveSettings() {
		settings.save('import-users-csv', $('.import-users-csv-settings'));
	}

	return ACP;
});
