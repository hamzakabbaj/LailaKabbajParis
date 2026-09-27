// Informations globales du site. Les valeurs marquées TODO sont à confirmer avec Laila.
export const site = {
	name: 'Laila Kabbaj',
	tagline: 'Lecture rapide',
	description:
		'Formations en lecture rapide, en ligne et à Paris. Lisez plus efficacement, comprenez plus vite et retrouvez le plaisir de finir vos livres.',
	email: 'contact@lailakabbaj.fr', // TODO
	instagram: 'https://www.instagram.com/lailakabbaj.paris/',
	instagramHandle: '@lailakabbaj.paris',
	city: 'Paris',
	devise: "J'apprends, j'expérimente et je partage",
	certification: 'Formatrice certifiée Méthode Boclet®',
	piliers: ['Lecture rapide', 'Mémorisation', 'Mind mapping'],
};

export const formatPrix = (euros: number) =>
	new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(euros);

// Les témoignages fictifs (placeholder: true) ne sortent jamais dans un build de production,
// sauf si PUBLIC_SHOW_PLACEHOLDERS=true (pour une préview interne).
export const showPlaceholders = import.meta.env.DEV || import.meta.env.PUBLIC_SHOW_PLACEHOLDERS === 'true';
