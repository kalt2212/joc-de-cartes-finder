# Print title, air date and the closing-results excerpt of each transcript in /tmp/ccma. usage: batch_extract_results.py <idint>...
import json, sys
KEYS = ['guanyador és', 'El guanyador', 'ha guanyat', 'guanya el', 'Enhorabona', 'classificació provisional', 'medalla de plata']
for idint in sys.argv[1:]:
    meta = json.load(open(f'/tmp/ccma/{idint}.json', encoding='utf-8'))
    text = open(f'/tmp/ccma/{idint}.txt', encoding='utf-8').read()
    print('==', idint, meta['titol'], '|', meta['data'])
    for kw in KEYS:
        i = text.find(kw)
        if i >= 0:
            print('  [' + kw + ']', text[max(0, i - 200):i + 260])
            break
    else:
        print('  NO_KEYWORD_MATCH tail:', text[-400:])
