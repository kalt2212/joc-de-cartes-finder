import json, os, unittest
ROOT = '/data/workspace/joc-de-cartes-finder'
def _load(p):
    with open(p, encoding='utf-8') as fh: return json.load(fh)
class TestSeason2Batch1Gap(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ds = _load(os.path.join(ROOT, 'public', 'data', 'restaurants.json'))
        cls.batch = _load(os.path.join(ROOT, 'data', 'season2_batch1_gap.json'))
        cls.by_id = {r['id']: r for r in cls.ds}
    def test_batch_records_are_in_dataset(self):
        for b in self.batch: self.assertEqual(self.by_id[b['id']], b)
    def test_batch_size(self):
        self.assertEqual(len(self.batch), 3)
    def test_ids_are_ascii_and_unique(self):
        ids = [b['id'] for b in self.batch]
        self.assertEqual(len(ids), len(set(ids)))
        for i in ids: self.assertTrue(i.isascii(), i)
    def test_no_closed_venues(self):
        self.assertFalse(any(b.get('permanentlyClosed') for b in self.batch))
    def test_phones_valid_and_unique(self):
        phones = [b['phone'] for b in self.batch]
        self.assertEqual(len(phones), len(set(phones)))
        for p in phones: self.assertRegex(p, r'^\+34 \d{3} \d{2} \d{2} \d{2}$')
    def test_coordinates_in_catalonia(self):
        for b in self.batch: self.assertTrue(40.5 < b['lat'] < 42.6 and 0.3 < b['lng'] < 3.4, b['id'])
    def test_season_and_verification(self):
        for b in self.batch:
            self.assertEqual(b['season'], 2); self.assertTrue(b['verified']); self.assertTrue(b['sourceUrl'])
    def test_no_scores_without_source(self):
        for b in self.batch:
            if b['episodeFinalScore'] is not None: self.assertTrue(b['episodeScoreSource'])
if __name__ == '__main__': unittest.main()
