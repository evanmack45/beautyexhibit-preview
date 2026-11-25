import json,urllib.request,os,time
UA='beautyexhibit-preview/0.1 (https://github.com/evanmack45; research bot)'
for x in json.load(open('pick-all.json')):
    p=f"big/{x['nid']}.jpg"
    if os.path.exists(p) and os.path.getsize(p)>5000: continue
    u=x.get('thumb') or x.get('thumburl')
    for t in range(3):
        try:
            r=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':UA}),timeout=60).read()
            open(p,'wb').write(r);break
        except Exception as e:
            print(x['nid'],e);time.sleep(5)
    time.sleep(0.4)
print('done')
