import json, urllib.parse
R = '/data/workspace/joc-de-cartes-finder/'
cat = json.load(open(R + 'data/catalog_3cat.json', encoding='utf-8'))['episodes']
REG = 'https://www.regio7.cat/sentits-i-plaers/2025/01/10/cinc-restaurants-sortir-vencedors-joc-113179173.html'
def title(n):
    return [e['titol'] for e in cat if e['titol'].startswith('T1xC%d ' % n)][0]
def rec(id_, name, city, comarca, lat, lng, n, winner, phone=None, closed=False, note=None, website=None):
    r = {'id': id_, 'name': name, 'comarca': comarca, 'city': city, 'lat': lat, 'lng': lng, 'season': 1, 'episodeTitle': title(n), 'winner': winner, 'platEstrella': None, 'rating': None, 'verified': True, 'sourceUrl': REG, 'googleMapsUrl': 'https://www.google.com/maps/search/?api=1&query=' + urllib.parse.quote(name + ' ' + city), 'marcScore': None, 'marcScoreSource': None, 'marcScoreVerified': False, 'episodeFinalScore': None, 'episodeScoreSource': None}
    if phone: r['phone'] = phone
    if website: r['website'] = website
    if closed: r['permanentlyClosed'] = True
    if note: r['note'] = note
    return r
NEW = [
    rec('t1-mas-de-prades', 'Mas de Prades', 'Deltebre', 'Baix Ebre', 40.7171454, 0.7357153, 6, True, '+34 977 05 90 84', website='https://www.masprades.com/', note='Ubicació aproximada: Google Maps només dona el centre geomètric del municipi.'),
    rec('t1-la-subhasta', 'La Subhasta', "L'Ametlla de Mar", 'Baix Ebre', 40.883463, 0.8021806, 6, False, '+34 722 54 64 53', website='https://www.lasubhastaespaigastronomic.com/ca', note='Google Maps indica tancament temporal (no definitiu).'),
    rec('t1-l-era-barruera', "L'Era", 'Barruera', 'Alta Ribagorça', 42.5048474, 0.8005906, 7, True, '+34 689 52 12 68', website='http://www.restaurantlera.com/'),
    rec('t1-casa-higinio', 'Casa Higinio', 'Boí', 'Alta Ribagorça', 42.522131, 0.835621, 7, False, closed=True),
]
ds = json.load(open(R + 'public/data/restaurants.json', encoding='utf-8'))
ids = {r['id'] for r in ds}
assert not [r['id'] for r in NEW if r['id'] in ids], 'id clash'
ds += NEW
with open(R + 'public/data/restaurants.json', 'w', encoding='utf-8') as fh:
    json.dump(ds, fh, ensure_ascii=False, indent=2); fh.write('\n')
json.dump(NEW, open(R + 'data/season1_batch2.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ADDED', len(NEW), 'TOTAL', len(ds))
