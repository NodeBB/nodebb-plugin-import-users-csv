<div class="acp-page-container">
	<!-- IMPORT admin/partials/settings/header.tpl -->

	<div class="row m-0">
		<div id="spy-container" class="col-12 col-md-8 px-0 mb-4" tabindex="0">
			<div class="mb-4">
				<form role="form" class="import-users-csv-settings">
					<h5 class="fw-bold tracking-tight settings-header">Settings</h5>

					<div class="mb-3">
						<label class="form-label" for="delimiter">Delimiter</label>
						<input type="text" id="delimiter" name="delimiter" title="Delimiter" class="form-control" placeholder="," value="," />
						<p class="form-text">
							Default is comma-separated (<code>,</code>)
						</p>
					</div>

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

					<div class="mb-3">
						<label class="form-label" for="behaviour">Registration behaviour</label>
						<div class="form-check">
							<input class="form-check-input" type="radio" name="behaviour" value="manual" id="behaviour-manual">
							<label class="form-check-label" for="behaviour-manual">
								Users manually reset password to gain access to account.
							</label>
						</div>
						<div class="form-check mt-1">
							<input class="form-check-input" type="radio" name="behaviour" value="auto" id="behaviour-auto" checked>
							<label class="form-check-label" for="behaviour-auto">
								Users automatically receive a password reset email.
							</label>
						</div>
						<div class="form-check">
							<input class="form-check-input" type="radio" name="behaviour" value="password" id="behaviour-password">
							<label class="form-check-label" for="behaviour-password">
								Users have a common password set and are prompted to change it on login (<a href="#" data-action="behaviour-password-insecure-why">less secure</a>).
							</label>
						</div>
					</div>

					<div class="mb-3">
						<label class="form-label" for="password">Common Password</label>
						<input type="text" id="password" name="password" title="Common Password" class="form-control" />
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

				<form role="form" class="d-flex align-items-center">
					<input type="file" name="upload" class="flex-1" />
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
