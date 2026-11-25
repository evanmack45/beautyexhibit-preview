import { game, points, readYear, encode, decode, verdict, ROUNDS, MIN_YEAR, MAX_YEAR, MAX_POINTS, MAX_SEED } from './logic.js';

const $ = (id) => document.getElementById(id);
const images = JSON.parse($('images').textContent), legacyIds = JSON.parse($('legacy').textContent);
const room = $('room'), DEFAULT_SEED = Number(room.dataset.seed);
const NOW = new Date().getFullYear();
const num = (n) => n.toLocaleString('en-US');
let seed, legacy, order, round, guesses, friend;

function start(s, friendScore, old = false) {
  seed = s; friend = friendScore; legacy = old; round = 0; guesses = [];
  order = game(seed, legacy, images, legacyIds).map((i) => images[i]);
  history.replaceState(null, '', `#${encode(seed, friend, legacy)}`);
  $('friend-top').hidden = friend == null;
  if (friend != null) $('friend-top').textContent = `A friend scored ${friend} on these five. Your turn.`;
  $('end').hidden = true; $('wall').hidden = true; $('label').hidden = true; $('guess').hidden = false;
  show();
}

function show() {
  const r = order[round], art = $('art');
  art.src = `img/${r.id}.webp`; art.width = r.w; art.height = r.h;
  art.alt = `Image ${round + 1} of ${ROUNDS}. ${r.look}`;
  $('count').textContent = `Image ${round + 1} of ${ROUNDS}`;
  $('piece').hidden = false;
  setYear(1870); hint();
  const nx = order[round + 1]; if (nx) new Image().src = `img/${nx.id}.webp`;
}

function setYear(y) { $('slider').value = y; $('year-in').value = y; ago(y); }
function ago(y) { $('ago').textContent = `${num(NOW - y)} years ago`; }
function hint(err) {
  const h = $('hint'), inp = $('year-in');
  h.textContent = err || 'Drag, type, or use the arrow keys.';
  h.classList.toggle('err', !!err);
  if (err) inp.setAttribute('aria-invalid', 'true'); else inp.removeAttribute('aria-invalid');
}

$('slider').addEventListener('input', (e) => { $('year-in').value = e.target.value; ago(+e.target.value); hint(); });
$('year-in').addEventListener('input', (e) => {
  const v = e.target.value.replace(/\D/g, '').slice(0, 4);
  if (v !== e.target.value) e.target.value = v;
  const r = readYear(v);
  if (r.year) { $('slider').value = r.year; ago(r.year); hint(); }
  else if (v.length === 4) hint(r.error); else { $('ago').textContent = ''; hint(); }
});
$('year-in').addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
  e.preventDefault();
  const cur = readYear(e.target.value).year ?? Number($('slider').value);
  setYear(Math.min(MAX_YEAR, Math.max(MIN_YEAR, cur + (e.key === 'ArrowUp' ? 1 : -1)))); hint();
});

$('guess').addEventListener('submit', (e) => {
  e.preventDefault();
  const r = readYear($('year-in').value);
  if (r.error) { hint(r.error); $('year-in').focus(); return; }
  reveal(r.year);
});

function reveal(g) {
  const r = order[round], p = points(g, r.year), off = Math.abs(g - r.year);
  guesses.push(g);
  $('a-year').textContent = r.year;
  $('a-off').textContent = off === 0 ? `You said ${g}. Exactly right.` : `You said ${g}. Off by ${off} ${off === 1 ? 'year' : 'years'}.`;
  const pos = (y) => `${((y - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}%`;
  $('a-line').querySelector('.g').style.left = pos(g);
  $('a-line').querySelector('.t').style.left = pos(r.year);
  $('a-pts').textContent = `${p} of ${MAX_POINTS} points`;
  $('a-look').textContent = `Look for ${r.look.charAt(0).toLowerCase()}${r.look.slice(1)}`;
  $('a-then').textContent = `That was ${num(NOW - r.year)} years before ${NOW}.`;
  const c = $('a-credit'); c.textContent = '';
  c.append(`${r.title}${r.artist && r.artist !== r.holder ? `, ${r.artist}` : ''}${r.holder ? `, ${r.holder}` : ''}. ${r.license === 'CC0 1.0' ? 'CC0 1.0' : 'Public domain'}. `);
  const a = document.createElement('a'); a.href = r.source; a.textContent = 'Source on Wikimedia Commons'; c.append(a);
  $('next').textContent = round === ROUNDS - 1 ? 'See my score' : 'Next image';
  $('guess').hidden = true; $('label').hidden = false; $('next').focus({ preventScroll: true });
  $('label').scrollIntoView({ block: 'nearest' });
}

$('next').addEventListener('click', () => {
  round += 1;
  $('label').hidden = true;
  if (round < ROUNDS) { $('guess').hidden = false; show(); $('year-in').focus({ preventScroll: true }); return; }
  finish();
});

const total = () => guesses.reduce((s, g, i) => s + points(g, order[i].year), 0);

