# Enrich missing phones in public/data/restaurants.json from an Overpass extract (strict matching, see enrich_phones_core.py). Writes a candidate report; pass --apply to write phones.
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from enrich_phones_core import best_match

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(REPO, 'public', 'data', 'restaurants.json')
OVERPASS = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else '/tmp/proc/overpass_cat.json'
APPLY = '--apply' in sys.argv

def phone_of(tags):
    return tags.get('phone') or tags.get('contact:phone') or ''

def candidates(elements):
    out = []
    for e in elements:
        t = e.get('tags') or {}
        la = e.get('lat') or (e.get('center') or {}).get('lat')
        lo = e.get('lon') or (e.get('center') or {}).get('lon')
        if la is None or not t.get('name'):
            continue
        out.append({'name': t['name'], 'lat': la, 'lng': lo, 'city': t.get('addr:city') or t.get('addr:town') or t.get('addr:village') or '', 'tags': t})
    return out

def main():
    elements = json.load(open(OVERPASS, encoding='utf-8'))['elements']
    cands = [c for c in candidates(elements) if phone_of(c['tags'])]
    data = json.load(open(DATA, encoding='utf-8'))
    matched, report = 0, []
    for r in data:
        if r.get('phone') or r.get('permanentlyClosed'):
            continue
        m = best_match(r, cands)
        if not m:
            continue
        score, dist, c = m
        phone = phone_of(c['tags'])
        report.append(f"{r['id']}|{r['name']}|{r['city']}|OSM={c['name']}|sim={score:.2f}|d={dist:.2f}|phone={phone}")
        if APPLY:
            r['phone'] = phone
        matched += 1
    print('MATCHED', matched)
    print('\n'.join(report))
    if APPLY:
        open(DATA, 'w', encoding='utf-8').write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
        print('APPLIED')

if __name__ == '__main__':
    main()
