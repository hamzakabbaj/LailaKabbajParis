import type { APIRoute } from 'astro';

// robots.txt généré au build, pour que l'URL du sitemap suive `site` et `base` (astro.config.mjs).
// Tant que le site vit dans un sous-dossier de github.io, les robots ne lisent que le robots.txt
// à la racine du domaine : ce fichier ne sera pris en compte qu'une fois sur lailakabbaj.fr.
export const GET: APIRoute = ({ site }) => {
	const sitemap = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sitemap-index.xml`, site);
	return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
