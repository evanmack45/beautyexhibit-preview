// End-to-end checks for Beauty Year. Usage: node e2e.mjs <base url>
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const base = process.argv[2] || 'http://localhost:8945/';
const origin = new URL(base).origin;
const L = await import(new URL('../site-build/src/logic.js', import.meta.url));
const images = JSON.parse(readFileSync(new URL('../site-build/data/images.json', import.meta.url)));
const legacyIds = JSON.parse(readFileSync(new URL('../site-build/data/legacy-ids.json', import.meta.url)));
const fixture = JSON.parse(readFileSync(new URL('./legacy-fixture.json', import.meta.url))).links;
const house = () => L.game(20261125, false, images, legacyIds).map((i) => images[i]);
const H = (20261125).toString(36);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok  ', m); } else { fail++; console.log('FAIL', m); } };
const b = await chromium.launch({ channel: 'chrome' });

// Pure logic
ok(images.length >= 120, `pool has ${images.length} images (120 or more)`);
ok(new Set(L.game(7, false, images, legacyIds)).size === 5, 'a game gives 5 distinct images');
{
  const seen = new Set(); let spread = true, N = 4000;
  for (let s = 1; s <= N; s++) { const g = L.game(s, false, images, legacyIds); g.forEach((i) => seen.add(i)); if (new Set(g.map((i) => L.eraOf(images[i].year))).size !== 5) spread = false; }
  ok(spread, `every one of ${N} games has one image from each of the 5 eras`);
  const live = images.filter((r) => !r.legacyOnly).length;
  ok(seen.size === live, `all ${live} images in new games reachable (${seen.size})`);
  ok([...seen].every((i) => !images[i].legacyOnly), 'legacy-only images never appear in new games');
  let share = 0; for (let s = 1; s <= N; s++) { const a = L.game(s, false, images, legacyIds), c = L.game(s + 7777777, false, images, legacyIds); if (a.some((i) => c.includes(i))) share++; }
  ok(share / N < 0.2, `two random games share an image ${(100 * share / N).toFixed(1)}% of the time`);
}
for (const [h, ids] of Object.entries(fixture)) { const d = L.decode('#' + h); ok(d.legacy && L.game(d.seed, true, images, legacyIds).map((i) => images[i].id).join() === ids.join(), `logic: old link #${h} gives the same five as the old site`); }
ok(L.decode('#g=abc.10')?.legacy === false && L.encode(5, 10) === 'g=5.10' && L.encode(5, 10, true) === 's=5.10', 'new links use #g=, old links keep #s=');
ok(L.points(1900, 1900) === 100 && L.points(1890, 1900) === 70 && L.points(1700, 1900) === 0, 'points: exact 100, 10 off 70, floor 0');
for (const [t, want] of [['', 'error'], ['abcd', 'error'], ['185', 'error'], ['1789', 'error'], ['1941', 'error'], ['2026', 'error'], ['19.5', 'error'], [' 1900 ', 'year'], ['1790', 'year'], ['1940', 'year']]) ok(want in L.readYear(t), `readYear(${JSON.stringify(t)}) gives ${want}`);
for (const h of ['#s=', '#s=0', '#s=zzzzzzzz', '#s=abc.501', '#s=abc.-1', '#s=ABC', '#garbage', '#s=abc.12.3', '#s=1z141z4', '#g=', '#g=0', '#x=abc', '#g=abc.501']) ok(L.decode(h) === null, `decode rejects ${h}`);
ok(L.decode('#s=abc.0')?.score === 0 && L.decode('#s=abc')?.score === null, 'decode accepts seed with and without score');
ok(images.every((r) => /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(r.source) && r.license && r.year >= 1790 && r.year <= 1940), 'every image has a Commons source, license and year');

async function page(w, h, opts = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 600, hasTouch: w < 600, acceptDownloads: true, ...opts });
  const p = await ctx.newPage(); p.errs = []; p.foreign = [];
  p.on('pageerror', (e) => p.errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && p.errs.push(m.text()));
  p.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) p.foreign.push(r.url()); });
  return p;
}
const play = async (p, years) => { for (let i = 0; i < 5; i++) { await p.fill('#year-in', String(years[i])); await p.click('#lock'); await p.click('#next'); } };

