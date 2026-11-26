import re
for n in (16, 17, 18, 19):
    t = open('/tmp/vtt_s1_%d.txt' % n, encoding='utf-8').read()
    print('#####', n)
    for m in re.finditer(r'(ha obtingut|ha aconseguit|suma|ha rebut|puntuació de)[^.]{0,70}', t):
        print('  ...', t[max(0, m.start()-80):m.end()].replace(chr(10), ' '))
