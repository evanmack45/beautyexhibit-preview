# Prior art for B1 Beauty Year (2026-11-25)

I searched GitHub and X before building (prior-art-first skill).

## GitHub
- antoinecstl/timeguessr_AI. A TimeGuessr helper bot. Not a game we can reuse.
- fdelberghe/colleague_guesser. A TimeGuessr clone for office photos. Useful only for its round and score loop.
- dursus/TimeGuessr-Phone-Orientation. A layout tweak for TimeGuessr on phones.
- alexheungshing/hk-timeguessr (MIT). A Hong Kong photo year game. This is the closest open code, but it is built around a map and location.
- kimbach/fasHISTOnista. A 2013 HACK4DK game where you guess the decade of museum fashion images. This is the closest idea, but the project is dead and only guesses decades.

Decision: build our own. The game is about 200 lines, and none of these repos fit no-tracker, self-hosted, year-precise play on public domain fashion images.

## X
- https://x.com/HistoryInPics/status/1899981987169132810. "100 years of beauty: Mexico", 114,352 views (2025-03-13). This shows people want "what did beauty look like in year X".
- https://x.com/Victorokeke_/status/1933545541796819198 (5,769 views), https://x.com/Sana2021dec24Dr/status/1945754106670596493 and https://x.com/Kaaliyug/status/1972207225667309993 are more "beauty through the decades" posts.

## Pitch evidence
- TimeGuessr on Hacker News, 328 points: https://news.ycombinator.com/item?id=44233063
- Chronophoto on Reddit, score 4,712; site chronophoto.app

## Benchmarks (screens in qa/bench/, 390 and 1280)
| Site | What it does well | Third-party requests on load (qa/bench/third-party.txt) |
|---|---|---|
| Chronophoto (chronophoto.app) | Best match. Five rounds, a year slider and a daily set | 141 requests to 60 outside hosts (ads, Google Tag Manager, Criteo) |
| TimeGuessr (timeguessr.com) | Year plus map, multiplayer | 143 requests to 40 outside hosts; log-in prompt |
| WhenTaken (whentaken.com) | Daily when-and-where game with an archive | 231 requests to 84 outside hosts; Black Friday upsell on load |

Best prior art: Chronophoto.

Where Beauty Year beats it:
- Its slider starts at 1900. Ours runs from 1790 to 1940, with images from 1808 to 1928, so it covers the 19th century that photo games cannot.
- Every answer shows the license, the institution and a source link. The full credit list is on the page.
- No ads, no log-in, and 0 third-party requests (checked in e2e), compared with 141.
- The answer reads like a museum label. It shows your guess and the real year on a timeline, says what to look for, and gives "that was N years before 2026".
- The end screen is a small exhibit of your five images.
- The challenge link replays the same five images and shows your friend's score. There is also a 1080x1350 score card PNG.

Where it still loses: Chronophoto has a much larger photo pool, a daily mode and party play. We have 42 images.
