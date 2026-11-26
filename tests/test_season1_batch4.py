import json, os, unittest
ROOT = '/data/workspace/joc-de-cartes-finder'
def _load(p):
    with open(p, encoding='utf-8') as fh: return json.load(fh)
class TestSeason1Batch4(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ds = _load(os.path.join(ROOT, 'public', 'data', 'restaurants.json'))
        cls.batch = _load(os.path.join(ROOT, 'data', 'season1_batch4.json'))
        cls.by_id = {r['id']: r for r in cls.ds}
    def test_all_batch_records_are_in_the_dataset(self):
        for b in self.batch:
            self.assertEqual(self.by_id[b['id']], b)
    def test_batch_has_expected_size(self):
        self.assertEqual(len(self.batch), 4)
    def test_closed_venues_are_flagged_and_have_no_phone(self):
        closed = {b['id'] for b in self.batch if b.get('permanentlyClosed')}
        self.assertEqual(closed, {'t1-vintage-palamos'})
        for b in self.batch:
            if b.get('permanentlyClosed'): self.assertNotIn('phone', b, b['id'])
    def test_open_venues_have_a_phone(self):
        for b in self.batch:
            if not b.get('permanentlyClosed'): self.assertIn('phone', b, b['id'])
    def test_phones_are_unique_and_valid(self):
        phones = [b['phone'] for b in self.batch if b.get('phone')]
        self.assertEqual(len(phones), len(set(phones)))
        for p in phones: self.assertRegex(p, r'^\+34 \d{3} \d{2} \d{2} \d{2}$')
    def test_coordinates_are_inside_catalonia(self):
        for b in self.batch:
            self.assertTrue(40.5 < b['lat'] < 42.6 and 0.3 < b['lng'] < 3.4, b['id'])
    def test_winners_match_the_broadcast(self):
        winners = {b['id'] for b in self.batch if b['winner']}
        self.assertEqual(winners, {'t1-tragamar', 't1-larrosseria'})
    def test_all_records_are_season_1_and_verified(self):
        for b in self.batch:
            self.assertEqual(b['season'], 1); self.assertTrue(b['verified']); self.assertTrue(b['sourceUrl'])
    def test_unverified_venues_are_not_added(self):
        for name in ('Picnic Platja', 'Restaurant Picnic', 'L\'Aixart', 'Hotel l\'Aixart', 'Cal Torru', 'Els Torrents', 'Fonda Cobadana', 'La Santa', 'Autèntik Club', 'Cal Pinxo'):
            self.assertFalse(any(b['name'] == name for b in self.batch), name)
if __name__ == '__main__': unittest.main()
