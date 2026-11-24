import json, re, unicodedata
def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii','ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+','-',s).strip('-')
meta = json.load(open('/tmp/proc/meta.json', encoding='utf-8'))
ROWS = [
 ('6112905','Merendero de la Mari','Barcelona','Barcelonès',41.3785,2.1925,5,'T5xC1','Anunci explícit: "Doncs el guanyador és... el Merendero de la Mari. El Merendero de la Mari és el millor restaurant mariner de la Barceloneta."'),
 ('6126799','Rodamar','L\'Ampolla','Baix Ebre',40.8169,0.7131,5,'T5xC12','Anunci explícit: "I el guanyador és... Rodamar. L\'Hèctor del Rodamar és el millor restaurant amb la millor recepta d\'ostró de l\'Ampolla."'),
 ('6123061','Els Caçadors','Maçanet de Cabrenys','Alt Empordà',42.2600,2.8330,5,'T5xC9','Anunci explícit: "El restaurant guanyador és... Els Caçadors. El restaurant Els Caçadors es converteix en el millor restaurant amb cuina empordanesa." Hotel restaurant de Maçanet de Cabrenys según la descripció oficial.'),
 ('6113053','Art Restaurant','Conca de Barberà','Conca de Barberà',41.3700,1.0400,5,'T5xC2','Anunci explícit: "El restaurant guanyador és... L\'Art Restaurant... el millor restaurant sense turistes de la Conca de Barberà." Municipi no indicat a la fonted: només comarca.'),
 ('6064130','Exquisit','Igualada','Anoia',41.5795,1.6172,4,'T4xC11','Anunci explícit: "...guanyador és... L\'Exquisit d\'Igualada... el millor restaurant de cuina tradicional catalana." Final entre Manresa i Igualada.'),
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
