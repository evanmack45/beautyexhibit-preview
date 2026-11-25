# DONE 2026-11-25 2:46 AM CT (Gizmo): Beauty Year pool grown from 42 to 168 verified PD/CC0 images, live

Live at https://evanmack45.github.io/beautyexhibit-preview/ (commits c0883e7 and 32d9886 on master). Live files match the local build by md5 (index.html, app.js, logic.js, style.css, robots.txt, sample images). Pages cname is null. No DNS, Afternic or registrar changes. Nothing posted, nobody messaged.

## JOB 0, T1 price re-check
58 OK, 0 CHANGED, 0 UNREADABLE. Nothing to eye-check.

## Count
- 168 images in images.json. 164 are used in new games.
- 4 older images with drawn period children (ids 36, 37, 133, 280) are marked legacyOnly. They stay only so old challenge links still replay, and new games never show them.
- 126 new images were added. Every one was checked by eye on contact sheets, before and after cropping.

## Era histogram (all 168)
| Decade | Images |
|---|---|
| 1790s | 10 |
| 1800s | 13 |
| 1810s | 12 |
| 1820s | 12 |
| 1830s | 10 |
| 1840s | 9 |
| 1850s | 14 |
| 1860s | 7 |
| 1870s | 6 |
| 1880s | 10 |
| 1890s | 10 |
| 1900s | 10 |
| 1910s | 11 |
| 1920s | 24 |
| 1930s | 10 |

- Pre-1850 is 66 (target 15+). 1920s and 1930s together are 34 (target 20+).
- The 1910s are now 11 of 168, down from 11 of 42.
- New-game eras (one image is drawn from each): 1790 to 1819 has 35, 1820 to 1849 has 31, 1850 to 1879 has 24, 1880 to 1909 has 29, 1910 to 1940 has 45.

## License and source breakdown
- CC0 1.0: 119. All are Rijksmuseum files on Wikimedia Commons, with CC-zero templates.
- Public domain: 49. These are Commons files with PD templates (PD-old family, PD-US, PD-US-expired and similar).
- Every image passed the same four checks:
  1. Commons API extmetadata License is pd or cc0.
  2. A PD or CC-zero template is present.
  3. The date is a single exact year, with no circa, question mark or range.
  4. The file is jpeg, png or tiff.
- For 1925 and later, only CC0 or US PD templates count. All new 1925+ images are Rijksmuseum CC0.
- The Met, Smithsonian, AIC, NYPL and LoC were allowed but not needed. Earlier the AIC API was behind a Cloudflare challenge and the Met API returned 403, and I did not work around either.
- Data:
  - site-build/data/images.json records id, year, title, artist, look, license, licenseTags, source, file, holder, commonsDate, crop and size.
  - Crops are in data/raw/crops2.json.
  - Harvest scripts are data/raw/commons2.py (categories) and data/raw/commons-search.py (search, for the thin 1840s, 1860s and 1890s).

## Exclusions (new candidates, 181 shortlisted from 1,092 harvested)
- Children in the picture, 20: n43, n57, n78, n82, n88, n93, n135, m4, m7, m12, m13, m14, m16, m17, m18, m19, m20, m21, m25, m27, m30, n81. A keyword filter also dropped more candidates before the shortlist.
- Text-heavy ads, covers or mastheads where the date or most of the image is print, 14: n76, n77, n80, n84 (a year printed under every figure), n90, n97, n99, n101, n112, n113, n114, n115, n116, n117, n136.
- Period costume or carnival dress, not a fashion of its year: n60, n61, n107, n109. Satire: n32 (crowd caricature).
- Duplicates or near duplicates: n8 (same plate as n2), n108 (same sheet as n104).
- The commons date does not match the year in the file name: n49 (1832 vs 1834), n51 (1835 vs 1834), n103 (1902 vs Jan 1903).
- Product photos, not looks: n137, n139. Faint or poor scans: m1, n130.
- Four-digit model numbers that read like years: n144, n146. A printed date I could not crop cleanly: n0.
- n53 is titled young lady's dress and may show a girl.
- Earlier rule kept: no racist or body-shaming copy. None of the new images carry ad copy.

