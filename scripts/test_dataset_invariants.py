import json, unittest, os
DS = os.environ.get("DS_PATH", "public/data/restaurants.json")
class TestDatasetInvariants(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows = json.load(open(DS, encoding="utf-8"))
    def test_ids_unique(self):
        ids = [r["id"] for r in self.rows]
        self.assertEqual(len(ids), len(set(ids)))
    def test_phones_unique(self):
        ph = [r["phone"] for r in self.rows if r.get("phone")]
        self.assertEqual(len(ph), len(set(ph)))
    def test_coords_in_spain(self):
        for r in self.rows:
            self.assertTrue(35 < r["lat"] < 44 and -10 < r["lng"] < 5, r["id"])
    def test_marc_score_0_10(self):
        for r in self.rows:
            if r.get("marcScore") is not None:
                self.assertTrue(0 <= r["marcScore"] <= 10, r["id"])
    def test_winner_bool(self):
        for r in self.rows:
            self.assertIsInstance(r["winner"], bool, r["id"])
if __name__ == "__main__":
    unittest.main()
