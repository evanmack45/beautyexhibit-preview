import json, re, sys, time, urllib.request, urllib.parse
UA={'User-Agent':'beautyexhibit-preview/0.1 (https://github.com/evanmack45; research bot)'}
API='https://commons.wikimedia.org/w/api.php?'
def get(params):
    u=API+urllib.parse.urlencode(params|{'format':'json','formatversion':'2'})
    for k in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=40) as r: return json.load(r)
        except Exception as e: time.sleep(2+2*k)
strip=lambda s: re.sub(r'<[^>]+>','',s or '').strip()
cats=[l.strip() for l in open(sys.argv[1]) if l.strip()]
out=[]
for c in cats:
    d=get({'action':'query','generator':'categorymembers','gcmtitle':'Category:'+c,'gcmtype':'file','gcmlimit':'60','prop':'imageinfo|templates','iiprop':'url|extmetadata|size|mime','iiurlwidth':'1000','tlnamespace':'10','tllimit':'500'})
    pages=(d or {}).get('query',{}).get('pages',[])
    kept=0
    for p in pages:
        ii=(p.get('imageinfo') or [{}])[0]; m=ii.get('extmetadata',{})
        v=lambda k: strip(m.get(k,{}).get('value'))
        lic=v('License').lower(); short=v('LicenseShortName'); date=v('DateTimeOriginal')
        tpl=[t['title'].replace('Template:','') for t in p.get('templates',[]) if re.match(r'Template:(PD|CC-zero|Cc-zero|CC0)',t['title'],re.I)]
        if lic not in ('pd','cc0') or not tpl: continue
        ys=re.findall(r'(?<!\d)(1[6-9]\d\d)(?!\d)',date)
        if len(set(ys))!=1 or re.search(r'circa|ca\.|c\.|\?|between|or |s\b|–|—|-\s*1\d\d\d',date,re.I): continue
        y=int(ys[0])
        if y>1928 or ii.get('mime') not in ('image/jpeg','image/png','image/tiff'): continue
        out.append({'file':p['title'],'cat':c,'year':y,'date':date,'license':short,'licenseCode':lic,'templates':tpl,'artist':v('Artist')[:120],'desc':v('ImageDescription')[:300],'credit':v('Credit')[:200],'page':ii.get('descriptionurl'),'thumb':ii.get('thumburl'),'w':ii.get('width'),'h':ii.get('height')})
        kept+=1
    print(c,len(pages),'files',kept,'kept',file=sys.stderr)
    time.sleep(0.5)
json.dump(out,open(sys.argv[2],'w'),indent=1)
print(len(out),'total',file=sys.stderr)
