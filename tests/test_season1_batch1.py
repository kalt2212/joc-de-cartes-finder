import json, os, unittest
ROOT = '/data/workspace/joc-de-cartes-finder'
def _load(p):
    with open(p, encoding='utf-8') as fh: return json.load(fh)
class TestSeason1Batch1(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ds = _load(os.path.join(ROOT, 'public', 'data', 'restaurants.json'))
        cls.batch = _load(os.path.join(ROOT, 'data', 'season1_batch1.json'))
        cls.by_id = {r['id']: r for r in cls.ds}
    def test_all_batch_records_are_in_the_dataset(self):
        for b in self.batch:
            self.assertEqual(self.by_id[b['id']], b)
    def test_batch_has_expected_size_and_closed_count(self):
        self.assertEqual(len(self.batch), 14)
        self.assertEqual(sum(1 for b in self.batch if b.get('permanentlyClosed')), 6)
    def test_batch_phones_are_exactly_the_verified_ones(self):
        got = {b['id']: b['phone'] for b in self.batch if b.get('phone')}
        self.assertEqual(len(got), 8)
        self.assertEqual(got['t1-barhaus'], '+34 977 24 47 70')
        self.assertEqual(got['t1-les-coques'], '+34 977 22 83 00')
        self.assertEqual(got['t1-masia-del-sola'], '+34 938 39 90 25')
        self.assertEqual(got['t1-rio-dragon'], '+34 933 47 93 89')
    def test_closed_venues_have_no_phone(self):
        for b in self.batch:
            if b.get('permanentlyClosed'): self.assertNotIn('phone', b, b['id'])
    def test_coordinates_are_inside_catalonia(self):
        for b in self.batch:
            self.assertTrue(40.5 < b['lat'] < 42.0 and 0.8 < b['lng'] < 3.4, b['id'])
    def test_winners_match_the_broadcast(self):
        winners = {b['id'] for b in self.batch if b['winner']}
        self.assertEqual(winners, {'t1-les-coques', 't1-al-tanto-que-va-de-canto', 't1-rio-dragon'})
    def test_all_records_are_season_1_and_verified(self):
        for b in self.batch:
            self.assertEqual(b['season'], 1); self.assertTrue(b['verified']); self.assertTrue(b['sourceUrl'])
    def test_no_unresolved_placeholders_were_added(self):
        for name in ('Caña de Azúcar', 'Alkaline', 'La Magnòlia'):
            self.assertFalse(any(b['name'] == name for b in self.batch), name)
if __name__ == '__main__': unittest.main()
