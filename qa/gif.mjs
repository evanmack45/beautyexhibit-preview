// Frames for the walkthrough GIF. Usage: node gif.mjs <url> <dir> <w> <h>
import { chromium } from 'playwright';
import { mkdirSync, rmSync } from 'fs';
const [url, dir, w, h] = process.argv.slice(2); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' }); const m = +w < 600;
const p = await b.newPage({ viewport: { width: +w, height: +h }, isMobile: m, hasTouch: m, deviceScaleFactor: 1 });
let i = 0; const shot = () => p.screenshot({ path: `${dir}/f${String(i++).padStart(4, '0')}.png` });
const hold = async (n, ms = 60) => { for (let k = 0; k < n; k++) { await shot(); await p.waitForTimeout(ms); } };
const drag = async (to) => { const from = +(await p.inputValue('#slider')); for (let k = 1; k <= 10; k++) { const y = Math.round(from + (to - from) * (1 - Math.pow(1 - k / 10, 3))); await p.evaluate((y) => { const s = document.getElementById('slider'); s.value = y; s.dispatchEvent(new Event('input', { bubbles: true })); }, y); await shot(); } };
await p.goto(url, { waitUntil: 'networkidle' });
await hold(12);
for (const [k, g] of [[0, 1845], [1, 1900], [2, 1826]]) {
  await drag(g); await hold(4);
  await p.click('#lock'); await p.waitForTimeout(80); await hold(22, 50);
  await p.click('#next'); await p.waitForTimeout(250); if (m) await p.evaluate(() => scrollTo(0, 0)); await hold(4);
}
await p.fill('#year-in', '1905'); await p.click('#lock'); await p.click('#next');
await p.fill('#year-in', '1890'); await p.click('#lock'); await hold(10, 50); await p.click('#next'); await p.waitForTimeout(500);
await hold(26, 60);
if (m) { for (let k = 1; k <= 10; k++) { await p.evaluate((y) => scrollTo(0, y), k * 40); await shot(); } await hold(12); }
console.log(dir, i, 'frames'); await b.close();
