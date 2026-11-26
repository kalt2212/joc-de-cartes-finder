import json, urllib.parse
R = '/data/workspace/joc-de-cartes-finder/'
cat = json.load(open(R + 'data/catalog_3cat.json', encoding='utf-8'))['episodes']
REG = 'https://www.regio7.cat/sentits-i-plaers/2025/01/10/cinc-restaurants-sortir-vencedors-joc-113179173.html'
def title(n):
    return [e['titol'] for e in cat if e['titol'].startswith('T1xC%d ' % n)][0]
def rec(id_, name, city, comarca, lat, lng, n, winner, phone=None, website=None, closed=False, note=None):
    r = {'id': id_, 'name': name, 'comarca': comarca, 'city': city, 'lat': lat, 'lng': lng, 'season': 1, 'episodeTitle': title(n), 'winner': winner, 'platEstrella': None, 'rating': None, 'verified': True, 'sourceUrl': REG, 'googleMapsUrl': 'https://www.google.com/maps/search/?api=1&query=' + urllib.parse.quote(name + ' ' + city), 'marcScore': None, 'marcScoreSource': None, 'marcScoreVerified': False, 'episodeFinalScore': None, 'episodeScoreSource': None}
    if phone: r['phone'] = phone
    if website: r['website'] = website
    if closed: r['permanentlyClosed'] = True
    if note: r['note'] = note
    return r
NEW = [
    rec('t1-divinum', 'Divinum', 'Girona', 'Gironès', 41.9822157, 2.824102, 11, True, phone='+34 872 08 02 18', website='https://www.dvnum.com/'),
    rec('t1-llevataps', 'Llevataps', 'Girona', 'Gironès', 41.984698, 2.825606, 11, False, phone='+34 972 09 91 12', note='Google Maps indica tancament temporal (no definitiu).'),
    rec('t1-l-estel-de-la-merce', 'L\'Estel de la Mercè', 'Lleida', 'Segrià', 41.610202, 0.611868, 12, False, closed=True),
]
ds = json.load(open(R + 'public/data/restaurants.json', encoding='utf-8'))
ids = {r['id'] for r in ds}
assert not [r['id'] for r in NEW if r['id'] in ids], 'id clash'
ds += NEW
with open(R + 'public/data/restaurants.json', 'w', encoding='utf-8') as fh:
    json.dump(ds, fh, ensure_ascii=False, indent=2); fh.write('\n')
json.dump(NEW, open(R + 'data/season1_batch3.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ADDED', len(NEW), 'TOTAL', len(ds))