## Picker and links
- New games take one seeded image from each of five eras, then shuffle their order. Every game spans the 1790s to the 1930s (5 distinct decades in 20,000 simulated games).
- New links use #g=seed.score.
- Old #s= links replay over the frozen first 42 ids (site-build/data/legacy-ids.json), so they show the same five images as before.
  - Proven against the old live site: qa/legacy-capture.mjs recorded five old links before the deploy (qa/legacy-fixture.json), and e2e replays them on the new site.
  - The build fails if those 42 records move.
- Repeat estimate:
  - Two random games share at least one image about 14% of the time (14.8% in e2e simulation). The expected overlap is 0.15 images.
  - Identical five: about 1 in 37 million.
  - Distinct sets: about 37 million.
- Page weight: only the first image is preloaded, and only the next image is fetched during a game. Recap and wall images use loading=lazy, and the credits list has no images. Lighthouse total is 345 KiB.

## Fixes found by QA
- CLS 0.292 on Lighthouse mobile (1280 gate). Cause: the round image had no size until its file arrived, so the panel jumped 300px.
  - Fix: #art gets a definite width from its aspect ratio (--ar). CLS is now 0.
  - e2e checks this by delaying images and confirming the panel stays put.
- 83 tap targets under 24px. These were inline credit links counted inside the closed details. Fix: 3px block padding on inline links and line-height 1.2 on the brand. Now 0.

## QA (live)
- e2e: 136 passed, 0 failed. Log at qa/e2e-live.log; local run at qa/e2e-local.log.
- Gate 390 + 1440: PASS, no P0 and no P1. Lighthouse 100/100/100, CLS 0, LCP 1.5 s. Results in qa/live-v3/.
- Gate 1280: PASS, no P0 and no P1. Lighthouse 100/100/100, CLS 0, LCP 1.6 s. Results in qa/live-v3-1280/.
- impeccable: 0 findings on home, reveal and end, at 390x844 and 1280x800. Files are qa/impeccable-v3-*.json.
- Fold screenshots were checked by eye at 390 and 1280.

## What still breaks or is open
- New #g= links depend on the pool. Adding or removing images later changes which five a #g= link shows. Old #s= links are frozen and safe.
- The 1860s (7) and 1870s (6) are the thinnest decades. The 1850 to 1879 era band still has 24 images in new games.
- Lede still says ads and covers. The pool is now mostly fashion plates, with a few ads and covers from the original set.
- Old GIFs and og.png show the earlier build and were not regenerated.

## Earlier: DONE 2026-11-25 1:55 AM CT (Gizmo): B1 Beauty Year live at https://evanmack45.github.io/beautyexhibit-preview/

Noindex GitHub Pages preview on the default github.io address. There is no custom domain or CNAME (Pages API returns cname null). No DNS, Afternic or registrar changes. Nothing was posted and nobody was messaged.

## Assignment
- Pitch: /workspace/magpie/pitches-2026-11-25.md, B1.
- Foil GO: /workspace/foil/weird-gate-2026-11-25.md, line 27 and the B1 section (about line 66). Foil asked for neutral captions and careful curation of old ads. I did both and dropped any image with racist or body-shaming copy (see Exclusions).
- Ownership: BOARD shows no bot owns beautyexhibit.com. BOARD lists Mason against the beautyexhibit.art Call Check asset; the brief says Ansel owns .art. Either way it is a different domain, and I did not touch it.

## What it is
A five-image game: guess the year of an old fashion plate, beauty ad or magazine cover.
- Scoring: 100 points for the exact year, minus 3 per year off.
- The answer card shows the real year, your guess on a timeline, what to look for, how many years ago it was, and the credit with license and source link.
- The end screen hangs your five images as a small exhibit and offers:
  - a 1080x1350 score card PNG
  - a challenge link `#s=<seed>.<score>` that replays the same five images and shows the friend's score.
- With no hash in the URL, the page plays the house set (seed 20261125).
- No accounts, cookies, storage, trackers or third-party requests. robots meta is noindex,nofollow, and robots.txt has Disallow: /.
- The footer link "This domain is for sale." goes to Afternic.
- Fonts are self-hosted OFL: Bodoni Moda and Jost. Licenses are in site-build/src/fonts/.

