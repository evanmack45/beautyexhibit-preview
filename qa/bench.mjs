import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [name, url] of [['timeguessr', 'https://timeguessr.com/'], ['chronophoto', 'https://www.chronophoto.app/'], ['whentaken', 'https://whentaken.com/']]) {
  for (const [w, h] of [[390, 844], [1280, 800]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, isMobile: w < 600 });
    try { await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 }); await p.waitForTimeout(3500); await p.screenshot({ path: `bench/${name}-${w}.png` }); console.log(name, w, 'ok', await p.title()); }
    catch (e) { console.log(name, w, 'fail', e.message.slice(0, 80)); }
    await p.close();
  }
}
await b.close();
