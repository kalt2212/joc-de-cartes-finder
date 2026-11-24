import json, re, unicodedata
def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii','ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+','-',s).strip('-')
meta = json.load(open('/tmp/proc/meta.json', encoding='utf-8'))
ROWS = [
 ('6313295','Trull','Tarragona','Tarragonès',41.1189,1.2445,8,'T8xC10','Anunci explícit: "El restaurant guanyador és... El Trull. El Trull es proclama guanyador del millor plat tradicional de Tarragona."'),
 ('6393015','Limo','Lleida','Segrià',41.6176,0.6200,9,'T9xC17','Anunci explícit: "El restaurant guanyador és... Limo. El Limo Restaurant guanya el programa."'),
 ('6394322','B de Bocata','Barcelona','Barcelonès',41.3851,2.1734,9,'T9xC18','Anunci explícit: "El restaurant guanyador és... B de Bocata... es proclama guanyador."'),
 ('6380412','Nova Cisa','Premià de Dalt','Maresme',41.4919,2.3594,9,'T9xC14','Anunci explícit: "El restaurant guanyador és... la Nova Cisa. La Nova Cisa guanya el programa d\'avui."'),
 ('6187943','Tasca Bohemia','Baix Ebre','Baix Ebre',40.7131,0.7388,6,'T6xC13','Anunci explícit: "El restaurant guanyador és... La Tasca Bohemia."'),
]
P='public/data/restaurants.json'
data = json.load(open(P, encoding='utf-8'))
ids = {r['id'] for r in data}; names = {r['name'].lower() for r in data}
added = []
for (idint,name,city,comarca,lat,lng,season,ep,note) in ROWS:
    rid = slug(name)
    if rid in ids or name.lower() in names: print('SKIP dup', name); continue
    m = meta.get(idint,{})
    if 'titol' not in m: raise SystemExit('NO_META '+idint)
    added.append({'id':rid,'name':name,'comarca':comarca,'city':city,'lat':lat,'lng':lng,'season':season,
      'episodeTitle':m['titol'],'winner':True,'platEstrella':None,'rating':None,'verified':True,
      'sourceUrl':f'https://www.3cat.cat/3cat/joc-de-cartes/video/{idint}/',
      'googleMapsUrl':'https://www.google.com/maps/search/?api=1&query='+name.replace(' ','%20')+'%20'+city.replace(' ','%20'),
      'note':note,'marcScore':None,'marcScoreSource':None,'marcScoreVerified':False,'episodeFinalScore':None,'episodeScoreSource':None})
data.extend(added)
json.dump(data, open(P,'w',encoding='utf-8'), ensure_ascii=False, indent=2)
open(P,'a',encoding='utf-8').write('\n')
print('ADDED', len(added), 'TOTAL', len(data), 'VERIFIED', sum(r['verified'] for r in data), 'WINNERS', sum(r['winner'] for r in data))
