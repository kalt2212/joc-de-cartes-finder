import json, urllib.parse
R = '/data/workspace/joc-de-cartes-finder/'
cat = json.load(open(R + 'data/catalog_3cat.json', encoding='utf-8'))['episodes']
def ep(n): return [e for e in cat if e['titol'].startswith('T2xC%d ' % n)][0]
def rec(id_, name, city, comarca, lat, lng, n, phone, website=None, score=None, note=None):
    e = ep(n)
    r = {'id': id_, 'name': name, 'comarca': comarca, 'city': city, 'lat': lat, 'lng': lng, 'season': 2, 'episodeTitle': e['titol'], 'winner': False, 'platEstrella': None, 'rating': None, 'verified': True, 'sourceUrl': e['vtt_url'], 'googleMapsUrl': 'https://www.google.com/maps/search/?api=1&query=' + urllib.parse.quote(name + ' ' + city), 'phone': phone, 'marcScore': None, 'marcScoreSource': None, 'marcScoreVerified': False, 'episodeFinalScore': score, 'episodeScoreSource': e['vtt_url'] if score is not None else None}
    if website: r['website'] = website
    if note: r['note'] = note
    return r
NEW = [
    rec('t2-la-clara', 'La Clara', 'Barcelona (Eixample)', 'Barcelonès', 41.3783075, 2.1539346, 4, '+34 932 89 34 60', 'https://www.laclararestaurant.com/', 7.5, 'Restaurant centenari (obert des de 1872) a la Gran Via de les Corts Catalanes. Maps també llista un Clara Restaurant a Carrer de Buenos Aires; s\'ha triat el primer pel que fa a l\'antiguitat del local.'),
    rec('t2-panoramix', 'Restaurant Panoramix', 'Molló (La Ginestosa)', 'Ripollès', 42.3533498, 2.4136227, 5, '+34 691 88 11 16', 'http://www.restaurantpanoramix.com/', None, 'Segona posició de la vall de Camprodon a T2xC5. Nota mitjana no trobada a la transcripció. Maps indica C-38 Km22 (La Ginestosa), proper a Molló.'),
    rec('t2-can-xicoy', 'Can Xicoy', 'Camprodon', 'Ripollès', 42.3101609, 2.363928, 5, '+34 972 74 14 33', None, None, 'Participant de T2xC5. Nota mitjana no trobada a la transcripció (espai valorat amb 5,3, la nota més baixa de l\'episodi). Maps indica que dijous està tancat.'),
]
ds = json.load(open(R + 'public/data/restaurants.json', encoding='utf-8'))
ids = {r['id'] for r in ds}
assert not [r['id'] for r in NEW if r['id'] in ids], 'id clash'
ds += NEW
with open(R + 'public/data/restaurants.json', 'w', encoding='utf-8') as fh:
    json.dump(ds, fh, ensure_ascii=False, indent=2); fh.write('\n')
json.dump(NEW, open(R + 'data/season2_batch1_gap.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ADDED', len(NEW), 'TOTAL', len(ds))
