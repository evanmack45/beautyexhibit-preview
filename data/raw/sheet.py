import json,urllib.request,time,os,re,sys
from PIL import Image,ImageDraw,ImageFont
UA={'User-Agent':'beautyexhibit-preview/0.1 (https://github.com/evanmack45; research bot)'}
d=json.load(open(sys.argv[1]))
for x in d:
    fn=f"thumbs/{x['i']}.jpg"
    if os.path.exists(fn): continue
    u=re.sub(r'/\d+px-','/250px-',x['thumb'])
    for k in range(3):
        try:
            data=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=30).read(); open(fn,'wb').write(data); break
        except Exception as e: print('err',x['i'],e); time.sleep(3)
    time.sleep(0.3)
W,H=250,330;cols=6
for s in range(0,len(d),24):
    chunk=d[s:s+24];rows=(len(chunk)+cols-1)//cols
    sh=Image.new('RGB',(cols*W,rows*(H+30)),'white');dr=ImageDraw.Draw(sh)
    for j,x in enumerate(chunk):
        try: im=Image.open(f"thumbs/{x['i']}.jpg").convert('RGB'); im.thumbnail((W-6,H-6))
        except Exception: continue
        X,Y=(j%cols)*W,(j//cols)*(H+30); sh.paste(im,(X+3,Y+3)); dr.text((X+4,Y+H+4),f"#{x['i']} {x['year']}",fill='black',font=ImageFont.load_default(18))
    sh.save(f"{sys.argv[2]}-{s//24}.jpg",quality=80)
print('ok')
