import json, os, unittest
ROOT = '/data/workspace/joc-de-cartes-finder'
def _load(p):
    with open(p, encoding='utf-8') as fh: return json.load(fh)
class TestSeason1Batch2(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ds = _load(os.path.join(ROOT, 'public', 'data', 'restaurants.json'))
        cls.batch = _load(os.path.join(ROOT, 'data', 'season1_batch2.json'))
        cls.by_id = {r['id']: r for r in cls.ds}
    def test_all_batch_records_are_in_the_dataset(self):
        for b in self.batch:
            self.assertEqual(self.by_id[b['id']], b)
    def test_batch_has_expected_size(self):
        self.assertEqual(len(self.batch), 4)
    def test_phones_are_verified_and_unique(self):
        phones = [b['phone'] for b in self.batch if b.get('phone')]
        self.assertEqual(len(phones), 3)
        self.assertEqual(len(set(phones)), len(phones))
    def test_closed_venues_have_no_phone(self):
        for b in self.batch:
            if b.get('permanentlyClosed'): self.assertNotIn('phone', b, b['id'])
    def test_coordinates_are_inside_catalonia(self):
        for b in self.batch:
            self.assertTrue(40.5 < b['lat'] < 42.6 and 0.3 < b['lng'] < 3.4, b['id'])
    def test_winners_match_the_broadcast(self):
        winners = {b['id'] for b in self.batch if b['winner']}
        self.assertEqual(winners, {'t1-mas-de-prades', 't1-l-era-barruera'})
    def test_all_records_are_season_1_and_verified(self):
        for b in self.batch:
            self.assertEqual(b['season'], 1); self.assertTrue(b['verified']); self.assertTrue(b['sourceUrl'])
    def test_no_unresolved_placeholders_were_added(self):
        for name in ('Albert Guzmán', 'Ida Can Machino', 'El Bouquet', 'Hostal Aude', 'Catacroquet', 'Kao Dim Sum', 'Bobo Pulpín', 'L\'Eggs', 'La Zorra', 'La Cúpula', 'El Groc', 'Ceferino', 'Els Pinxus', 'Comolocas', 'Taco Alto', 'Arepamundi'):
            self.assertFalse(any(b['name'] == name for b in self.batch), name)
if __name__ == '__main__': unittest.main()
