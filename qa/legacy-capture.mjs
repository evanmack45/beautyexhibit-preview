// Records the five images old #s= links show on the site as deployed before the pool grew.
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
const base = 'https://evanmack45.github.io/beautyexhibit-preview/';
const b = await chromium.launch({ channel: 'chrome' }), out = {};
for (const seed of [987654, 20261125, 1, 4294967295, 123456789]) {
  const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const h = `s=${seed.toString(36)}.250`; await p.goto(`${base}?x=${Date.now()}#${h}`); await p.waitForTimeout(500);
  const ids = [];
  for (let i = 0; i < 5; i++) { ids.push((await p.getAttribute('#art', 'src')).replace(/^img\/|\.webp$/g, '')); await p.fill('#year-in', '1850'); await p.click('#lock'); await p.click('#next'); }
  out[h] = ids; console.log(h, ids.join(','));
  await p.context().close();
}
await b.close();
writeFileSync(new URL('legacy-fixture.json', import.meta.url), JSON.stringify({ capturedFrom: base, capturedAt: new Date().toString(), links: out }, null, 1));
