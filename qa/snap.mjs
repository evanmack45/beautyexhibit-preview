// Saves the reveal and end states as static HTML in docs/qa-snap/ for impeccable. Not deployed.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto('http://localhost:8945/'); await p.fill('#year-in', '1890'); await p.click('#lock');
const strip = () => p.evaluate(() => { document.querySelectorAll('script').forEach((s) => s.remove()); return '<!doctype html>' + document.documentElement.outerHTML; });
mkdirSync('../docs/qa-snap', { recursive: true });
writeFileSync('../docs/qa-snap/reveal.html', (await strip()).replaceAll('href="style.css"', 'href="../style.css"').replaceAll('src="img/', 'src="../img/').replaceAll('url(fonts', 'url(../fonts'));
await p.goto('http://localhost:8945/'); 
for (let i = 0; i < 5; i++) { await p.fill('#year-in', String(1850 + i * 15)); await p.click('#lock'); await p.click('#next'); }
writeFileSync('../docs/qa-snap/end.html', (await strip()).replaceAll('href="style.css"', 'href="../style.css"').replaceAll('src="img/', 'src="../img/'));
await b.close();
