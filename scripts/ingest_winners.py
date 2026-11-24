# Ingest validated winners (announced explicitly in VTT final window). Winners only; no unverified participants. Idempotent by id. Uses official CCMA episode URLs from meta.json.
import json, re, unicodedata
def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii','ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')
meta = json.load(open('/tmp/proc/meta.json', encoding='utf-8'))
# (idint, name, city, comarca, lat, lng, season, ep, note)
ROWS = [
 ('6295930','Brisa','Barcelona','Barcelonès',41.3742,2.1857,8,'T8xC4','Anunci explícit a la transcripció: "El restaurant guanyador és... Brisa."'),
 ('6309806','La Clandestina','Vallès Occidental','Vallès Occidental',41.5632,2.2586,8,'T8xC7','Anunci explícit: "El restaurant guanyador és... La Clandestina."'),
 ('6311030','Bar Lídia','Lleida','Segrià',41.6176,0.6200,8,'T8xC8','Anunci explícit: "Perquè és... Bar Lídia. El Bar Lídia es proclama guanyador."'),
 ('6317723','Aqua','Barcelona','Barcelonès',41.3851,2.1734,8,'T8xC13','Anunci explícit: "El restaurant guanyador és... Aqua."'),
 ('6318423','Tapas 24','Barcelona','Barcelonès',41.3909527,2.1674959,8,'T8xC14','Anunci explícit: "El restaurant guanyador és... Tapas 24."'),
 ('6352685','Gran Tonino','Barcelona','Barcelonès',41.3851,2.1734,9,'T9xC1','Anunci explícit: "El restaurant guanyador és... Gran Tonino."'),
 ('6354050','Barraca','Barcelona','Barcelonès',41.3851,2.1734,9,'T9xC2','Anunci explícit: "El restaurant guanyador és... Barraca."'),
 ('6354865','Ambient','Premià de Mar','Maresme',41.4919,2.3594,9,'T9xC4','Anunci explícit: "El restaurant guanyador és... Ambient."'),
 ('6370096','Yesterday','Barcelona','Barcelonès',41.3851,2.1734,9,'T9xC9','Anunci explícit: "El restaurant guanyador és... Yesterday."'),
 ('6379289','The Factory','Girona','Gironès',41.9794,2.8214,9,'T9xC13','Anunci explícit: "El restaurant guanyador és... The Factory."'),
 ('6417356','Marbrava','Badalona','Barcelonès',41.4500,2.2462,10,'T10xC2','Anunci explícit: "El restaurant guanyador és... Marbrava."'),
 ('6420235','La Cuina d\'en Tikus','Sant Pere de Ribes','Garraf',41.2296,1.7637,10,'T10xC3','Anunci explícit: "El restaurant guanyador és... La Cuina d\'en Tikus."'),
 ('6422049','La Masia','Girona','Gironès',41.9794,2.8214,10,'T10xC5','Anunci explícit: "El restaurant guanyador és... La Masia."'),
 ('6170833','L\'Arbre de Juliette','Sant Feliu de Guíxols','Baix Empordà',41.7833,3.0333,6,'T6xC2','Anunci de guanyador a la transcripció (T6xC2).'),
 ('6169948','Casa Ràfols','Barcelona','Barcelonès',41.3851,2.1734,6,'T6xC1','Anunci de guanyador a la transcripció (T6xC1).'),
 ('6171577','Tiaré','Mataró','Maresme',41.5390,2.4450,6,'T6xC3','Anunci de guanyador a la transcripció (T6xC3).'),
 ('6172950','Salioli','Vila-seca','Tarragonès',41.1084,1.1545,6,'T6xC4','Anunci de guanyador a la transcripció (T6xC4).'),
 ('6179998','Can Mauri','Vallès Occidental','Vallès Occidental',41.5632,2.2586,6,'T6xC7','Anunci de guanyador a la transcripció (T6xC7).'),
 ('6182423','Iberic Fusion','Badalona','Barcelonès',41.4500,2.2462,6,'T6xC9','Anunci de guanyador a la transcripció (T6xC9).'),
 ('6183757','Matritum','Madrid','Comunitat de Madrid',40.4168,-3.7038,6,'T6xC10','Anunci de guanyador a la transcripció (T6xC10).'),
 ('6186531','Little Andaman','Barcelona','Barcelonès',41.3851,2.1734,6,'T6xC12','Anunci de guanyador a la transcripció (T6xC12).'),
 ('6189302','Can Marlès','Penedès','Alt Penedès',41.3453774,1.7065189,6,'T6xC14','Anunci de guanyador a la transcripció (T6xC14).'),
 ('6190772','Comida Codac','Barcelona','Barcelonès',41.3851,2.1734,6,'T6xC15','Anunci de guanyador a la transcripció (T6xC15).'),
 ('6194415','Baix Pirineu','Berguedà','Berguedà',42.1000,1.8500,6,'T6xC18','Anunci de guanyador a la transcripció (T6xC18).'),
 ('6115357','Xiringuito La Sal','Cadaqués','Alt Empordà',42.2889,3.2778,5,'T5xC5','Anunci de guanyador a la transcripció (T5xC5).'),
 ('6120577','Mas Solà','Girona','Gironès',41.9794,2.8214,5,'T5xC7','Anunci de guanyador a la transcripció (T5xC7).'),
 ('6066258','Miami Can Pons','Sant Carles de la Ràpita','Baix Ebre',40.6205,0.5924,4,'T4xC13','Anunci de guanyador a la transcripció (T4xC13).'),
 ('5909206','L\'Era del Julià','Alt Urgell','Alt Urgell',42.3500,1.4500,3,'T3xC6','Anunci explícit: "El restaurant guanyador és... L\'Era del Julià."'),
]
P = 'public/data/restaurants.json'
data = json.load(open(P, encoding='utf-8'))
ids = {r['id'] for r in data}
names = {r['name'].lower() for r in data}
added = []
for (idint, name, city, comarca, lat, lng, season, ep, note) in ROWS:
    rid = slug(name)
    if rid in ids or name.lower() in names:
        continue
    m = meta.get(idint, {})
    url = f'https://www.3cat.cat/3cat/joc-de-cartes/video/{idint}/'
    if 'titol' not in m: raise SystemExit('NO_META ' + idint)
    added.append({'id': rid, 'name': name, 'comarca': comarca, 'city': city, 'lat': lat, 'lng': lng,
      'season': season, 'episodeTitle': m['titol'], 'winner': True, 'platEstrella': None, 'rating': None,
      'verified': True, 'sourceUrl': url,
      'googleMapsUrl': 'https://www.google.com/maps/search/?api=1&query=' + name.replace(' ', '%20') + '%20' + city.replace(' ', '%20'),
      'note': note, 'marcScore': None, 'marcScoreSource': None, 'marcScoreVerified': False,
      'episodeFinalScore': None, 'episodeScoreSource': None})
data.extend(added)
json.dump(data, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(P, 'a', encoding='utf-8').write('\n')
print('ADDED', len(added), 'TOTAL', len(data))
