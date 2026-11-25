import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const url of ['https://timeguessr.com/', 'https://www.chronophoto.app/', 'https://whentaken.com/']) {
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const host = new URL(url).hostname.replace(/^www\./, ''), hosts = new Set(); let n = 0;
  p.on('request', (r) => { const h = new URL(r.url()).hostname; if (!h.endsWith(host)) { hosts.add(h); n++; } });
  await p.goto(url, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(6000);
  console.log(host, 'third-party requests', n, 'hosts', hosts.size, [...hosts].slice(0, 12).join(' '));
  await p.close();
}
await b.close();
