import { defineCollection, reference } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

// Catalogue des formations : source unique pour la page d'accueil, les pages détail et le paiement.
const formations = defineCollection({
	loader: file('src/data/formations.yaml'),
	schema: z.object({
		ordre: z.number(),
		titre: z.string(),
		accroche: z.string(),
		format: z.string(),
		duree: z.string(),
		prix: z.number(),
		misEnAvant: z.boolean().default(false),
		pourQui: z.array(z.string()),
		inclus: z.array(z.string()),
		programme: z.array(z.object({ titre: z.string(), description: z.string() })),
		// Titre et description pour Google, quand ils doivent différer du titre affiché et de l'accroche.
		seo: z.object({ titre: z.string().optional(), description: z.string().optional() }).optional(),
		// Lien de paiement (ex. Stripe Payment Link). Vide → bouton « Bientôt disponible ».
		checkoutUrl: z.url().optional(),
	}),
});

const temoignages = defineCollection({
	loader: file('src/data/temoignages.yaml'),
	schema: z.object({
		nom: z.string(),
		contexte: z.string(),
		citation: z.string(),
		resultat: z.string().optional(),
		formation: reference('formations').optional(),
		// true = témoignage inventé, à remplacer. Masqué automatiquement en production.
		placeholder: z.boolean().default(false),
	}),
});

export const collections = { formations, temoignages };
