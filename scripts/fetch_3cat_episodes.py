# Index the 3Cat "Joc de cartes" episode catalog from api.3cat.cat (read-only). Writes data/catalog_3cat.json.
import json, os, re, sys, urllib.request

BASE = 'https://api.3cat.cat/videos'
PROGRAMA_ID = 55896
TIMEOUT = 30
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'catalog_3cat.json')
REQUIRED = ['id', 'titol', 'capitol', 'data_emissio', 'durada', 'entradeta']

class SchemaError(Exception):
    pass

def page_url(pagina):
    return (f'{BASE}?version=2.0&_format=json&items_pagina=50&tipus_contingut=PPD&ordre=capitol'
            f'&idioma=PU_CATALA&programatv_id={PROGRAMA_ID}&perfil=default&pagina={pagina}')

def http_get(url, timeout=TIMEOUT):
    with urllib.request.urlopen(url, timeout=timeout) as r:
        return r.read()

def parse_page(body):
    try:
        data = json.loads(body.decode('utf-8', 'replace'))
        resposta = data['resposta']
        items = resposta['items']['item']
        pag = resposta['paginacio']
        int(pag['total_pagines'])
    except (ValueError, KeyError, TypeError) as e:
        raise SchemaError(f'unexpected 3Cat page schema: {e!r}')
    if not isinstance(items, list):
        raise SchemaError('items.item is not a list')
    return items, int(pag['total_pagines'])

def episode_from_item(it):
    for k in REQUIRED:
        if k not in it:
            raise SchemaError(f'episode {it.get("id", "?")} missing field {k}')
    vtt = next((s.get('url') for s in (it.get('subtitols') or []) if s.get('format') == 'vtt'), None)
    return {
        'id': it['id'], 'titol': it['titol'], 'capitol': it['capitol'],
        'data_emissio': it['data_emissio'], 'durada': it['durada'],
        'entradeta': it['entradeta'], 'vtt_url': vtt,
        'restaurants': None,  # not extracted: synopsis parsing is unreliable; pending manual/transcript review
    }

DETAIL = 'https://dinamics.ccma.cat/pvideo/media.jsp?media=video&version=0s&idint={id}&profile=pc_priv'

def vtt_from_detail(body):
    """Return the Catalan VTT URL from the CCMA detail payload, or None if the video has no subtitles."""
    try:
        subs = json.loads(body.decode('utf-8', 'replace'))['subtitols']
    except (ValueError, KeyError, TypeError) as e:
        raise SchemaError(f'unexpected CCMA detail schema: {e!r}')
    if not isinstance(subs, list):
        raise SchemaError('subtitols is not a list')
    return next((s['url'] for s in subs if s.get('format') == 'vtt' and s.get('url')), None)

def attach_vtt(episodes, opener=http_get):
    for ep in episodes:
        ep['vtt_url'] = vtt_from_detail(opener(DETAIL.format(id=ep['id']), TIMEOUT))
    return episodes

def fetch_all(opener=http_get):
    first_items, total = parse_page(opener(page_url(1), TIMEOUT))
    items = list(first_items)
    for p in range(2, total + 1):
        more, _ = parse_page(opener(page_url(p), TIMEOUT))
        items.extend(more)
    return [episode_from_item(it) for it in items]

def main():
    eps = attach_vtt(fetch_all())
    eps.sort(key=lambda e: (e['capitol'] or 0, e['id']))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as fh:
        json.dump({'programa_id': PROGRAMA_ID, 'count': len(eps), 'episodes': eps}, fh, ensure_ascii=False, indent=2)
    print('EPISODES', len(eps))

if __name__ == '__main__':
    sys.exit(main())
