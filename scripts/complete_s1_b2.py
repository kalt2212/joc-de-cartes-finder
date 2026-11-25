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
    rec('t1-albert-guzman', 'Albert Guzmán', 'La Ràpita', 'Montsià', 40.6073189, 0.5834749, 6, False, phone='+34 661 10 26 72', website='http://www.albertguzman.com/'),
    rec('t1-ida-can-machino', 'Ida Can Machino', 'Els Muntells', 'Montsià', 40.6696396, 0.7543838, 6, False, phone='+34 977 47 90 15', website='https://idacanmachino.shop/'),
    rec('t1-el-bouquet', 'El Bouquet', 'Boí', 'Alta Ribagorça', 42.5142306, 0.8575607, 7, False, phone='+34 973 69 62 18', website='https://www.elbouquet.com/restaurante/', note='Ubicació aproximada: Google Maps només dona la zona del Pla de l\'Ermita.'),
    rec('t1-hostal-aude', 'Hostal Aude', 'Durro', 'Alta Ribagorça', 42.4979612, 0.8216267, 7, False, website='http://www.hostalaude.cat/', note='Google Maps indica tancament temporal (no definitiu). Sense telèfon verificat.'),
    rec('t1-taco-alto', 'Taco Alto', 'Barcelona', 'Barcelonès', 41.3896806, 2.1810671, 8, True, phone='+34 936 33 97 42'),
    rec('t1-els-pinxus', 'Els Pinxus', 'Barcelona', 'Barcelonès', 41.397424, 2.1485735, 8, False, phone='+34 932 71 42 05', website='http://www.elspinxus.com/'),
    rec('t1-arepamundi', 'Arepamundi', 'Barcelona', 'Barcelonès', 41.4010336, 2.1792792, 8, False, closed=True),
    rec('t1-la-zorra', 'La Zorra', 'Sitges', 'Garraf', 41.2338375, 1.8037297, 9, True, phone='+34 938 53 17 78', website='http://restaurantelazorra.com/'),
    rec('t1-la-cupula', 'La Cúpula', 'Garraf', 'Garraf', 41.2530327, 1.9028259, 9, False, phone='+34 936 32 00 15', website='http://www.lacupulagarraf.com/'),
    rec('t1-el-groc', 'El Groc', 'Vilanova i la Geltrú', 'Garraf', 41.2167369, 1.7272407, 9, False, closed=True),
    rec('t1-ceferino', 'Ceferino', 'Vilanova i la Geltrú', 'Garraf', 41.214738, 1.724727, 9, False, phone='+34 938 15 17 19', website='https://hotelceferino.com/restaurante/'),
    rec('t1-kao-dim-sum', 'Kao Dim Sum', 'Barcelona', 'Barcelonès', 41.4038707, 2.1339605, 10, False, phone='+34 934 17 30 64', website='https://www.kaodimsum.com/'),
    rec('t1-bobo-pulpin', 'Bobo Pulpín', 'Barcelona', 'Barcelonès', 41.3837181, 2.1771276, 10, False, closed=True),
    rec('t1-catacroquet', 'Catacroquet', 'Barcelona', 'Barcelonès', 41.4018309, 2.1960895, 10, False, phone='+34 932 80 90 59', website='https://catacroquet.es/'),
]
ds = json.load(open(R + 'public/data/restaurants.json', encoding='utf-8'))
ids = {r['id'] for r in ds}
assert not [r['id'] for r in NEW if r['id'] in ids], 'id clash'
ds += NEW
with open(R + 'public/data/restaurants.json', 'w', encoding='utf-8') as fh:
    json.dump(ds, fh, ensure_ascii=False, indent=2); fh.write('\n')
json.dump(NEW, open(R + 'data/season1_batch2_complete.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ADDED', len(NEW), 'TOTAL', len(ds))
