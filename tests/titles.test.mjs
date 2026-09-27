// LKP-9 — titles and descriptions aimed at the queries the LKP-3 study found winnable.
// Run after `npm run build`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const decode = (s) =>
	s.replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&');
const read = (file) => {
	const html = readFileSync(path.join('dist', file), 'utf8');
	return {
		title: decode(html.match(/<title>([^<]*)<\/title>/)[1]),
		description: decode(html.match(/<meta name="description" content="([^"]*)"/)[1]),
		h1: decode(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim(),
	};
};
// Normalises non-breaking spaces so "groupe : deux" matches plain-space queries.
const norm = (s) => s.replace(/[  ]/g, ' ').toLowerCase();

test('home: brand first, then "formation en lecture rapide en ligne"', () => {
	const home = read('index.html');
	assert.ok(home.title.startsWith('Laila Kabbaj'), home.title);
	assert.match(norm(home.title), /lecture rapide en ligne/);
	for (const term of ['lecture rapide', 'en ligne', 'petit groupe', 'mémorisation', 'méthode boclet']) {
		assert.ok(norm(home.description).includes(term), `home description lacks "${term}": ${home.description}`);
	}
});

test('Atelier Déclic targets "atelier lecture rapide en visio"', () => {
	const p = read('formations/atelier-declic/index.html');
	assert.match(norm(p.title), /atelier/);
	assert.match(norm(p.title), /lecture rapide en visio/);
	assert.match(norm(p.description), /atelier de lecture rapide en visio/);
});

test('visible headings are unchanged (heading copy needs Laila\'s validation)', () => {
	assert.equal(read('index.html').h1, 'Finissez enfin les livres que vous commencez.');
	assert.equal(read('formations/atelier-declic/index.html').h1, "L'Atelier Déclic");
});

test('no title is longer than 60 characters', () => {
	const files = (dir) =>
		readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
			e.isDirectory() ? files(path.join(dir, e.name)) : e.name.endsWith('.html') ? [path.relative('dist', path.join(dir, e.name))] : [],
		);
	for (const f of files('dist')) {
		const { title } = read(f);
		assert.ok([...title].length <= 60, `${f}: ${[...title].length} characters — "${title}"`);
	}
});