## Images: 42 verified (target 40, floor 15)
Every image comes from Wikimedia Commons and was checked through the Commons API on 2026-11-25. Each one had to pass four checks:
- extmetadata license is pd or cc0
- a PD or CC-zero template is on the page
- it has a single exact year, 1928 or earlier, with no circa or range
- the file is jpeg, png or tiff
I cropped out printed dates and looked at every crop by eye. The images are downloaded and self-hosted as webp (about 3.2 MB in total, about 77 KB each), with no hotlinking. The data is in site-build/data/images.json (id, year, title, artist, neutral look note, license, license tags, Commons source URL, holder, crop). The harvest scripts are in data/raw/.

License breakdown:
- 13 CC0 1.0 (Rijksmuseum)
- 13 public domain, US publication before 1929 (PD-US, PD-US-expired, PD-1923)
- 16 public domain, artist dead 70+ years or work 100+ years old (PD-old family, PD-Art)

Years run from 1808 to 1928. By decade: 1800s 1, 1810s 1, 1820s 1, 1830s 2, 1840s 0, 1850s 2, 1860s 4, 1870s 1, 1880s 2, 1890s 4, 1900s 4, 1910s 11, 1920s 9.

Sources tried and dropped:
- The Art Institute of Chicago API returned a Cloudflare challenge. I did not get around it.
- The Met objects API returned 403 after harvesting. I stopped and did not retry.

Exclusions and why:
- Racist imagery: Pears ad #251.
- Caricature: #284.
- Children or babies: #255, #3, #282, #248, #250, #239, #85, and #2 (possibly a girl).
- Named man portrait: #261.
- Stereotype risk: #236.
- Named endorser in a Pears ad: #252.
- Celebrity names: #281.
- Text only or text heavy: #271, #273.
- Weak verification:
  - #184 (filename and date disagree)
  - #28 (PD-self on an 1845 plate)
  - #132 (unknown source)
  - #32 (likely misdated)
- Crop problems: #31, #238, #272, #17, #84, #213.
- Odd footer copy: #243 Delineator ("A child can not be marked").

The only real names on the site are the artists in the credits, plus the actress named in the 1890 La Diaphane poster itself. None of them is used for mockery.

