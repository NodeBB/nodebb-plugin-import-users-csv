<p class="lead">
	The following {createCount} user(s) have been successfully imported.
</p>
<p class="text-secondary">
	{ignoreCount} user(s) were already found in the database and were ignored.
</p>
<div class="table-responsive">
	<table class="table small">
		<thead>
			{{{ each fields }}}
			<th>{@value}</th>
			{{{ end }}}
		</thead>
		<tbody>
			{{{ each users }}}
			<tr>
				{{{ each @value }}}
				<td>{@value}</td>
				{{{ end }}}
			</tr>
			{{{ end }}}
		</tbody>
	</table>
</div>