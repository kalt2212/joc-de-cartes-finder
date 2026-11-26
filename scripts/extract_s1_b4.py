import json, re, urllib.request
R = '/data/workspace/joc-de-cartes-finder/'
cat = json.load(open(R + 'data/catalog_3cat.json', encoding='utf-8'))['episodes']
TAG = re.compile(r'<[^>]+>')
for n in range(16, 21):
    e = [x for x in cat if x['titol'].startswith('T1xC%d ' % n)][0]
    body = urllib.request.urlopen(e['vtt_url'], timeout=60).read().decode('utf-8', 'replace')
    out = []
    for l in body.splitlines():
        if not l or l.startswith(('WEBVTT', 'Region:', 'NOTE')) or '-->' in l or re.fullmatch(r'\d+', l.strip()): continue
        t = TAG.sub('', l).strip()
        if t and (not out or out[-1] != t): out.append(t)
    txt = ' '.join(out)
    open('/tmp/vtt_s1_%d.txt' % n, 'w', encoding='utf-8').write(txt)
    print('=====', e['titol'], '| LEN', len(txt))
    print('SYN:', e['entradeta'])
    for m in re.finditer(r'\d+ (?:dels|de) 150|\d+ punts|guanyador|guanyadora|és el millor', txt, re.I):
        print('  ...', txt[max(0, m.start()-120):m.end()+60])
