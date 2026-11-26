import json, os, unittest
ROOT = '/data/workspace/joc-de-cartes-finder'
def _load(p):
    with open(p, encoding='utf-8') as fh: return json.load(fh)
class TestSeason1Batch3(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ds = _load(os.path.join(ROOT, 'public', 'data', 'restaurants.json'))
        cls.batch = _load(os.path.join(ROOT, 'data', 'season1_batch3.json'))
        cls.by_id = {r['id']: r for r in cls.ds}
    def test_all_batch_records_are_in_the_dataset(self):
        for b in self.batch:
            self.assertEqual(self.by_id[b['id']], b)
    def test_batch_has_expected_size(self):
        self.assertEqual(len(self.batch), 3)
    def test_closed_venue_is_flagged_and_has_no_phone(self):
        closed = {b['id'] for b in self.batch if b.get('permanentlyClosed')}
        self.assertEqual(closed, {'t1-l-estel-de-la-merce'})
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
        self.assertEqual(winners, {'t1-divinum'})
    def test_all_records_are_season_1_and_verified(self):
        for b in self.batch:
            self.assertEqual(b['season'], 1); self.assertTrue(b['verified']); self.assertTrue(b['sourceUrl'])
    def test_unverified_venues_are_not_added(self):
        for name in ('Munich', 'München', 'Els Jardins de la Mercè', 'Els Fogons de la Carme', 'Ferreruela', 'Casa Mercè', 'L Hivernacle', 'Masnou', 'Les Fulles d en Jordà', 'La Deu', 'Capritx'):
            self.assertFalse(any(b['name'] == name for b in self.batch), name)
if __name__ == '__main__': unittest.main()
