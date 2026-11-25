import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[390, 844], [1280, 800]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 600 })).newPage();
  await p.route('**/img/*.webp', async (r) => { await new Promise((ok) => setTimeout(ok, 2500)); r.continue(); });
  await p.goto(process.argv[2], { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(800);
  const before = await p.locator('#panel').boundingBox(), ib = await p.locator('#art').boundingBox();
  await p.waitForTimeout(3000);
  const after = await p.locator('#panel').boundingBox(), ia = await p.locator('#art').boundingBox();
  console.log(w, 'panel y before/after', before.y, after.y, 'art', JSON.stringify([ib.width, ib.height]), JSON.stringify([ia.width, ia.height]));
}
await b.close();
