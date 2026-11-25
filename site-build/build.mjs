// Builds docs/ from data/images.json and src/. Plain node, no dependencies.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, readdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { game, ERAS, eraOf, ROUNDS, MIN_YEAR, MAX_YEAR, MAX_POINTS } from './src/logic.js';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'docs');
const SITE = 'https://beautyexhibit.com/';
const AFTERNIC = 'https://www.afternic.com/domain/beautyexhibit.com';
const DEFAULT_SEED = 20261125;
const raw = JSON.parse(readFileSync(join(here, 'data/images.json'), 'utf8'));
// The first 42 ids, frozen so #s= links made before the pool grew replay the same five.
const legacyIds = JSON.parse(readFileSync(join(here, 'data/legacy-ids.json'), 'utf8'));

// Boundary checks: fail the build on bad data.
const fail = (m) => { throw new Error(`images.json: ${m}`); };
if (raw.length < 120) fail('fewer than 120 verified images');
const ids = new Set();
for (const r of raw) {
  if (ids.has(r.id)) fail(`duplicate id ${r.id}`); ids.add(r.id);
  if (!Number.isInteger(r.year) || r.year < MIN_YEAR || r.year > MAX_YEAR) fail(`bad year on ${r.id}`);
  if (!['CC0 1.0', 'Public domain'].includes(r.license)) fail(`bad license on ${r.id}`);
  if (!r.licenseTags?.length) fail(`no license tag on ${r.id}`);
  if (!/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(r.source)) fail(`bad source on ${r.id}`);
  if (!r.title || !r.look || /[—<>]/.test(r.title + r.look)) fail(`bad copy on ${r.id}`);
  if (!existsSync(join(here, 'src/img', `${r.id}.webp`))) fail(`missing image ${r.id}`);
}
if (legacyIds.length !== 42 || legacyIds.some((id, i) => raw[i]?.id !== id)) fail('legacy ids must stay the first 42 records, in order');
const perEra = ERAS.map((_, e) => raw.filter((r) => !r.legacyOnly && eraOf(r.year) === e).length);
if (perEra.some((n) => n < 20)) fail(`an era has fewer than 20 images: ${perEra}`);
const images = raw.map(({ id, year, title, artist, look, license, licenseTags, source, holder, w, h, legacyOnly }) => ({ id, year, title, artist, look, license, licenseTags, source, holder, w, h, ...(legacyOnly ? { legacyOnly: true } : {}) }));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const first = images[game(DEFAULT_SEED, false, images, legacyIds)[0]];
const byLicense = images.reduce((a, r) => ({ ...a, [r.license]: (a[r.license] || 0) + 1 }), {});
const credit = (r) => `${esc(r.title)}${r.artist && r.artist !== r.holder ? `, ${esc(r.artist)}` : ''}${r.holder ? `, ${esc(r.holder)}` : ''}`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="${SITE}">
<meta property="og:url" content="${SITE}">
<title>Beauty Year: guess when it was the look</title>
<meta name="description" content="Five old fashion plates from the 1790s to the 1930s. Guess the year of each one, then see the real date and the credit.">
<meta property="og:title" content="Beauty Year">
<meta property="og:description" content="Guess the year of five old fashion plates. How close can you get?">
<meta property="og:image" content="${SITE}og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A Regency bonnet, a plumed lace hat and a 1920s cloche in a triangle above a lace fan and glove, hand-coloured on aged paper.">
<meta property="og:type" content="website">
<link rel="preload" as="image" href="img/hero.webp" imagesrcset="img/hero-800.webp 800w, img/hero.webp 1280w, img/hero-1920.webp 1920w" imagesizes="100vw">
<meta name="theme-color" content="#1a1411">
<link rel="preload" href="fonts/bodoni.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/jost.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="img/${first.id}.webp" as="image">
<link rel="stylesheet" href="style.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect x='5' y='3' width='22' height='26' fill='%23c9a46a'/%3E%3Crect x='9' y='7' width='14' height='18' fill='%23c8203a'/%3E%3C/svg%3E">
</head>
<body>
<header class="top">
  <a class="brand" href="./">Beauty <i>Exhibit</i></a>
  <a class="toplink" href="#about">About the images</a>
</header>
<div class="mast">
  <img class="mast-art" src="img/hero.webp" srcset="img/hero-800.webp 800w, img/hero.webp 1280w, img/hero-1920.webp 1920w" sizes="100vw" width="1280" height="714" alt="A hand-coloured procession of period accessories: turban, bonnet, gloves, fan, parasol, feathered hats, cloche and beret on aged paper." fetchpriority="high" decoding="async">
  <div class="mast-copy">
    <h1>Beauty <i>Year</i></h1>
    <p class="lede">Five old fashion plates, one from each era between the 1790s and the 1930s. Guess the year each one came out.</p>
    <p class="friend" id="friend-top" hidden></p>
  </div>
