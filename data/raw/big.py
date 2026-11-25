import json,urllib.request,time,os,sys
from PIL import Image,ImageDraw,ImageFont
UA={'User-Agent':'beautyexhibit-preview/0.1 (https://github.com/evanmack45; research bot)'}
d=json.load(open('commons-candidates.json'))
ids=[int(x) for x in sys.argv[1].split(',')]
for i in ids:
    fn=f'big/{i}.jpg'
    if os.path.exists(fn): continue
    for k in range(3):
        try: open(fn,'wb').write(urllib.request.urlopen(urllib.request.Request(d[i]['thumb'],headers=UA),timeout=60).read()); break
        except Exception as e: print('err',i,e); time.sleep(4)
    time.sleep(0.4)
W,H=420,560;cols=4
for s in range(0,len(ids),8):
    ch=ids[s:s+8];sh=Image.new('RGB',(cols*W,((len(ch)+3)//4)*(H+30)),'white');dr=ImageDraw.Draw(sh)
    for j,i in enumerate(ch):
        im=Image.open(f'big/{i}.jpg').convert('RGB');im.thumbnail((W-6,H-6))
        X,Y=(j%cols)*W,(j//cols)*(H+30);sh.paste(im,(X+3,Y+3));dr.text((X+4,Y+H+4),f'#{i} {d[i]["year"]}',fill='black',font=ImageFont.load_default(20))
    sh.save(f'bigsheet-{s//8}.jpg',quality=82)
print('ok')
