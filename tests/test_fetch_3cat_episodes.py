import json, os, re, sys, unittest
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'scripts'))
import fetch_3cat_episodes as f

def item(**over):
    base = {
        'id': 5765865, 'titol': 'T2xC9 - El millor restaurant familiar del Vallès',
        'capitol': 29, 'data_emissio': '23/05/2018 22:39:28', 'durada': '01:08:13:20',
        'entradeta': 'Comencem amb en Xavier, de La Masia, restaurant de grans finestrals. Seguidament, visitem Can Farell, de la Mireia, un espai. Continuem la ruta fins a trobar el Julià i El Portal Vell, una cuina tradicional. I, finalment, l\'artista Katy i el Candombe.',
        'subtitols': [{'url': 'https://statics.3cat.cat/x.vtt', 'format': 'vtt', 'iso': 'ca'}],
    }
    base.update(over)
    return base

def page(items, pagina, total_pagines):
    return json.dumps({'resposta': {'status': 'OK', 'items': {'num': len(items), 'item': items},
                                    'paginacio': {'total_items': 183, 'items_pagina': 50,
                                                  'pagina_actual': pagina, 'total_pagines': total_pagines}}}).encode()

class FakeOpener:
    def __init__(self, pages):
        self.pages = pages; self.calls = []
    def __call__(self, url, timeout):
        self.calls.append((url, timeout))
        n = int(re.search(r'[?&]pagina=(\d+)', url).group(1))
        return self.pages[n]

class TestParsing(unittest.TestCase):
    def test_episode_fields_extracted(self):
        ep = f.episode_from_item(item())
        self.assertEqual(ep['id'], 5765865)
        self.assertEqual(ep['capitol'], 29)
        self.assertEqual(ep['data_emissio'], '23/05/2018 22:39:28')
        self.assertEqual(ep['durada'], '01:08:13:20')
        self.assertEqual(ep['vtt_url'], 'https://statics.3cat.cat/x.vtt')

    def test_missing_required_field_raises_schema_error(self):
        bad = item(); del bad['entradeta']
        with self.assertRaises(f.SchemaError):
            f.episode_from_item(bad)

    def test_no_vtt_gives_none(self):
        self.assertIsNone(f.episode_from_item(item(subtitols=[]))['vtt_url'])

    def test_page_without_resposta_raises(self):
        with self.assertRaises(f.SchemaError):
            f.parse_page(b'{"other": 1}')

    def test_restaurants_left_unset(self):
        self.assertIsNone(f.episode_from_item(item())['restaurants'])

class TestPagination(unittest.TestCase):
    def test_fetches_all_pages_and_collects_items(self):
        pages = {1: page([item(id=1, capitol=1)], 1, 2), 2: page([item(id=2, capitol=2)], 2, 2)}
        op = FakeOpener(pages)
        eps = f.fetch_all(opener=op)
        self.assertEqual([e['id'] for e in eps], [1, 2])
        self.assertEqual(len(op.calls), 2)

    def test_every_request_has_timeout(self):
        op = FakeOpener({1: page([item()], 1, 1)})
        f.fetch_all(opener=op)
        self.assertTrue(all(t and t > 0 for _, t in op.calls))

    def test_url_has_expected_filters(self):
        op = FakeOpener({1: page([item()], 1, 1)})
        f.fetch_all(opener=op)
        url = op.calls[0][0]
        for part in ['programatv_id=55896', 'items_pagina=50', 'idioma=PU_CATALA', 'ordre=capitol']:
            self.assertIn(part, url)

class TestVtt(unittest.TestCase):
    def test_vtt_from_detail_payload(self):
        detail = json.dumps({'subtitols': [{'url': 'https://statics.3cat.cat/v.vtt', 'format': 'vtt'}]}).encode()
        self.assertEqual(f.vtt_from_detail(detail), 'https://statics.3cat.cat/v.vtt')

    def test_vtt_none_when_no_subtitles(self):
        self.assertIsNone(f.vtt_from_detail(json.dumps({'subtitols': []}).encode()))

    def test_vtt_detail_schema_change_raises(self):
        with self.assertRaises(f.SchemaError):
            f.vtt_from_detail(b'{"other": 1}')


if __name__ == '__main__':
    unittest.main()
