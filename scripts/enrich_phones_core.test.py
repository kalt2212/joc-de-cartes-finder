# Unit tests for enrich_phones_core. Run: python3 scripts/enrich_phones_core.test.py
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from enrich_phones_core import name_ok, city_ok, best_match, km

def test_rejects_different_names():
    assert not name_ok('Nobu', 'Koko')

def test_rejects_cal_mano_vs_el_mano():
    assert not name_ok('Cal Mano', 'El Maño')

def test_rejects_tapas_24_vs_2254():
    assert not name_ok('Tapas 24', 'Tapas 2254')

def test_accepts_same_name_with_accent():
    assert name_ok('Casa Ràfols', 'Casa Rafols')

def test_accepts_article_difference():
    assert name_ok("L'Italianini", 'Italianini')

def test_city_must_match():
    assert city_ok('Barcelona', 'Barcelona')
    assert not city_ok('Reus', 'Barcelona')

def test_distance_is_geodesic():
    assert 0.82 < km(41.4, 2.1, 41.4, 2.11) < 0.85  # 0.01 deg lon at 41.4 deg lat is about 0.834 km

def test_best_match_rejects_far_candidate():
    v = {'name': 'Casa Ràfols', 'city': 'Barcelona', 'lat': 41.4, 'lng': 2.1}
    far = {'name': 'Casa Rafols', 'city': 'Barcelona', 'lat': 41.5, 'lng': 2.1, 'tags': {}}
    assert best_match(v, [far]) is None

def test_best_match_accepts_close_same_city():
    v = {'name': 'Casa Ràfols', 'city': 'Barcelona', 'lat': 41.4, 'lng': 2.1}
    near = {'name': 'Casa Rafols', 'city': 'Barcelona', 'lat': 41.4001, 'lng': 2.1001, 'tags': {'phone': '+34 93 000 00 00'}}
    got = best_match(v, [near])
    assert got is not None and got[2]['tags']['phone'] == '+34 93 000 00 00'

if __name__ == '__main__':
    fns = [v for k, v in list(globals().items()) if k.startswith('test_')]
    for f in fns:
        f()
    print('PASS', len(fns))
