// LKP-5 — sitemap.xml and robots.txt. Run after `npm run build`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import config from '../astro.config.mjs';

const prefix = config.site.replace(/\/$/, '') + (config.base ?? '').replace(/\/$/, '');
const formationIds = [...readFileSync('src/data/formations.yaml', 'utf8').matchAll(/^- id: (\S+)/gm)].map((m) => m[1]);
const legalPaths = ['/cgv/', '/confidentialite/', '/mentions-legales/'];

const locsIn = (file) => [...readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const fileFor = (dist, url, origin) => path.join(dist, decodeURI(new URL(url).pathname.slice(new URL(origin).pathname.replace(/\/$/, '').length)));

// Reads the sitemap (following an index) and robots.txt of a build.
function readBuild(dist, origin) {
	const entry = ['sitemap-index.xml', 'sitemap.xml'].find((f) => existsSync(path.join(dist, f)));
	assert.ok(entry, `no sitemap-index.xml or sitemap.xml in ${dist}`);
	const files = [path.join(dist, entry)];
	let locs = locsIn(files[0]);
	if (entry === 'sitemap-index.xml') {
		const children = locs;
		locs = [];
		for (const child of children) {
			const file = fileFor(dist, child, origin);
			assert.ok(existsSync(file), `sitemap index points to ${child}, missing from dist/`);
			files.push(file);
			locs.push(...locsIn(file));
		}
	}
	const robots = existsSync(path.join(dist, 'robots.txt')) ? readFileSync(path.join(dist, 'robots.txt'), 'utf8') : '';
	return { entry, files, locs, robots };
}

test('sitemap exists, is well-formed, and lists exactly the indexable pages', () => {
	const { files, locs } = readBuild('dist', prefix);
	for (const f of files) {
		const xml = readFileSync(f, 'utf8');
		assert.match(xml, /^<\?xml [^>]*\?>/, `${f} lacks an XML declaration`);
		assert.match(xml, /<(urlset|sitemapindex)[\s>][\s\S]*<\/(urlset|sitemapindex)>\s*$/, `${f} is not a closed urlset/sitemapindex`);
	}
	for (const loc of locs) assert.ok(loc.startsWith(prefix + '/'), `${loc} does not start with ${prefix}/`);
	const paths = locs.map((l) => l.slice(prefix.length));
	assert.equal(new Set(paths).size, paths.length, 'duplicate <loc> entries');

	const once = (p) => assert.equal(paths.filter((x) => x === p).length, 1, `${p} should appear exactly once, got: ${paths.join(', ')}`);
	once('/');
	for (const id of formationIds) once(`/formations/${id}/`);
	for (const p of legalPaths) once(p);
	for (const p of ['/merci/', '/merci', '/404/', '/404', '/404.html']) assert.ok(!paths.includes(p), `${p} must not be in the sitemap`);
	assert.equal(paths.length, 1 + formationIds.length + legalPaths.length, `unexpected URLs: ${paths.join(', ')}`);
	assert.ok(formationIds.length > 0, 'no training ids read from formations.yaml');

	for (const p of paths) assert.ok(existsSync(path.join('dist', p, 'index.html')), `${p} has no built page`);
});

test('robots.txt allows crawling and points to the sitemap', () => {
	const { entry, robots } = readBuild('dist', prefix);
	assert.ok(robots, 'dist/robots.txt is missing');
	assert.match(robots, /^User-agent: \*$/m);
	assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/m, 'blanket Disallow: /');
	const line = robots.match(/^Sitemap: (\S+)$/m);
	assert.ok(line, 'no Sitemap: line');
	assert.equal(line[1], `${prefix}/${entry}`);
	assert.ok(existsSync(fileFor('dist', line[1], prefix)), 'Sitemap URL does not resolve to a built file');
});

test('a different site URL (the domain move) changes only the origin', () => {
	const out = mkdtempSync(path.join(tmpdir(), 'lkp-sitemap-'));
	const origin = 'https://example.test';
	try {
		execFileSync('npx', ['astro', 'build', '--site', origin, '--base', '/', '--outDir', out], { stdio: 'pipe' });
		const a = readBuild('dist', prefix);
		const b = readBuild(out, origin);
		for (const loc of b.locs) assert.ok(loc.startsWith(origin + '/'), `${loc} still uses the old origin`);
		assert.deepEqual(b.locs.map((l) => l.slice(origin.length)), a.locs.map((l) => l.slice(prefix.length)));
		assert.equal(b.robots.replaceAll(origin, ''), a.robots.replaceAll(prefix, ''));
	} finally {
		rmSync(out, { recursive: true, force: true });
	}
});
