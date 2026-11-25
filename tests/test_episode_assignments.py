import json, os, re, unittest

def _load(path):
    with open(path, encoding='utf-8') as fh:
        return json.load(fh)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAT = os.path.join(ROOT, 'data', 'catalog_3cat.json')
RES = os.path.join(ROOT, 'public', 'data', 'restaurants.json')
ASSIGN = os.path.join(ROOT, 'data', 'episode_assignments.json')
KEY = re.compile(r'^T\d+xC\d+$')

class TestEpisodeAssignments(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cat = _load(CAT)['episodes']
        cls.res = {r['id']: r for r in _load(RES)}
        cls.assign = _load(ASSIGN)
        cls.keys = {re.search(r'T\d+xC\d+', e['titol']).group(0): e for e in cls.cat}

    def test_every_assignment_key_is_a_real_catalog_episode(self):
        for rid, key in self.assign.items():
            self.assertRegex(key, KEY, rid)
            self.assertIn(key, self.keys, f'{rid} -> {key} not in catalog')

    def test_assigned_restaurant_is_named_in_the_synopsis(self):
        for rid, key in self.assign.items():
            text = self.keys[key]['entradeta']
            name = self.res[rid]['name']
            core = re.sub(r'^(Restaurant|Hotel|Hostal|Bar)\s+', '', name).replace('Restaurant', '').strip()
            self.assertTrue(core.split()[0].lower() in text.lower(), f'{rid} ({name}) not in {key} synopsis')

    def test_applied_assignments_match_the_file(self):
        for rid, key in self.assign.items():
            self.assertRegex(self.res[rid].get('episodeTitle') or '', re.escape(key) + r' - ', rid)

    def test_no_restaurant_gets_a_key_outside_the_assignment_file(self):
        for rid, r in self.res.items():
            if rid in self.assign:
                continue
            original_has_key = bool(re.search(r'T\d+xC\d+', r.get('episodeTitle') or ''))
            self.assertTrue(original_has_key or rid == 'ciri-taverna-del-ciri', rid)

    def test_all_unlinked_restaurants_except_the_presenter_are_assigned(self):
        unlinked = [rid for rid, r in self.res.items() if not re.search(r'T\d+xC\d+', r.get('episodeTitle') or '')]
        self.assertEqual(sorted(set(unlinked) - set(self.assign)), ['ciri-taverna-del-ciri'])

if __name__ == '__main__':
    unittest.main()
