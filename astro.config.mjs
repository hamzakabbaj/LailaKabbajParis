// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	// Hébergé sur GitHub Pages, dans le sous-dossier du dépôt (utilisé pour les URLs canoniques / Open Graph).
	// TODO: avec un domaine définitif, mettre site: 'https://<domaine>' et supprimer base.
	site: 'https://hamzakabbaj.github.io',
	base: '/LailaKabbajParis',
	// sitemap-index.xml + sitemap-0.xml au build. /merci (après paiement) et la 404 n'ont rien à faire dans Google.
	integrations: [sitemap({ filter: (page) => !/\/(merci|404)\/?$/.test(new URL(page).pathname) })],
	// Les polices sont téléchargées au build et servies depuis notre domaine (pas d'appel à Google côté visiteur → RGPD).
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Newsreader',
			cssVariable: '--font-serif',
			weights: ['400 700'],
			styles: ['normal', 'italic'],
			fallbacks: ['Georgia', 'serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Nunito Sans',
			cssVariable: '--font-sans',
			weights: ['300 800'],
			styles: ['normal'],
			fallbacks: ['system-ui', 'sans-serif'],
		},
	],
});
