import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const p = await (await b.newContext({ viewport: { width: 412, height: 823 }, isMobile: true })).newPage();
await p.addInitScript(() => { window.__ls = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__ls.push({ v: e.value, t: Math.round(e.startTime), src: e.sources.map((s) => (s.node?.id || s.node?.className || s.node?.nodeName) + ' ' + JSON.stringify(s.previousRect) + '->' + JSON.stringify(s.currentRect)) }))).observe({ type: 'layout-shift', buffered: true }); });
await p.goto(process.argv[2]); await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(() => window.__ls), null, 1), await p.getAttribute('#art', 'src'));
await b.close();
