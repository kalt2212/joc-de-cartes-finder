import json, os, sys, unittest
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'scripts'))
import episode_gap as g

CAT = [{'id': 1, 'titol': 'T1xC1 - A'}, {'id': 2, 'titol': 'T1xC2 - B'}, {'id': 3, 'titol': 'T2xC1 - C'}]
REST = [
    {'id': 'r1', 'name': 'Alfa', 'episodeTitle': 'T1xC1 - A (emès el 1/1/2017)'},
    {'id': 'r2', 'name': 'Beta', 'episodeTitle': 'Lleida (emès el 26/03/2026)'},
    {'id': 'r3', 'name': 'Gamma', 'episodeTitle': 'T9xC9 - Z'},
]

class TestGap(unittest.TestCase):
    def setUp(self):
        self.res = g.gap(CAT, REST)

    def test_episode_key_parsed(self):
        self.assertEqual(g.episode_key('T10xC3 - X'), (10, 3))
        self.assertIsNone(g.episode_key('Lleida (emès el 26/03/2026)'))

    def test_lists_episodes_without_restaurants(self):
        self.assertEqual([e['id'] for e in self.res['episodes_without_restaurants']], [2, 3])

    def test_lists_restaurants_with_unknown_episode(self):
        self.assertEqual([r['id'] for r in self.res['restaurants_unknown_episode']], ['r3'])

    def test_lists_restaurants_without_episode_key(self):
        self.assertEqual([r['id'] for r in self.res['restaurants_without_episode_key']], ['r2'])

    def test_counts_are_consistent(self):
        self.assertEqual(self.res['totals']['episodes'], 3)
        self.assertEqual(self.res['totals']['episodes_without_restaurants'], 2)

    def test_schema_change_raises(self):
        with self.assertRaises(g.SchemaError):
            g.gap([{'id': 1}], REST)

if __name__ == '__main__':
    unittest.main()
