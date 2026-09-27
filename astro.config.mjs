// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// TODO: remplacer par le domaine définitif (utilisé pour les URLs canoniques / Open Graph)
	site: 'https://lailakabbaj.fr',
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
