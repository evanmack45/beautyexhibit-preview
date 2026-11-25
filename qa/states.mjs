// Screens of each state: start, reveal, end. Usage: node states.mjs <url> <prefix> <w> <h>
import { chromium } from 'playwright';
const [url, pre, w, h] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const mobile = +w < 600;
const p = await b.newPage({ viewport: { width: +w, height: +h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto(url); await p.waitForTimeout(800);
await p.screenshot({ path: `${pre}-start.png` });
await p.fill('#year-in', '1890'); await p.click('#lock'); await p.waitForTimeout(600);
await p.screenshot({ path: `${pre}-reveal.png` });
await p.screenshot({ path: `${pre}-reveal-full.png`, fullPage: true });
for (let i = 1; i < 5; i++) { await p.click('#next'); await p.fill('#year-in', String(1850 + i * 15)); await p.click('#lock'); }
await p.click('#next'); await p.waitForTimeout(800);
await p.screenshot({ path: `${pre}-end.png` });
await p.screenshot({ path: `${pre}-full.png`, fullPage: true });
console.log('url', p.url(), 'errors', errs);
await b.close();