function finish() {
  const t = total();
  $('piece').hidden = true; $('friend-top').hidden = true;
  $('e-score').textContent = t; $('e-verdict').textContent = verdict(t);
  const f = $('friend');
  f.hidden = friend == null;
  if (friend != null) f.textContent = t > friend ? `You beat your friend's ${friend}.` : t === friend ? `A tie with your friend's ${friend}.` : `Your friend's ${friend} still stands.`;
  const ol = $('recap'); ol.textContent = '';
  order.forEach((r, i) => {
    const li = document.createElement('li'), im = document.createElement('img');
    im.loading = 'lazy'; im.src = `img/${r.id}.webp`; im.alt = ''; im.width = 60; im.height = Math.round(60 * r.h / r.w);
    const tx = document.createElement('span');
    tx.innerHTML = `<b>${r.year}</b> You said ${guesses[i]}. ${points(guesses[i], r.year)} points.`;
    li.append(im, tx); ol.append(li);
  });
  const wall = $('wall'); wall.textContent = '';
  order.forEach((r, i) => {
    const fig = document.createElement('figure'), fr = document.createElement('div'), im = document.createElement('img'), cap = document.createElement('figcaption');
    fr.className = 'frame'; im.loading = 'lazy'; im.src = `img/${r.id}.webp`; im.alt = ''; im.width = r.w; im.height = r.h; fr.append(im);
    cap.innerHTML = `<b>${r.year}</b> you said ${guesses[i]}`; fig.append(fr, cap); wall.append(fig);
  });
  wall.hidden = false;
  history.replaceState(null, '', `#${encode(seed, t, legacy)}`);
  $('msg').textContent = '';
  $('end').hidden = false; $('e-score').focus?.();
  $('room').scrollIntoView({ block: 'start' });
}

function link() { return `${location.origin}${location.pathname}#${encode(seed, total(), legacy)}`; }

$('copy').addEventListener('click', async () => {
  const url = link();
  try { await navigator.clipboard.writeText(url); $('msg').textContent = 'Link copied. It holds these five images and your score.'; }
  catch { $('msg').textContent = `Copy this link: ${url}`; }
});

$('again').addEventListener('click', () => {
  const a = new Uint32Array(1); crypto.getRandomValues(a);
  start((a[0] % (MAX_SEED - 1)) + 1, null);
  $('year-in').focus({ preventScroll: true });
  $('room').scrollIntoView({ block: 'start' });
});

const loadImg = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });

async function card() {
  await Promise.all([document.fonts.load('italic 600 80px "Bodoni Moda"'), document.fonts.load('600 80px "Bodoni Moda"'), document.fonts.load('500 30px "Jost"')]);
  const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d'), t = total();
  x.fillStyle = '#1a1411'; x.fillRect(0, 0, W, H);
  const g = x.createRadialGradient(W / 2, 120, 40, W / 2, 300, 900); g.addColorStop(0, 'rgba(255,214,170,0.16)'); g.addColorStop(1, 'rgba(255,214,170,0)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.textAlign = 'center'; x.fillStyle = '#f3e7d6';
  x.font = 'italic 600 84px "Bodoni Moda"'; x.fillText('Beauty Year', W / 2, 150);
  x.fillStyle = '#c9a46a'; x.font = '600 220px "Bodoni Moda"'; x.fillText(String(t), W / 2, 400);
  x.fillStyle = '#f3e7d6'; x.font = '500 38px "Jost"'; x.fillText(`out of ${ROUNDS * MAX_POINTS}. ${verdict(t)}.`, W / 2, 470);
  const imgs = await Promise.all(order.map((r) => loadImg(`img/${r.id}.webp`)));
  const cw = 176, gap = 18, x0 = (W - (cw * ROUNDS + gap * (ROUNDS - 1))) / 2, top = 560, ch = 250;
  imgs.forEach((im, i) => {
    const cx = x0 + i * (cw + gap), s = Math.max(cw / im.width, ch / im.height), sw = cw / s, sh = ch / s;
    x.fillStyle = '#c9a46a'; x.fillRect(cx - 4, top - 4, cw + 8, ch + 8);
    x.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, cx, top, cw, ch);
    const r = order[i];
    x.fillStyle = '#f3e7d6'; x.font = '600 46px "Bodoni Moda"'; x.fillText(String(r.year), cx + cw / 2, top + ch + 64);
    x.fillStyle = '#e8b9b0'; x.font = '500 26px "Jost"'; x.fillText(`said ${guesses[i]}`, cx + cw / 2, top + ch + 104);
  });
  x.fillStyle = '#f3e7d6'; x.font = '500 34px "Jost"';
  x.fillText('Can you beat it? Play Beauty Year at', W / 2, 1110);
  x.fillStyle = '#c9a46a'; x.font = '500 30px "Jost"'; x.fillText('evanmack45.github.io/beautyexhibit-preview', W / 2, 1160);
  x.fillStyle = '#9c8b7a'; x.font = '500 24px "Jost"'; x.fillText('Images public domain or CC0, via Wikimedia Commons', W / 2, 1270);
  return cv;
}

$('save').addEventListener('click', async () => {
  try {
    const cv = await card();
    const blob = await new Promise((ok) => cv.toBlob(ok, 'image/png'));
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `beauty-year-${total()}.png`;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    $('msg').textContent = 'Score card saved.';
  } catch { $('msg').textContent = 'Could not make the image here. The link still works.'; }
});

function fromHash() {
  const h = decode(location.hash);
  if (location.hash && location.hash !== '#about' && !h) {
    start(DEFAULT_SEED, null);
    $('friend-top').hidden = false; $('friend-top').textContent = 'That link did not work, so here is the house set of five.';
    return;
  }
  if (location.hash === '#about') { start(DEFAULT_SEED, null); history.replaceState(null, '', '#about'); return; }
  start(h ? h.seed : DEFAULT_SEED, h ? h.score : null, h ? h.legacy : false);
  if (!h) history.replaceState(null, '', location.pathname);
}
window.addEventListener('hashchange', () => { if (location.hash !== '#about' && location.hash !== `#${encode(seed, friend, legacy)}`) fromHash(); });
window.__card = card;
fromHash();