| Year | Image | License | Source |
|---|---|---|---|
| 1808 | Kensington Garden dresses for June, Le Beau Monde | Public domain (PD-old-100-expired, PD-old-X-expired) | https://commons.wikimedia.org/wiki/File:Kensington_Garden_dresses_for_June,_fashion_plate_from_Le_Beau_Monde,_unknown_illustrator,_1808.jpg |
| 1817 | Toilette de Spectacle, Incroyables et Merveilleuses | CC0 1.0 (CC-zero) | https://commons.wikimedia.org/wiki/File:Incroyables_et_Merveilleuses,_1817,_Merveilleuse,_No._31_Toilette_de_Spectacle.,_RP-P-2009-1503.jpg |
| 1829 | Costumes Parisiens, Journal des Dames et des Modes | CC0 1.0 (CC-zero) | https://commons.wikimedia.org/wiki/File:Journal_des_Dames_et_des_Modes,_Costumes_Parisiens,_25_avril_1829,_(2689)_Mode_de_Longchamp_(..),_RP-P-2009-2544.jpg |
| 1833 | Fashion plate, University of Washington collection | Public domain (PD-old-100) | https://commons.wikimedia.org/wiki/File:1833_fashion_plate.jpg |
| 1837 | Modes de Longchamp, Petit Courrier des Dames | CC0 1.0 (CC-zero) | https://commons.wikimedia.org/wiki/File:Petit_Courrier_des_Dames,_15_avril_1837,_No._1342_Modes_de_Longchamp_(..),_RP-P-OB-103.226.jpg |
| 1853 | Le Moniteur de la Mode, plate by Jules David, Jules David | Public domain (PD-old-auto) | https://commons.wikimedia.org/wiki/File:Hand-colored_fashion_plate_1853.jpg |
| 1857 | Le Journal des Demoiselles, plate by Laure Noël, Laure Noël | Public domain (PD-old-100-expired, PD-old-X-expired) | https://commons.wikimedia.org/wiki/File:1857Le_Journal_des_Demoiselles.png |
| 1861 | Wedding dress, Englishwoman's Domestic Magazine, Jules David | Public domain (PD-old-auto) | https://commons.wikimedia.org/wiki/File:Wedding_Dress_fashion_plate_for_the_Englishwoman%27s_Domestic_Magazine_1861.jpeg |
| 1865 | The immense lace shawl, fashion plate, collection Maciet | Public domain (PD-old-100) | https://commons.wikimedia.org/wiki/File:Fashion_plate_(The_immense_shawl,point_de_gaze_or_application_d%27Angleterre).jpg |
| 1869 | Fashion plate, Manby & Balding, Paris | Public domain (PD-old) | https://commons.wikimedia.org/wiki/File:1869_Fashion_Plate.jpg |
| 1869 | Dobbins' Medicated Toilet Soap, advertising, Lithograph by Jacob Haehnlen, Philadelphia. Copyright by J.B. Dobbins. | Public domain (PD-US-1923, PD-US-expired) | https://commons.wikimedia.org/wiki/File:Dobbins%27_medicated_toilet_soap,_advertising,_1869.jpg |
| 1877 | Les Modes Parisiennes, Modèles des Grands Magasins | CC0 1.0 (CC-zero) | https://commons.wikimedia.org/wiki/File:Les_Modes_Parisiennes,_1877,_No._1761_Mod%C3%A8les_des_Grands_Magasins_(..),_RP-P-OB-103.518.jpg |
| 1881 | Dames-modegids | CC0 1.0 (CC-zero) | https://commons.wikimedia.org/wiki/File:Dames-modegids,_1_februari_1881,_No._630,_RP-P-OB-103.023.jpg |
| 1889 | Toilettes, Journal des Demoiselles | CC0 1.0 (CC-zero) | https://commons.wikimedia.org/wiki/File:Journal_des_Demoiselles,_1_mai_1889,_No._4727_Toilettes_de_Melle_Thirion,_RP-P-2009-3738.jpg |
| 1890 | La Diaphane, Poudre de Riz poster | CC0 1.0 (CC-zero) | https://commons.wikimedia.org/wiki/File:La_Diaphane._Poudre_de_Riz_,_1890,_RP-P-1912-2481.jpg |
| 1893 | Toilettes, Le Moniteur de la Mode | CC0 1.0 (CC-zero) | https://commons.wikimedia.org/wiki/File:Le_Moniteur_de_la_Mode,_1893,_Nr._2907,_No._33_Toilettes_de_Mad.e_benoit,_RP-P-2009-3753.jpg |
| 1896 | Lance Parfum Rodo, poster by Alphonse Mucha, Alphonse Mucha | Public domain (PD-old-X-expired, PD-old-auto-expired) | https://commons.wikimedia.org/wiki/File:Mucha_-Lance_Parfum_Rodo.jpg |
| 1897 | Hats, The Millinery Trade Review, New York, "Casimir" | Public domain (PD-US) | https://commons.wikimedia.org/wiki/File:Model%C3%A8s_de_Madame_Carlier_1897.jpg |
| 1904 | Wedding party, Fashion magazine, Fashion (magazine) | Public domain (PD-US) | https://commons.wikimedia.org/wiki/File:Frock_Coat_April_1904.jpg |
| 1907 | Golfing costume, Johann Hermann Bogdan Kandyuk (1866-1918) | Public domain (PD-old-X-expired, PD-old-auto-expired) | https://commons.wikimedia.org/wiki/File:Golfing_costume_1907.jpg |
| 1907 | Pears' Otto of Rose soap advertisement | Public domain (PD-old) | https://commons.wikimedia.org/wiki/File:Pears%27_soap_Otto_of_Rose_1907,_advertisement.jpg |
| 1909 | Fashion plate | Public domain (PD-UK-unknown, PD-US-expired) | https://commons.wikimedia.org/wiki/File:Fashion_Plate_1909.jpg |
| 1910 | Fashion plate | Public domain (PD-old) | https://commons.wikimedia.org/wiki/File:1910_Fashion_Plate.jpg |
| 1911 | Parfum Lauris, poster by Leopoldo Metlicovitz, Leopoldo Metlikovicz | Public domain (PD-old-70) | https://commons.wikimedia.org/wiki/File:Leopoldo_Metlicovitz_-_Poster_Lauris_Sauz%C3%A9_Fr%C3%A8res_Paris.jpg |
| 1911 | Ladies' Home Journal cover by Harry Watrous, Harry Willson Watrous | Public domain (PD-1923, PD-US-expired) | https://commons.wikimedia.org/wiki/File:Harry_Watrous_cover_Ladies_Home_Journal_--1_March_1911.jpg |
| 1913 | Vogue cover by Will Hammell, Will Hammell (1888-1963) | Public domain (PD-US) | https://commons.wikimedia.org/wiki/File:A_Woman_Standing_On_A_Terrace,_by_Will_Hammell_-_Vogue,_August_1,_1913.jpg |
| 1915 | Gazette du Bon Ton plate by Valentine Gross, Valentine Gross (1887–1968) | Public domain (PD-old-X-expired, PD-old-auto-expired) | https://commons.wikimedia.org/wiki/File:Gazette_du_Bon_Ton_fashion_plate_1915_rain.jpg |
| 1917 | Jersey day wear, Les Élégances Parisiennes | Public domain (PD-US) | https://commons.wikimedia.org/wiki/File:Chanel_jersey_casual_wear_1917,.jpg |
| 1917 | Vogue cover by Georges Lepape, Georges Lepape (1887–1971) | Public domain (PD-old-X-expired, PD-old-auto-expired) | https://commons.wikimedia.org/wiki/File:Vogue,_portada_de_mayo_de_1917.jpg |
| 1918 | Vogue cover by George Wolfe Plank, George Wolfe Plank (1883–1965) | Public domain (PD-US) | https://commons.wikimedia.org/wiki/File:Vogue_cover_April_1st,_1918,_by_George_Wolfe_Plank.jpg |
| 1919 | Jonteel face powder advertisement, George D. Buckley | Public domain (PD-1923, PD-US-expired) | https://commons.wikimedia.org/wiki/File:Woman%27s_Home_Companion_1919_-_Jonteel_face_powder.png |
| 1919 | Laissez-moi seule!, plate by George Barbier, George Barbier | Public domain (PD-old-70-1923, PD-old-70-expired, PD-old-X-expired) | https://commons.wikimedia.org/wiki/File:George_Barbier_-_Laissez-moi_seule!.jpg |
| 1919 | Vogue cover by Helen Dryden, Helen Dryden (1882–1972) | Public domain (PD-US) | https://commons.wikimedia.org/wiki/File:Vogue_cover,_July_1st,_1919,_by_Helen_Dryden.jpg |
| 1920 | Vogue cover by Helen Dryden, Helen Dryden (1882–1972) | Public domain (PD-US) | https://commons.wikimedia.org/wiki/File:Vogue_cover,_June_1st,_1920,_by_Helen_Dryden.jpg |
| 1922 | Rigaud's Mary Garden face powder advertisement, Mishkin | Public domain (PD-US) | https://commons.wikimedia.org/wiki/File:Rigaud%27s_Mary_Garden_Face_Powder_Ad_1922.jpg |
| 1922 | The Delineator cover | Public domain (PD-US-1923, PD-US-expired) | https://commons.wikimedia.org/wiki/File:Magazine_cover_The_Delineator_June_1922_man_and_woman_in_garden.jpg |
| 1924 | Cutex nail polish advertisement | Public domain (PD-old) | https://commons.wikimedia.org/wiki/File:Cutex-1924.jpg |
| 1924 | Caroline, Art - Goût - Beauté | CC0 1.0 (CC-zero) | https://commons.wikimedia.org/wiki/File:Art_-_Go%C3%BBt_-_Beaut%C3%A9,_Feuillets_de_l%27_%C3%A9l%C3%A9gance_f%C3%A9minine,_Janvier_1924,_No._41,_4e_Ann%C3%A9e,_p._9_Caroline.-Cr%C3%A9ation_Philippe_et_Gaston,_RP-P-2009-4183-9A.jpg |
| 1924 | Garçonne and Grande Passion, Art - Goût - Beauté | CC0 1.0 (CC-zero) | https://commons.wikimedia.org/wiki/File:Art_-_Go%C3%BBt_-_Beaut%C3%A9,_Feuillets_de_l%27_%C3%A9l%C3%A9gance_f%C3%A9minine,_Janvier_1924,_No._41,_4e_Ann%C3%A9e,_p._12_Cr%C3%A9ation_Jean_Patou_Cr%C3%A9ation_Beer,_RP-P-2009-4183-12A.jpg |
| 1926 | Pour le soir and Mirliton, Art - Goût - Beauté | CC0 1.0 (CC-zero) | https://commons.wikimedia.org/wiki/File:Art_-_Go%C3%BBt_-_Beaut%C3%A9,_Feuillets_de_l%27_%C3%A9l%C3%A9gance_f%C3%A9minine,_F%C3%A9vrier_1926,_No._66,_6e_Ann%C3%A9e,_p._12_Cr%C3%A9ation_Premet_Cr%C3%A9ation_Doeuillet,_RP-P-2009-4182-12A.jpg |
| 1926 | Hats by Jeanne Duc, Art - Goût - Beauté | CC0 1.0 (CC-zero) | https://commons.wikimedia.org/wiki/File:Art_-_Go%C3%BBt_-_Beaut%C3%A9,_Feuillets_de_l%27_%C3%A9l%C3%A9gance_f%C3%A9minine,_F%C3%A9vrier_1926,_No._66,_6e_Ann%C3%A9e,_p._23,_RP-P-2009-4182-23.jpg |
| 1928 | Art - Goût - Beauté | CC0 1.0 (CC-zero) | https://commons.wikimedia.org/wiki/File:Art_-_Go%C3%BBt_-_Beaut%C3%A9,_Feuillets_de_l%27_%C3%A9l%C3%A9gance_f%C3%A9minine,_Novembre_1928,_No._99,_9e_Ann%C3%A9e,_p._10,_RP-P-2009-1921-10.jpg |