</div>
<main class="room" id="room" data-seed="${DEFAULT_SEED}">
  <figure class="piece" id="piece">
    <div class="frame"><img id="art" src="img/${first.id}.webp" width="${first.w}" height="${first.h}" style="--ar:${(first.w / first.h).toFixed(4)}" alt="Image 1 of ${ROUNDS}. ${esc(first.look)}" decoding="async"></div>
    <figcaption class="count" id="count">Image 1 of ${ROUNDS}</figcaption>
  </figure>
  <div class="wall" id="wall" hidden aria-hidden="true"></div>
  <section class="panel" id="panel" aria-live="polite">
    <form class="guess" id="guess" novalidate>
      <label class="q" for="year-in">What year is it?</label>
      <div class="readout"><input id="year-in" class="year" inputmode="numeric" autocomplete="off" value="1870" aria-describedby="hint"><span class="ago" id="ago" aria-hidden="true"></span></div>
      <input id="slider" class="slider" type="range" min="${MIN_YEAR}" max="${MAX_YEAR}" step="1" value="1870" aria-label="Year slider">
      <div class="ends" aria-hidden="true"><span>${MIN_YEAR}</span><span>${MAX_YEAR}</span></div>
      <p class="hint" id="hint">Drag, type, or use the arrow keys.</p>
      <button class="btn hot" id="lock" type="submit">Lock in my guess</button>
    </form>
    <div class="label" id="label" hidden>
      <p class="answer"><span class="big" id="a-year"></span><span class="off" id="a-off"></span></p>
      <div class="line" id="a-line" aria-hidden="true"><i class="tick g"></i><i class="tick t"></i></div>
      <p class="key" aria-hidden="true"><i class="tick t"></i>Real year <i class="tick g"></i>Your guess</p>
      <p class="pts" id="a-pts"></p>
      <p class="look" id="a-look"></p>
      <p class="then" id="a-then"></p>
      <p class="credit" id="a-credit"></p>
      <button class="btn hot" id="next" type="button">Next image</button>
    </div>
    <div class="end" id="end" hidden>
      <p class="friend" id="friend" hidden></p>
      <div class="end-head">
      <div>
      <p class="final"><span class="big" id="e-score"></span><span class="of">out of ${ROUNDS * MAX_POINTS}</span></p>
      <p class="verdict" id="e-verdict"></p>
      </div>
      <img id="e-object" src="img/verdict-curator-400.webp" srcset="img/verdict-curator-400.webp 400w, img/verdict-curator-1024.webp 1024w" sizes="112px" width="400" height="400" alt="" decoding="async" hidden>
      </div>
      <ol class="recap" id="recap"></ol>
      <div class="actions">
        <button type="button" class="btn hot" id="save">Save score card</button>
        <button type="button" class="btn" id="copy">Copy challenge link</button>
        <button type="button" class="btn ghost" id="again">Play new images</button>
      </div>
      <p class="msg" id="msg" aria-live="polite"></p>
    </div>
    <noscript><p class="msg">Guessing needs JavaScript. Here is the first image to look at. It is from ${first.year}.</p></noscript>
  </section>
</main>
<img class="frieze" src="img/frieze.webp" srcset="img/frieze-800.webp 800w, img/frieze.webp 1280w" sizes="100vw" width="1280" height="182" alt="A repeating band of small period hats, bonnets, fans and gloves in watercolour on aged paper." loading="lazy" decoding="async">
<section class="about" id="about" aria-labelledby="about-h">
  <img class="still" src="img/still.webp" srcset="img/still-480.webp 480w, img/still.webp 720w" sizes="(min-width: 700px) 280px, 60vw" width="720" height="894" alt="An open lace fan, long gloves, a pearl necklace and an embroidered pouch on a tasselled velvet cushion inside a thin gold plate border." loading="lazy" decoding="async">
  <h2 id="about-h">About the images</h2>
  <p>Every image here is out of copyright. ${byLicense['CC0 1.0']} are released as CC0 by the Rijksmuseum, and ${byLicense['Public domain']} are public domain because of their age. Each one has a single printed or catalogued year on its Wikimedia Commons page, and that year is the answer. We cropped out printed dates so the picture does not give it away.</p>
  <p>Each game takes one image from each of five eras, so every set runs from the 1790s to the 1930s in a mixed order.</p>
  <p>A score is 100 for the exact year, minus 3 for every year you are off. Your guesses stay in this page. There are no accounts, cookies or trackers. The challenge link holds the round number and your score, nothing else.</p>
  <details class="all">
    <summary>All ${images.length} images and their credits</summary>
    <ul>${images.map((r) => `<li><span class="yr">${r.year}</span> <a href="${esc(r.source)}">${credit(r)}</a>. ${esc(r.license)}.</li>`).join('')}</ul>
  </details>
</section>
<footer class="foot">
  <p>Images from Wikimedia Commons, credited on each answer. Beauty Exhibit is a small game, not linked to any brand shown.</p>
  <p><a href="${AFTERNIC}">This domain is for sale.</a></p>
</footer>
<script type="application/json" id="legacy">${JSON.stringify(legacyIds)}</script>
<script type="application/json" id="images">${JSON.stringify(images).replace(/</g, '\\u003c')}</script>
<script type="module" src="app.js"></script>
</body>
</html>
`;

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'fonts'), { recursive: true }); mkdirSync(join(out, 'img'), { recursive: true });
writeFileSync(join(out, 'index.html'), html);
for (const f of ['style.css', 'app.js', 'logic.js']) copyFileSync(join(here, 'src', f), join(out, f));
for (const f of readdirSync(join(here, 'src/fonts'))) copyFileSync(join(here, 'src/fonts', f), join(out, 'fonts', f));
for (const f of readdirSync(join(here, 'src/img'))) copyFileSync(join(here, 'src/img', f), join(out, 'img', f));
copyFileSync(join(here, 'src/img/og.jpg'), join(out, 'og.jpg'));
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE}</loc></url></urlset>\n`);
writeFileSync(join(out, 'CNAME'), 'beautyexhibit.com\n');
writeFileSync(join(out, '.nojekyll'), '');
console.log(`built ${out}: ${images.length} images (${JSON.stringify(byLicense)}), per era ${perEra}, default seed ${DEFAULT_SEED}`);
