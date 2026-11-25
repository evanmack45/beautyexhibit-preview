// Builds docs/ from data/images.json and src/. Plain node, no dependencies.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, readdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { pick, ROUNDS, MIN_YEAR, MAX_YEAR, MAX_POINTS } from './src/logic.js';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'docs');
const SITE = 'https://evanmack45.github.io/beautyexhibit-preview/';
const AFTERNIC = 'https://www.afternic.com/domain/beautyexhibit.com';
const DEFAULT_SEED = 20261125;
const raw = JSON.parse(readFileSync(join(here, 'data/images.json'), 'utf8'));

// Boundary checks: fail the build on bad data.
const fail = (m) => { throw new Error(`images.json: ${m}`); };
if (raw.length < 15) fail('fewer than 15 verified images');
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
const images = raw.map(({ id, year, title, artist, look, license, licenseTags, source, holder, w, h }) => ({ id, year, title, artist, look, license, licenseTags, source, holder, w, h }));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const first = images[pick(DEFAULT_SEED, images.length)[0]];
const byLicense = images.reduce((a, r) => ({ ...a, [r.license]: (a[r.license] || 0) + 1 }), {});
const credit = (r) => `${esc(r.title)}${r.artist && r.artist !== r.holder ? `, ${esc(r.artist)}` : ''}${r.holder ? `, ${esc(r.holder)}` : ''}`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Beauty Year: guess when it was the look</title>
<meta name="description" content="Five old fashion plates, ads and magazine covers. Guess the year of each one, then see the real date and the credit.">
<meta property="og:title" content="Beauty Year">
<meta property="og:description" content="Guess the year of five old beauty images. How close can you get?">
<meta property="og:image" content="${SITE}og.png">
<meta property="og:type" content="website">
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
<main class="room" id="room" data-seed="${DEFAULT_SEED}">
  <div class="intro">
    <h1>Beauty <i>Year</i></h1>
    <p class="lede">Five old fashion plates, ads and covers. Guess the year each one came out.</p>
    <p class="friend" id="friend-top" hidden></p>
  </div>
  <figure class="piece" id="piece">
    <div class="frame"><img id="art" src="img/${first.id}.webp" width="${first.w}" height="${first.h}" alt="Image 1 of ${ROUNDS}. ${esc(first.look)}" decoding="async"></div>
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
      <p class="final"><span class="big" id="e-score"></span><span class="of">out of ${ROUNDS * MAX_POINTS}</span></p>
      <p class="verdict" id="e-verdict"></p>
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
<section class="about" id="about" aria-labelledby="about-h">
  <h2 id="about-h">About the images</h2>
  <p>Every image here is out of copyright. ${byLicense['CC0 1.0']} are released as CC0 by the Rijksmuseum, and ${byLicense['Public domain']} are public domain because of their age. Each one has a single printed or catalogued year on its Wikimedia Commons page, and that year is the answer. We cropped out printed dates so the picture does not give it away.</p>
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
<script type="application/json" id="images">${JSON.stringify(images).replace(/</g, '\\u003c')}</script>
<script type="module" src="app.js"></script>
</body>
</html>
`;

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'fonts'), { recursive: true }); mkdirSync(join(out, 'img'), { recursive: true });
writeFileSync(join(out, 'index.html'), html);
for (const f of ['style.css', 'app.js', 'logic.js', 'og.png']) { try { copyFileSync(join(here, 'src', f), join(out, f)); } catch (e) { if (f !== 'og.png') throw e; } }
for (const f of readdirSync(join(here, 'src/fonts'))) copyFileSync(join(here, 'src/fonts', f), join(out, 'fonts', f));
for (const r of images) copyFileSync(join(here, 'src/img', `${r.id}.webp`), join(out, 'img', `${r.id}.webp`));
writeFileSync(join(out, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
writeFileSync(join(out, '.nojekyll'), '');
console.log(`built ${out}: ${images.length} images (${JSON.stringify(byLicense)}), default seed ${DEFAULT_SEED}`);
