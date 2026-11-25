import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[390, 844], [1280, 800]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 600 })).newPage();
  for (const [tag, hash] of [['house', ''], ['wide', '#g=' + (process.argv[2] || 'abc')]]) {
    await p.goto('http://localhost:8945/' + hash); await p.waitForTimeout(600);
    const bx = await p.locator('#art').boundingBox(), nat = await p.evaluate(() => [art.naturalWidth, art.naturalHeight, art.src.split('/').pop()]);
    console.log(w, tag, nat.join(' '), JSON.stringify(bx), 'ratio diff', (bx.width / bx.height - nat[0] / nat[1]).toFixed(3));
    await p.screenshot({ path: `shots/v3-${w}-${tag}.png` });
  }
}
await b.close();
