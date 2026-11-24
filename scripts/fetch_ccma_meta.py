# Fetch official CCMA metadata (title, description) for every transcript id. Read-only.
import json, glob, os
from scrapling.fetchers import Fetcher
ids = sorted(os.path.basename(f)[:-4] for f in glob.glob('/tmp/ccma/*.txt'))
out = {}
for idint in ids:
    try:
        p = Fetcher.get(f'https://dinamics.ccma.cat/pvideo/media.jsp?media=video&version=0s&idint={idint}', timeout=30)
        inf = json.loads(p.body.decode('utf-8', 'ignore'))['informacio']
        out[idint] = {'titol': inf['titol'], 'desc': inf['descripcio']}
    except Exception as e:
        out[idint] = {'err': str(e)[:80]}
json.dump(out, open('/tmp/proc/meta.json', 'w', encoding='utf-8'), ensure_ascii=False)
print('META', len(out), 'ERR', sum(1 for v in out.values() if 'err' in v))
