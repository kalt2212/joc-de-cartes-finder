# Process each episode transcript 1x1: confrontation window (last 40%) winner extraction + intro restaurant mentions. Writes candidates only; never ingests.
import json, re, glob, os, sys
WIN = re.compile(r'(?:guanyador (?:és|es)|es proclama guanyador|es proclama guanyadora|guanya el programa)[^.!?]{0,20}\.{0,3}\s*((?:el |la |l\')?[^.!?]{2,60}?)[.!?]', re.I)
out = []
for f in sorted(glob.glob('/tmp/ccma/*.txt')):
    idint = os.path.basename(f)[:-4]
    t = open(f, encoding='utf-8').read()
    n = len(t)
    tail = t[int(n*0.6):]  # confrontation region
    m = WIN.findall(tail)
    cands = sorted({x.strip() for x in m if 2 < len(x.strip()) < 60})
    out.append({'idint': idint, 'chars': n, 'winner_candidates': cands[:3], 'status': 'CANDIDATE' if len(cands)==1 else ('AMBIGUOUS' if cands else 'NO_WINNER_PATTERN')})
json.dump(out, open('/tmp/proc/candidates.json','w',encoding='utf-8'), ensure_ascii=False, indent=1)
from collections import Counter
print(Counter(o['status'] for o in out), 'total', len(out))