## QA (live URL)
| Check | Result | Path |
|---|---|---|
| e2e: logic, odd inputs, keyboard, bad links, challenge link, card PNG, no third-party requests, no storage, no-JS | 105/105 | qa/e2e-live.log (local qa/e2e-local.log) |
| visual-qa-gate 390 + 1440 | PASS (no P0). Lighthouse 100/100/100, SEO 63 (expected with noindex). LCP 1.4 s, CLS 0 | qa/live/ |
| visual-qa-gate 1280 | PASS (no P0). Lighthouse 100/100/100, SEO 63. LCP 1.5 s, CLS 0 | qa/live-1280/ |
| impeccable, default page 390 and 1280 | 0 findings | qa/impeccable-390.json, qa/impeccable-1280.json |
| impeccable, reveal and end states (static snapshots) 390 and 1280 | 0 findings | qa/impeccable-reveal-*.json, qa/impeccable-end-*.json |
| GIFs | beauty-year-390.gif, beauty-year-1280.gif | qa/ |
| Score card sample | 1080x1350 | qa/card.png |
| Benchmarks | Chronophoto, TimeGuessr, WhenTaken | qa/bench/, PRIOR-ART.md |

Odd inputs tested:
- empty, abcd, 18x5, 1700, 2026, 123456 (trimmed to 1234 and rejected), and -1850 (cleaned to 1850)
- arrow keys stop at 1940; Enter submits
- bad links: #s=, #s=zzzzzzzz, #s=abc.999, #s=0, #garbage, #s=abc.-1 and an encoded script tag all fall back to the house set with a note

## Fixes along the way
- impeccable flagged Instrument Sans as an overused font, so I switched to Jost.
- impeccable flagged the italic serif h1, so "Year" is now roman.
- impeccable flagged line length on the About paragraphs; they now have max-width 560px.
- impeccable flagged a straggler word, fixed with text-wrap: pretty.
- The year box had maxlength=4, so a pasted "-1850" became "185". I removed it; the handler keeps 4 digits.
- The first Pages build failed because docs/ was under site-build/. The build now writes repo-root docs/.

## What still breaks or is thin
- The pool is 42 images, so a heavy player sees repeats after about 8 rounds. Pre-1850 is thin (5 images), and the 1840s have none.
- The look notes are my own plain descriptions of each picture, not sourced fashion history claims.
- The years come from Commons and the holding institution, and I did not check them against a second source. Rijksmuseum plates are dated by issue; the others are dated by publication or the poster's year.
- The 1910s are overweighted (11 images).
- Some Vogue covers still show a tiny publisher line, but no date.
- There is no daily mode.
- On phone, the reveal scrolls the image partly off screen to show the answer card.
- The score card PNG prints the github.io preview address.
