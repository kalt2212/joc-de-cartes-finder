# Fetch a 3Cat video's metadata and Catalan VTT via dinamics.ccma.cat, print plain text. usage: python ccma_vtt_fetch.py <idint>
import json, re, sys
from scrapling.fetchers import Fetcher

idint = sys.argv[1]
meta = json.loads(Fetcher.get(f'https://dinamics.ccma.cat/pvideo/media.jsp?media=video&version=0s&idint={idint}&profile=pc_priv', timeout=20).body)
ca = next(s for s in meta['subtitols'] if s['iso'] == 'ca')
vtt = Fetcher.get(ca['url'], timeout=30).body.decode('utf-8', 'ignore')
text = re.sub(r'<[^>]+>', '', vtt)
lines = [l.strip() for l in text.split('\n') if l.strip() and '-->' not in l and not l.startswith(('WEBVTT', 'Region', 'NOTE')) and not re.fullmatch(r'\d+', l.strip())]
print(json.dumps({'titol': meta['informacio']['titol'], 'descripcio': meta['informacio']['descripcio']}, ensure_ascii=False))
print(' '.join(lines))
