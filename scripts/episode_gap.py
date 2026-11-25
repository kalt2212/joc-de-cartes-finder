# Cross-reference the 3Cat episode catalog with restaurants.json. Read-only; prints gap lists as JSON.
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(ROOT, 'data', 'catalog_3cat.json')
RESTAURANTS = os.path.join(ROOT, 'public', 'data', 'restaurants.json')
KEY = re.compile(r'T(\d+)xC(\d+)')

class SchemaError(Exception):
    pass

def episode_key(title):
    """(season, chapter) from a title like 'T10xC3 - ...', or None when the title has no such key."""
    m = KEY.search(title or '')
    return (int(m.group(1)), int(m.group(2))) if m else None

def gap(catalog, restaurants):
    for e in catalog:
        if 'titol' not in e or 'id' not in e:
            raise SchemaError(f'catalog episode missing id/titol: {e!r}')
    for r in restaurants:
        if 'id' not in r or 'name' not in r:
            raise SchemaError(f'restaurant missing id/name: {r!r}')
    cat_keys = {episode_key(e['titol']) for e in catalog}
    rest_keys = {episode_key(r.get('episodeTitle')) for r in restaurants}
    eps_without = [e for e in catalog if episode_key(e['titol']) not in rest_keys]
    unknown = [r for r in restaurants if episode_key(r.get('episodeTitle')) and episode_key(r.get('episodeTitle')) not in cat_keys]
    no_key = [r for r in restaurants if not episode_key(r.get('episodeTitle'))]
    return {
        'totals': {'episodes': len(catalog), 'episodes_without_restaurants': len(eps_without),
                   'restaurants': len(restaurants), 'restaurants_without_episode_key': len(no_key)},
        'episodes_without_restaurants': [{'id': e['id'], 'titol': e['titol']} for e in eps_without],
        'restaurants_unknown_episode': [{'id': r['id'], 'name': r['name'], 'episodeTitle': r.get('episodeTitle')} for r in unknown],
        'restaurants_without_episode_key': [{'id': r['id'], 'name': r['name'], 'episodeTitle': r.get('episodeTitle')} for r in no_key],
    }

def main():
    catalog = json.load(open(CATALOG, encoding='utf-8'))['episodes']
    restaurants = json.load(open(RESTAURANTS, encoding='utf-8'))
    print(json.dumps(gap(catalog, restaurants), ensure_ascii=False, indent=1))

if __name__ == '__main__':
    sys.exit(main())