for (const [w, h] of [[390, 844], [1280, 800]]) {
  const tag = `@${w}`, p = await page(w, h);
  await p.goto(base); await p.waitForTimeout(400);
  ok(await p.locator('meta[name=robots][content="noindex,nofollow"]').count() === 1, `${tag} noindex meta`);
  ok((await p.getAttribute('.foot a', 'href')) === 'https://www.afternic.com/domain/beautyexhibit.com' && /for sale/.test(await p.textContent('.foot')), `${tag} for-sale footer link`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${tag} no sideways scroll`);
  const lock = await p.locator('#lock').boundingBox();
  ok(lock && lock.y + lock.height <= h, `${tag} lock button in first screen (${Math.round(lock.y + lock.height)} of ${h})`);
  const first = house();
  ok((await p.getAttribute('#art', 'src')) === `img/${first[0].id}.webp`, `${tag} house set first image`);
  ok(await p.evaluate(() => document.getElementById('art').naturalWidth > 0), `${tag} image loaded`);

  // slider and input sync, keyboard
  await p.focus('#slider'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
  ok((await p.inputValue('#year-in')) === '1872', `${tag} slider arrows update the year box`);
  await p.fill('#year-in', '1901');
  ok((await p.inputValue('#slider')) === '1901', `${tag} typing moves the slider`);
  await p.focus('#year-in'); await p.keyboard.press('ArrowUp');
  ok((await p.inputValue('#year-in')) === '1902', `${tag} arrow up in the year box`);
  await p.fill('#year-in', '1940'); await p.keyboard.press('ArrowUp');
  ok((await p.inputValue('#year-in')) === '1940', `${tag} arrow up stops at 1940`);

  // odd inputs
  for (const [txt, shown, err] of [['', '', /Type a year/], ['abcd', '', /Type a year/], ['18x5', '185', /four digits/], ['1700', '1700', /1790 to 1940/], ['2026', '2026', /1790 to 1940/], ['123456', '1234', /1790 to 1940/], ['-1850', '1850', null]]) {
    await p.fill('#year-in', txt); await p.click('#lock');
    const v = await p.inputValue('#year-in'), hint = await p.textContent('#hint'), revealed = await p.isVisible('#label');
    if (err) ok(v === shown && err.test(hint) && !revealed && (await p.getAttribute('#year-in', 'aria-invalid')) === 'true', `${tag} odd input ${JSON.stringify(txt)} shows "${hint}" and stays`);
    else { ok(v === shown && revealed, `${tag} odd input ${JSON.stringify(txt)} cleaned to ${shown} and accepted`); }
  }
  // round 1 was locked by the -1850 case; check reveal content
  ok(/You said 1850/.test(await p.textContent('#a-off')) && (await p.textContent('#a-year')) === String(first[0].year), `${tag} reveal shows real year and guess`);
  ok((await p.getAttribute('#a-credit a', 'href')) === first[0].source && /CC0|Public domain/.test(await p.textContent('#a-credit')), `${tag} reveal credit with license and source link`);
  ok(/years before \d{4}/.test(await p.textContent('#a-then')), `${tag} reveal compares to today`);
  // keyboard: Enter on focused Next
  await p.keyboard.press('Enter');
  ok((await p.textContent('#count')) === 'Image 2 of 5' && await p.isVisible('#guess'), `${tag} Enter on Next goes to image 2`);
  // exact guess and off by one via keyboard Enter submit
  await p.fill('#year-in', String(first[1].year)); await p.keyboard.press('Enter');
  ok(/Exactly right/.test(await p.textContent('#a-off')) && /100 of 100/.test(await p.textContent('#a-pts')), `${tag} exact year gets 100`);
  await p.click('#next'); await p.fill('#year-in', String(first[2].year + 1 <= 1940 ? first[2].year + 1 : first[2].year - 1)); await p.click('#lock');
  ok(/Off by 1 year\./.test(await p.textContent('#a-off')), `${tag} off by 1 says "1 year"`);
  await p.click('#next');
  for (let i = 3; i < 5; i++) { await p.fill('#year-in', '1850'); await p.click('#lock'); await p.click('#next'); }
  const guesses = [1850, first[1].year, first[2].year + 1 <= 1940 ? first[2].year + 1 : first[2].year - 1, 1850, 1850];
  const want = guesses.reduce((s, g, i) => s + L.points(g, first[i].year), 0);
  ok((await p.textContent('#e-score')) === String(want), `${tag} final score ${want} matches the logic`);
  ok(new URL(p.url()).hash === `#g=${H}.${want}`, `${tag} link holds seed and score (${new URL(p.url()).hash})`);
  ok(await p.locator('#recap li').count() === 5, `${tag} recap lists 5`);
  if (w >= 900) ok(await p.isVisible('#wall') && await p.locator('#wall figure').count() === 5, `${tag} wall of 5 framed images`);
  // save card
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#save')]);
  const path = await dl.path(), buf = readFileSync(path);
  ok(dl.suggestedFilename() === `beauty-year-${want}.png` && buf.readUInt32BE(16) === 1080 && buf.readUInt32BE(20) === 1350, `${tag} score card PNG 1080x1350 (${dl.suggestedFilename()})`);
  // copy link
  await p.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
  await p.click('#copy'); await p.waitForTimeout(200);
  const clip = await p.evaluate(() => navigator.clipboard.readText().catch(() => ''));
  ok(clip.endsWith(`#g=${H}.${want}`) || /Copy this link/.test(await p.textContent('#msg')), `${tag} copy link gives the challenge link`);
  // storage
  ok(await p.evaluate(() => localStorage.length === 0 && sessionStorage.length === 0 && document.cookie === ''), `${tag} no storage or cookies`);
  // new images
  await p.click('#again');
  ok(await p.isVisible('#guess') && (await p.textContent('#count')) === 'Image 1 of 5' && /^#g=[0-9a-z]+$/.test(new URL(p.url()).hash) && new URL(p.url()).hash !== `#g=${H}`, `${tag} new images start a fresh seeded round`);
  ok(p.foreign.length === 0, `${tag} no third-party requests ${p.foreign.join(' ')}`);
  ok(p.errs.length === 0, `${tag} no console errors ${p.errs.join(' ')}`);
  await p.context().close();
}

// challenge link
{
  const p = await page(390, 844), seed = 987654;
  await p.goto(`${base}#g=${seed.toString(36)}.250`); await p.waitForTimeout(300);
  const set = L.game(seed, false, images, legacyIds).map((i) => images[i]);
  ok(/A friend scored 250/.test(await p.textContent('#friend-top')) && (await p.getAttribute('#art', 'src')) === `img/${set[0].id}.webp`, 'challenge link loads the same five and the friend score');
  await play(p, set.map((r) => r.year));
  ok((await p.textContent('#e-score')) === '500' && /You beat your friend's 250/.test(await p.textContent('#friend')), 'perfect run beats the friend');
  ok(/Curator level/.test(await p.textContent('#e-verdict')), 'perfect run verdict');
  ok(await p.$eval('#e-object', (e) => !e.hidden && e.complete && e.naturalWidth > 0 && /verdict-curator-400\.webp$/.test(e.getAttribute('src'))), 'r4: curator object sits beside the verdict');
  ok(p.errs.length === 0, 'challenge: no console errors');
  await p.context().close();
}
// old #s= links made before the pool grew replay the same five, in the browser
for (const [h, ids] of Object.entries(fixture)) {
  const p = await page(390, 844);
  await p.goto(`${base}#${h}`); await p.waitForTimeout(300);
  const got = [];
  for (let i = 0; i < 5; i++) { got.push((await p.getAttribute('#art', 'src')).replace(/^img\/|\.webp$/g, '')); await p.fill('#year-in', '1850'); await p.click('#lock'); await p.click('#next'); }
  ok(got.join() === ids.join() && /friend's 250/.test(await p.textContent('#friend')) && /^#s=/.test(new URL(p.url()).hash), `old link #${h} replays ${got.join(',')} and keeps #s=`);
  ok(p.errs.length === 0, `old link #${h}: no console errors`);
  await p.context().close();
}
// lazy loading: recap and wall images are lazy, only the first image is preloaded
{
  const p = await page(1280, 800);
  await p.goto(base); await p.waitForTimeout(300);
  const pre = await p.$$eval('link[rel=preload][as=image]', (ls) => ls.map((l) => l.getAttribute('href')));
  ok(pre.length === 2 && pre.includes('img/hero.webp') && pre.includes(`img/${house()[0].id}.webp`), `r3 masthead and the first plate are the only image preloads (${pre})`);
  await play(p, [1850, 1850, 1850, 1850, 1850]);
  ok(await p.evaluate(() => [...document.querySelectorAll('#recap img, #wall img')].every((i) => i.loading === 'lazy')), 'recap and wall images are lazy');
  await p.context().close();
}
// bad links
for (const h of ['#s=', '#s=zzzzzzzz', '#s=abc.999', '#s=0', '#garbage', '#s=abc.-1', '#%3Cscript%3E', '#g=', '#g=abc.999', '#v=abc']) {
  const p = await page(390, 844);
  await p.goto(base + h); await p.waitForTimeout(250);
  ok(/did not work/.test(await p.textContent('#friend-top')) && await p.isVisible('#guess') && p.errs.length === 0, `bad link ${h} falls back to the house set`);
  await p.context().close();
}
// about anchor
{
  const p = await page(1280, 800);
  await p.goto(base + '#about'); await p.waitForTimeout(250);
  ok(await p.isVisible('#guess') && new URL(p.url()).hash === '#about', '#about keeps the game and the anchor');
  await p.click('.all summary');
  ok(await p.locator('.all li').count() === images.length && await p.locator('.all li a[href^="https://commons.wikimedia.org/wiki/File:"]').count() === images.length, 'credits list has every image with a source link');
  await p.context().close();
}
// no JS
{
  const p = await page(390, 844, { javaScriptEnabled: false });
  await p.goto(base);
  ok(await p.evaluate(() => document.getElementById('art').complete && document.getElementById('art').naturalWidth > 0), 'no JS: first image shows');
  ok(/needs JavaScript/.test(await p.textContent('noscript')), 'no JS: says guessing needs JavaScript');
  await p.context().close();
}
// the round image has its size before the file arrives, so the panel does not jump
for (const [w, h] of [[390, 844], [1280, 800]]) {
  const p = await page(w, h);
  await p.route('**/img/*.webp', async (r) => { await new Promise((ok) => setTimeout(ok, 1500)); r.continue(); });
  await p.goto(base, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(400);
  const before = (await p.locator('#panel').boundingBox()).y; await p.waitForTimeout(2000);
  const after = (await p.locator('#panel').boundingBox()).y;
  ok(Math.abs(before - after) < 2, `@${w} panel stays put while the image loads (${Math.round(before)} then ${Math.round(after)})`);
  await p.context().close();
}
// r4: verdict objects on the end screen and in the share PNG
{
  const p = await page(1280, 800, { acceptDownloads: true });
  await p.addInitScript(() => { window.__img = []; const di = CanvasRenderingContext2D.prototype.drawImage; CanvasRenderingContext2D.prototype.drawImage = function (im, ...r) { window.__img.push(im && im.src ? im.src : 'canvas'); return di.call(this, im, ...r); }; });
  await p.goto(`${base}#g=${(987654).toString(36)}`);
  const set = L.game(987654, false, images, legacyIds).map((i) => images[i]);
  await play(p, set.map((r) => r.year));
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#save')]);
  const png = readFileSync(await dl.path());
  const imgs = await p.evaluate(() => window.__img.join('\n'));
  ok(png.readUInt32BE(16) === 1080 && png.readUInt32BE(20) === 1350, 'r4 curator card is 1080x1350');
  ok(/verdict-curator-1024\.webp/.test(imgs), 'r4: curator object is drawn into the share canvas');
  await p.context().close();
  // the call-to-play line must sit clearly below the "said <year>" row (it overprinted it once)
  const t = await page(390, 844, { acceptDownloads: true });
  await t.addInitScript(() => { window.__ft = []; const o = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (s, x, y, ...r) { window.__ft.push([String(s), y]); return o.call(this, s, x, y, ...r); }; });
  await t.goto(`${base}#g=${(987654).toString(36)}`);
  await play(t, set.map((r) => r.year));
  await Promise.all([t.waitForEvent('download'), t.click('#save')]);
  const ft = await t.evaluate(() => window.__ft);
  const saidY = Math.max(...ft.filter(([s]) => /^said /.test(s)).map(([, y]) => y)), ctaY = (ft.find(([s]) => /^Can you beat it/.test(s)) || [, -1])[1];
  ok(ft.filter(([s]) => /^said /.test(s)).length === 5 && !ft.some(([s]) => /undefined/.test(s)), 'share card: five "said <year>" lines, none undefined');
  ok(ctaY - saidY >= 44, `share card: call to play sits below the guesses row (said y ${saidY}, call y ${ctaY})`);
  await t.context().close();
  const q = await page(390, 844);
  await q.goto(base);
  const far = house().map((r) => r.year <= 1860 ? 1940 : 1790);
  await play(q, far);
  ok(/Time traveler, lost/.test(await q.textContent('#e-verdict')) && await q.$eval('#e-object', (e) => !e.hidden && /verdict-time-traveler-/.test(e.getAttribute('src'))), 'r4: a low score shows the unmarked compass');
  await q.context().close();
}
// robots.txt
{ const r = await (await fetch(base + 'robots.txt')).text(); ok(/Disallow: \//.test(r), 'robots.txt disallows all'); }
await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
