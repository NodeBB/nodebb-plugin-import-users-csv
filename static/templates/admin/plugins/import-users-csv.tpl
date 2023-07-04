<div class="acp-page-container">
	<!-- IMPORT admin/partials/settings/header.tpl -->

	<div class="row m-0">
		<div id="spy-container" class="col-12 col-md-8 px-0 mb-4" tabindex="0">
			<div class="mb-4">
				<form role="form" class="import-users-csv-settings">
					<h5 class="fw-bold tracking-tight settings-header">Settings</h5>

					<div class="mb-3">
						<label class="form-label" for="additionalFields">Additional Fields</label>
						<input type="text" id="additionalFields" name="additionalFields" title="Additional Fields" class="form-control">
						<p class="form-text">
							Specify additional columns in your CSV file here. Any matches will be automatically saved into the user's data object.
						</p>
						<p class="form-text">
							<strong>N.B.</strong> This only places the data into the database, it does not expose it to the front-end.
						</p>
					</div>
				</form>
			</div>

			<div class="mb-4">
				<h5 class="fw-bold tracking-tight settings-header">Upload</h5>
				<p>
					Any rows containing valid data will be converted into users. If they have already been imported, then no action will be taken.
				</p>
				<div class="alert alert-warning">
					If you've changed any settings above, please make sure you hit save <strong>first</strong> before uploading.
				</div>

				<form role="form">
					<input type="file" name="upload" />
					<input type="hidden" value="{config.csrf_token}" name="csrf_token" />

					<button type="button" class="btn btn-primary" data-action="upload">Upload</button>
				</form>

				<p class="form-text">
					This tool expects the following fields:
					<ul class="form-text">
						<li><code>username</code> (optionally, <code>firstname</code> and <code>lastname</code>)</li>
						<li><code>email</code> (optionally, <code>mail</code>)</li>
					</ul>
				</p>
			</div>
		</div>

		<!-- IMPORT admin/partials/settings/toc.tpl -->
	</div>
</div>
