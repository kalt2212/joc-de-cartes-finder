import json
P = 'public/data/restaurants.json'
d = json.load(open(P, encoding='utf-8'))
by = {r['id']: r for r in d}
def upd(i, **kw):
    r = by[i]
    for k, v in kw.items(): r[k] = v
UPD = {
 'exquisit': dict(lat=41.5802094, lng=1.6197958,
   note='Coordenades de Google Maps (ROOFTOP): Carrer de Sant Josep, 18-20, Igualada. Anunci explícit a la transcripció T4xC11.'),
 'els-cacadors': dict(lat=42.3846467, lng=2.7555458,
   note='Hotel restaurant Els Caçadors, Urbanització Casa Nova, Maçanet de Cabrenys (Google Maps, centre geomètric del poble). Anunci explícit T5xC9.'),
 'rodamar': dict(lat=40.8058891, lng=0.7013053,
   note='Coordenades de Google Maps (ROOFTOP): Passeig de l\'Arenal, 10, L\'Ampolla. Anunci explícit T5xC12.'),
 'merendero-de-la-mari': dict(lat=41.3806249, lng=2.1859029, permanentlyClosed=True,
   note='Coordenades de Google Maps (ROOFTOP): Plaça de Pau Vila, 1, Barcelona. Google Maps indica que el local està tancat definitivament. Anunci explícit T5xC1.'),
 'tasca-bohemia': dict(city='Tortosa', comarca='Baix Ebre', lat=40.8135218, lng=0.5248174,
   note='Restaurant Tasca Bohèmia, Carrer de l\'Escorxador, 14, Tortosa (Google Maps, ROOFTOP). Anunci explícit T6xC13.'),
 'art-restaurant': dict(city="L'Espluga de Francolí", comarca='Conca de Barberà',
   note='Art Restaurant, Carrer Camí del Clos, s/n, L\'Espluga de Francolí (adreça de Google Maps). Les coordenades actuals són centroides de comarca; la geocodificació de Google Maps donava un punt a La Pobla de Mafumet, que no es fa servir. Anunci explícit T5xC2.'),
}
for i, kw in UPD.items():
    if i not in by: raise SystemExit('MISSING ' + i)
    upd(i, **kw)
json.dump(d, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(P, 'a', encoding='utf-8').write('\n')
print('UPDATED', len(UPD), 'TOTAL', len(d), 'VERIFIED', sum(r['verified'] for r in d), 'WINNERS', sum(r['winner'] for r in d))
