// Pure game logic shared by the page, the build and the tests. No DOM.
export const ROUNDS = 5, MIN_YEAR = 1790, MAX_YEAR = 1940, MAX_POINTS = 100, MAX_SEED = 2 ** 32 - 1;

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Five image indexes for a seed, spread so a round never repeats an image.
export function pick(seed, count) {
  const rnd = mulberry32(seed), idx = [...Array(count).keys()];
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx.slice(0, ROUNDS);
}

// Five eras. A game takes one image from each, so every game spans 1790 to 1940.
export const ERAS = [[1790, 1819], [1820, 1849], [1850, 1879], [1880, 1909], [1910, 1940]];
export const eraOf = (year) => ERAS.findIndex(([a, b]) => year >= a && year <= b);

// Current games: one seeded image per era, then a seeded shuffle of the five.
// Images marked legacyOnly stay in old links but are left out of new games.
export function pickSpread(seed, years, skip = []) {
  const rnd = mulberry32(seed), buckets = ERAS.map(() => []);
  years.forEach((y, i) => { if (!skip[i]) buckets[eraOf(y)].push(i); });
  const out = buckets.map((b) => b[Math.floor(rnd() * b.length)]);
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

// Image indexes for a game. Old #s= links replay over the frozen first 42 images.
export function game(seed, legacy, images, legacyIds) {
  if (!legacy) return pickSpread(seed, images.map((r) => r.year), images.map((r) => !!r.legacyOnly));
  const at = new Map(images.map((r, i) => [r.id, i]));
  return pick(seed, legacyIds.length).map((i) => at.get(legacyIds[i]));
}

// 100 for the exact year, 3 points off per year, never below 0.
export const points = (guess, year) => Math.max(0, MAX_POINTS - 3 * Math.abs(guess - year));

// Reads a typed year. Returns { year } or { error }.
export function readYear(text) {
  const t = String(text ?? '').trim();
  if (!t) return { error: 'Type a year, like 1895.' };
  if (!/^\d{4}$/.test(t)) return { error: 'Use four digits, like 1895.' };
  const y = Number(t);
  if (y < MIN_YEAR || y > MAX_YEAR) return { error: `Pick a year from ${MIN_YEAR} to ${MAX_YEAR}.` };
  return { year: y };
}

// Link state: #g=<seed base36>.<score> for current games, #s= for links made
// before the pool grew. Score is optional (0 to 500).
export const encode = (seed, score, legacy = false) => `${legacy ? 's' : 'g'}=${seed.toString(36)}${score == null ? '' : `.${score}`}`;
export function decode(hash) {
  const m = /^#?([sg])=([0-9a-z]{1,7})(?:\.(\d{1,3}))?$/.exec(hash || '');
  if (!m) return null;
  const legacy = m[1] === 's', seed = parseInt(m[2], 36), score = m[3] == null ? null : Number(m[3]);
  if (!(seed >= 1 && seed <= MAX_SEED)) return null;
  if (score != null && !(score >= 0 && score <= ROUNDS * MAX_POINTS)) return null;
  return { seed, score, legacy };
}

export function verdict(total) {
  const max = ROUNDS * MAX_POINTS;
  if (total >= max * 0.85) return 'Curator level';
  if (total >= max * 0.65) return 'Sharp eye';
  if (total >= max * 0.4) return 'Getting warmer';
  return 'Time traveler, lost';
}
