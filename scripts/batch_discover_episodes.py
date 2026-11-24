# Discover Joc de Cartes episode video ids per season from 3Cat season pages. Writes JSON to stdout.
import json, re, sys
from scrapling.fetchers import Fetcher

seasons = [int(s) for s in sys.argv[1:]] or list(range(1, 11))
out = {}
for s in seasons:
    page = Fetcher.get(f'https://www.3cat.cat/3cat/joc-de-cartes/capitols/temporada/{s}/', timeout=30)
    hrefs = [a.attrib.get('href', '') for a in page.css('a')]
    eps = sorted(set(h for h in hrefs if re.search(r'/3cat/[^/]+/video/\d+/', h)))
    out[s] = [{'url': 'https://www.3cat.cat' + h, 'idint': re.search(r'/video/(\d+)/', h).group(1), 'slug': h.split('/')[2]} for h in eps]
print(json.dumps(out, ensure_ascii=False, indent=1))
