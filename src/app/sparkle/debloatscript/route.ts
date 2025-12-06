export const GET = async () => {
	const url =
		'https://raw.githubusercontent.com/parcoil/sparkle/refs/heads/v2/tweaks/debloat-windows/apply.ps1';
	const res = await fetch(url);
	if (!res.ok) return new Response('File not found', { status: 404 });
	let text = await res.text();

	// Sanitize non-ASCII whitespace that can break PowerShell parsing
	// Replace common Unicode spaces with normal spaces
	text = text
		.replace(/[\u00A0\u2007\u202F]/g, ' ') // NBSP and narrow no-break spaces
		.replace(/\r\n/g, '\n'); // normalize line endings

	return new Response(text, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Content-Disposition': 'attachment; filename="debloat.ps1"'
		}
	});
};