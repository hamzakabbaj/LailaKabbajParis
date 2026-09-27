// LKP-7 — Person + WebSite JSON-LD on the home page. Run after `npm run build`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import config from '../astro.config.mjs';

const COMPONENT = 'src/components/StructuredData.astro';
const home = new URL((config.base ?? '/').replace(/\/?$/, '/'), config.site).href;
const siteTs = readFileSync('src/site.ts', 'utf8');
const field = (name) => siteTs.match(new RegExp(`${name}:\\s*['"]([^'"]+)['"]`))[1];
const site = { name: field('name'), certification: field('certification'), instagram: field('instagram') };

const htmlFiles = (dir) =>
	readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
		e.isDirectory() ? htmlFiles(path.join(dir, e.name)) : e.name.endsWith('.html') ? [path.join(dir, e.name)] : [],
	);
const blocks = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);

const homeBlocks = blocks(readFileSync('dist/index.html', 'utf8'));
const graph = () => JSON.parse(homeBlocks[0])['@graph'];
const node = (type) => graph().find((n) => n['@type'] === type);

test('the home page has exactly one parseable JSON-LD graph', () => {
	assert.equal(homeBlocks.length, 1);
	assert.ok(Array.isArray(JSON.parse(homeBlocks[0])['@graph']));
});

test('the graph holds one Person and one WebSite, nothing else', () => {
	assert.deepEqual(graph().map((n) => n['@type']).sort(), ['Person', 'WebSite']);
});

test('Person describes Laila from src/site.ts', () => {
	const p = node('Person');
	assert.equal(p.name, site.name);
	assert.ok([p.jobTitle, p.description].some((v) => v?.includes(site.certification)), 'certification missing');
	assert.ok(p.sameAs.includes(site.instagram), 'Instagram missing from sameAs');
	assert.equal(new URL(p.image).protocol, 'https:');
	assert.equal(p.url, home);
});

test('Person.image is a file the build actually produced', () => {
	const { pathname } = new URL(node('Person').image);
	assert.ok(pathname.startsWith(new URL(home).pathname), `${pathname} is outside the site`);
	assert.ok(existsSync(path.join('dist', pathname.slice(new URL(home).pathname.length))), `${pathname} not in dist/`);
});

test('WebSite is the canonical home, in French, published by the Person', () => {
	const w = node('WebSite');
	assert.equal(w.name, site.name);
	assert.equal(w.url, home);
	assert.equal(w.inLanguage, 'fr-FR');
	assert.ok(node('Person')['@id'], 'Person has no @id');
	assert.equal(w.publisher?.['@id'], node('Person')['@id']);
});

test('no rich-result or local-business types anywhere, and no JSON-LD off the home page', () => {
	const forbidden = /"@type":\s*"(FAQPage|Course|Review|AggregateRating|LocalBusiness|ProfessionalService)"/;
	for (const file of htmlFiles('dist')) {
		const html = readFileSync(file, 'utf8');
		assert.doesNotMatch(html, forbidden, file);
		if (file !== path.join('dist', 'index.html')) assert.equal(blocks(html).length, 0, `${file} has JSON-LD`);
	}
});

test('no testimonial data leaks into the graph', () => {
	const names = [...readFileSync('src/data/temoignages.yaml', 'utf8').matchAll(/^\s+nom: (.+)$/gm)].map((m) => m[1].trim());
	for (const n of names) assert.ok(!homeBlocks[0].includes(n), `testimonial name "${n}" in JSON-LD`);
});

test('the component reads src/site.ts, escapes "<", and hard-codes no URL', () => {
	const src = readFileSync(COMPONENT, 'utf8');
	for (const v of Object.values(site)) assert.ok(!src.includes(v), `${COMPONENT} copies "${v}" instead of reading site.ts`);
	assert.ok(!src.includes('/LailaKabbajParis') && !src.includes('github.io'), 'hard-coded site URL');
	assert.match(src, /JSON\.stringify\(/);
	assert.match(src, /replace\(\/<\/g/, 'no escaping of "<" in the serialized JSON');
	assert.ok(!homeBlocks[0].includes('<'), 'raw "<" inside the JSON-LD block');
});
