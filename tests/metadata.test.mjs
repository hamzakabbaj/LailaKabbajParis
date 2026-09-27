// LKP-6 — per-page title, description and robots. Run after `npm run build`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const htmlFiles = (dir) =>
	readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
		e.isDirectory() ? htmlFiles(path.join(dir, e.name)) : e.name.endsWith('.html') ? [path.join(dir, e.name)] : [],
	);

const decode = (s) =>
	s
		.replace(/&nbsp;|&#160;|&#xa0;/gi, ' ')
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&#x27;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');

const pages = htmlFiles('dist').map((file) => {
	const html = readFileSync(file, 'utf8');
	return {
		file: path.relative('dist', file),
		descriptions: [...html.matchAll(/<meta name="description" content="([^"]*)"/g)].map((m) => decode(m[1])),
		robots: [...html.matchAll(/<meta name="robots" content="([^"]*)"/g)].map((m) => m[1]),
		title: decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '').trim(),
	};
});
const NOINDEX = new Set(['404.html', path.join('merci', 'index.html')]);
const siteDefault = readFileSync('src/site.ts', 'utf8').match(/description:\s*'([^']+)'/)[1];

test('every page has exactly one description, all different', () => {
	assert.ok(pages.length >= 9, `only ${pages.length} pages built`);
	for (const p of pages) assert.equal(p.descriptions.length, 1, `${p.file}: ${p.descriptions.length} description tags`);
	const seen = new Map();
	for (const p of pages) {
		const d = p.descriptions[0];
		assert.ok(!seen.has(d), `${p.file} and ${seen.get(d)} share the description "${d}"`);
		seen.set(d, p.file);
	}
});

test('only the home page uses the site-wide default description', () => {
	for (const p of pages) if (p.file !== 'index.html') assert.notEqual(p.descriptions[0], siteDefault, `${p.file} uses the default`);
});

test('/merci and 404 are noindex, and no other page is', () => {
	for (const p of pages) {
		if (NOINDEX.has(p.file)) {
			assert.equal(p.robots.length, 1, `${p.file}: expected one robots meta`);
			assert.match(p.robots[0], /noindex/);
		} else {
			assert.equal(p.robots.length, 0, `${p.file}: unexpected robots meta ${p.robots}`);
		}
	}
});

test('descriptions are 120–160 characters', () => {
	for (const p of pages) {
		const n = [...p.descriptions[0]].length;
		assert.ok(n >= 120 && n <= 160, `${p.file}: ${n} characters — "${p.descriptions[0]}"`);
	}
});

test('descriptions follow French typography and the content rules', () => {
	for (const p of pages) {
		const d = p.descriptions[0];
		for (const m of d.matchAll(/[:;?!]/g)) {
			assert.match(d[m.index - 1] ?? '', /[  ]/, `${p.file}: no non-breaking space before "${m[0]}" in "${d}"`);
		}
		for (const m of d.matchAll(/«/g)) assert.match(d[m.index + 1] ?? '', /[  ]/, `${p.file}: after «`);
		for (const m of d.matchAll(/»/g)) assert.match(d[m.index - 1] ?? '', /[  ]/, `${p.file}: before »`);
		assert.doesNotMatch(d, /2\s*[-–à]\s*3\s*(×|x|fois)|deux à trois fois/i, `${p.file}: forbidden speed claim`);
		assert.doesNotMatch(d, /(supprim|élimin)\w*[^.]*(subvocalisation|régression|retours en arrière)/i, `${p.file}: forbidden claim`);
	}
});

test('every page has a unique, non-empty title', () => {
	const titles = pages.map((p) => p.title);
	for (const p of pages) assert.ok(p.title, `${p.file}: empty title`);
	assert.equal(new Set(titles).size, titles.length, `duplicate titles: ${titles.join(' | ')}`);
});

test('every simple page passes its own description in the source', () => {
	for (const f of readdirSync('src/pages').filter((f) => f.endsWith('.astro') && f !== 'index.astro')) {
		assert.match(readFileSync(path.join('src/pages', f), 'utf8'), /description=/, `src/pages/${f} passes no description`);
	}
});
