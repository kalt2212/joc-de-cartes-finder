# For each idint given, write metadata JSON and full plain-text Catalan transcript to /tmp/ccma/<idint>.{json,txt}. usage: batch_fetch_transcripts.py <idint>...
import json, os, re, sys
from scrapling.fetchers import Fetcher

os.makedirs('/tmp/ccma', exist_ok=True)
for idint in sys.argv[1:]:
    meta = json.loads(Fetcher.get(f'https://dinamics.ccma.cat/pvideo/media.jsp?media=video&version=0s&idint={idint}&profile=pc_priv', timeout=20).body)
    ca = next((s for s in meta['subtitols'] if s['iso'] == 'ca'), None)
    if ca is None:
        print('NO_CA', idint); continue
    vtt = Fetcher.get(ca['url'], timeout=30).body.decode('utf-8', 'ignore')
    text = re.sub(r'<[^>]+>', '', vtt)
    lines = [l.strip() for l in text.split('\n') if l.strip() and '-->' not in l and not l.startswith(('WEBVTT', 'Region', 'NOTE')) and not re.fullmatch(r'\d+', l.strip())]
    open(f'/tmp/ccma/{idint}.txt', 'w').write(' '.join(lines))
    json.dump({'titol': meta['informacio']['titol'], 'descripcio': meta['informacio']['descripcio'], 'data': meta['informacio']['data_emissio']['text'], 'url_sub': ca['url']}, open(f'/tmp/ccma/{idint}.json', 'w'), ensure_ascii=False)
    print('OK', idint, len(' '.join(lines)))
