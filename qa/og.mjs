// Makes src/og.png (1200x630) and a sample score card PNG from the built page.
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto('http://localhost:8945/'); await p.waitForTimeout(500);
const og = await p.evaluate(async () => {
  await document.fonts.load('italic 600 80px "Bodoni Moda"'); await document.fonts.load('500 30px "Jost"');
  const cv = document.createElement('canvas'); cv.width = 1200; cv.height = 630; const x = cv.getContext('2d');
  x.fillStyle = '#1a1411'; x.fillRect(0, 0, 1200, 630);
  const ids = ['4', '269', '234'], ims = await Promise.all(ids.map((id) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = `img/${id}.webp`; })));
  ims.forEach((im, k) => { const h = 420, w = Math.round(im.width * h / im.height), cx = 560 + k * 205 - (k ? 0 : 0); x.fillStyle = '#c9a46a'; x.fillRect(cx - 6, 105 - 6, 190 + 12, h + 12); const s = Math.max(190 / im.width, h / im.height); x.drawImage(im, (im.width - 190 / s) / 2, (im.height - h / s) / 2, 190 / s, h / s, cx, 105, 190, h); });
  x.fillStyle = '#f3e7d6'; x.font = '600 96px "Bodoni Moda"'; x.fillText('Beauty', 60, 250);
  x.fillStyle = '#c9a46a'; x.font = 'italic 600 96px "Bodoni Moda"'; x.fillText('Year', 60, 350);
  x.fillStyle = '#e4d6c3'; x.font = '500 30px "Jost"'; x.fillText('Guess the year of five', 62, 430); x.fillText('old beauty images.', 62, 470);
  return cv.toDataURL('image/png');
});
writeFileSync('../site-build/src/og.png', Buffer.from(og.split(',')[1], 'base64'));
await p.fill('#year-in', '1890'); await p.click('#lock');
for (let i = 1; i < 5; i++) { await p.click('#next'); await p.fill('#year-in', String(1850 + i * 15)); await p.click('#lock'); }
await p.click('#next');
const card = await p.evaluate(async () => (await window.__card()).toDataURL('image/png'));
writeFileSync('card.png', Buffer.from(card.split(',')[1], 'base64'));
await b.close(); console.log('ok');
