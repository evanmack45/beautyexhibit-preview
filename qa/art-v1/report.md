# Visual QA gate

Result: PASS (no P0)

## http://127.0.0.1:8014/ — phone
Load 581ms · frames p50 16.7ms p95 16.8ms · fonts "Bodoni Moda" / Jost · canvases 0
- no issues
Shots: 127-0-0-1-8014__phone__fold.png, 127-0-0-1-8014__phone__scroll025.png, 127-0-0-1-8014__phone__scroll050.png, 127-0-0-1-8014__phone__scroll075.png, 127-0-0-1-8014__phone__scroll100.png, 127-0-0-1-8014__phone__full.png, 127-0-0-1-8014__phone__reduced-motion.png

## http://127.0.0.1:8014/ — desktop
Load 575ms · frames p50 16.7ms p95 16.7ms · fonts "Bodoni Moda" / Jost · canvases 0
- no issues
Shots: 127-0-0-1-8014__desktop__fold.png, 127-0-0-1-8014__desktop__scroll025.png, 127-0-0-1-8014__desktop__scroll050.png, 127-0-0-1-8014__desktop__scroll075.png, 127-0-0-1-8014__desktop__scroll100.png, 127-0-0-1-8014__desktop__full.png, 127-0-0-1-8014__desktop__reduced-motion.png

## http://127.0.0.1:8014/ — lighthouse-mobile
Lighthouse: {"performance":95,"accessibility":100,"best-practices":100,"seo":66} LCP 2.9 s CLS 0 TBT 60 ms weight Total size was 512 KiB
- no issues

Human/AI review still required: look at every *__fold.png and *__scroll*.png. This gate catches breakage, not blandness.