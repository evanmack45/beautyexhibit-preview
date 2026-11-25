import json, re, time, urllib.request, urllib.parse, concurrent.futures as cf, sys
UA={'User-Agent':'beautyexhibit-preview research (Gizmo bot; contact via github evanmack45)'}
def get(u):
    for k in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=30) as r: return json.load(r)
        except Exception as e: time.sleep(1+k)
    return None
qs=sys.argv[1:]
ids={}
for q in qs:
    off=0
    while off<400:
        d=get(f"https://collectionapi.metmuseum.org/public/collection/v1.1/search?hasImages=true&q={urllib.parse.quote(q)}&limit=100&offset={off}")
        if not d or not d.get('objectIDs'): break
        for i in d['objectIDs']: ids.setdefault(i,q)
        off+=100
        if off>=d.get('total',0): break
print(len(ids),'ids',file=sys.stderr)
def obj(i): return get(f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{i}")
out=[]
with cf.ThreadPoolExecutor(6) as ex:
    for o in ex.map(obj, list(ids)):
        if not o or not o.get('isPublicDomain') or not o.get('primaryImageSmall'): continue
        b,e=o.get('objectBeginDate'),o.get('objectEndDate')
        if b!=e or not (1700<=b<=1928): continue
        if str(b) not in (o.get('objectDate') or ''): continue
        if re.search(r'ca\.|circa|\?|or |–|-\d', o.get('objectDate','')): continue
        out.append({k:o.get(k) for k in ['objectID','title','objectDate','objectBeginDate','artistDisplayName','department','objectName','medium','creditLine','objectURL','primaryImageSmall','primaryImage','isPublicDomain','classification','culture']}|{'q':ids[o['objectID']]})
json.dump(out,open('met-candidates.json','w'),indent=1)
print(len(out),'candidates',file=sys.stderr)
