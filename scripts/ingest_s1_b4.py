import json, urllib.parse
R = '/data/workspace/joc-de-cartes-finder/'
cat = json.load(open(R + 'data/catalog_3cat.json', encoding='utf-8'))['episodes']
def title(n):
    return [e['titol'] for e in cat if e['titol'].startswith('T1xC%d ' % n)][0]
def src(n):
    return [e['vtt_url'] for e in cat if e['titol'].startswith('T1xC%d ' % n)][0]
def rec(id_, name, city, comarca, lat, lng, n, winner, phone=None, website=None, closed=False, note=None):
    r = {'id': id_, 'name': name, 'comarca': comarca, 'city': city, 'lat': lat, 'lng': lng, 'season': 1, 'episodeTitle': title(n), 'winner': winner, 'platEstrella': None, 'rating': None, 'verified': True, 'sourceUrl': src(n), 'googleMapsUrl': 'https://www.google.com/maps/search/?api=1&query=' + urllib.parse.quote(name + ' ' + city), 'marcScore': None, 'marcScoreSource': None, 'marcScoreVerified': False, 'episodeFinalScore': None, 'episodeScoreSource': None}
    if phone: r['phone'] = phone
    if website: r['website'] = website
    if closed: r['permanentlyClosed'] = True
    if note: r['note'] = note
    return r
NEW = [
    rec('t1-tragamar', 'Tragamar', 'Calella de Palafrugell', 'Baix Empordà', 41.8888472, 3.1880639, 16, True, phone='+34 972 30 70 05', website='https://grupotragaluz.com/restaurantes/tragamar/', note='Puntuació mitjana del programa: 7,4 sobre 10. Google Maps indica tancament temporal (no definitiu).'),
    rec('t1-vintage-palamos', 'Vintage Restaurant & Lounge', 'Palamós', 'Baix Empordà', 41.844472, 3.128538, 16, False, closed=True, note='Puntuació mitjana del programa: 6,4 sobre 10. Google Maps indica tancament definitiu.'),
    rec('t1-picnic-platja', 'Picnic Platja', 'Torredembarra', 'Tarragonès', 41.1441094, 1.3959437, 17, False, note='Puntuació mitjana del programa: 6,5 sobre 10. Telèfon no disponible a Google Maps.'),
    rec('t1-la-cuina-de-la-marga', 'La Cuina de la Marga', 'Sant Salvador (El Vendrell)', 'Baix Penedès', 41.1828906, 1.5380457, 17, False, phone='+34 640 69 29 09', website='http://www.lacuinadelamarga.com/', note='Puntuació mitjana del programa: 7,0 sobre 10.'),
    rec('t1-larrosseria', 'L\'Arrosseria', 'Cunit', 'Baix Penedès', 41.192192, 1.6249172, 17, True, phone='+34 977 16 02 91', website='https://larrosseria.com/', note='Puntuació mitjana del programa: 8,1 sobre 10. Guanyador del millor restaurant a peu de platja de la Costa Daurada.'),
]
ds = json.load(open(R + 'public/data/restaurants.json', encoding='utf-8'))
ids = {r['id'] for r in ds}
assert not [r['id'] for r in NEW if r['id'] in ids], 'id clash'
ds += NEW
with open(R + 'public/data/restaurants.json', 'w', encoding='utf-8') as fh:
    json.dump(ds, fh, ensure_ascii=False, indent=2); fh.write('\n')
json.dump(NEW, open(R + 'data/season1_batch4.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ADDED', len(NEW), 'TOTAL', len(ds))
