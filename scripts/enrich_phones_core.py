# Pure matching core for phone enrichment: strict name, municipality and distance checks. Used by enrich_phones.py and tested.
import re, math, unicodedata
from difflib import SequenceMatcher

def norm(s):
    # Keep ñ distinct from n (Maño != Mano); strip only combining accents (Ràfols == Rafols).
    s = (s or '').lower().replace('ñ', 'ny')
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()

def km(a, b, c, d):
    R = 6371
    p1, p2 = math.radians(a), math.radians(c)
    dp = p2 - p1
    dl = math.radians(d - b)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))

def numbers(s):
    return tuple(re.findall(r'\d+', s or ''))

STOP = {'el', 'la', 'les', 'els', 'l', 'the', 'de', 'del', 'i', 'and', 'restaurant', 'restaurante', 'bar'}

def tokens(s):
    return [t for t in norm(s).split() if t not in STOP]

def name_ok(a, b):
    # Numeric tokens must match exactly (Tapas 24 != Tapas 2254).
    if numbers(a) != numbers(b):
        return False
    ta, tb = tokens(a), tokens(b)
    if not ta or not tb:
        return False
    # Every significant word must appear in the other name (Cal Mano != El Maño).
    if set(ta) != set(tb) and not (set(ta) <= set(tb) or set(tb) <= set(ta)):
        return False
    return SequenceMatcher(None, norm(a), norm(b)).ratio() >= 0.8

def city_ok(venue_city, osm_city):
    v, o = norm(venue_city), norm(osm_city)
    return bool(v) and bool(o) and (v == o or v in o or o in v)

def best_match(venue, candidates):
    """venue: dict with name, city, lat, lng. candidates: list of dicts with name, lat, lng, city, tags.
    Returns (score, distance_km, candidate) or None. Strict: name, city, <3km."""
    best = None
    for c in candidates:
        if abs(c['lat'] - venue['lat']) > 0.04 or abs(c['lng'] - venue['lng']) > 0.05:
            continue
        dist = km(venue['lat'], venue['lng'], c['lat'], c['lng'])
        if dist >= 3:
            continue
        if not name_ok(venue['name'], c['name']):
            continue
        if not city_ok(venue['city'], c.get('city', '')):
            continue
        s = SequenceMatcher(None, norm(venue['name']), norm(c['name'])).ratio()
        if best is None or (s, -dist) > (best[0], -best[1]):
            best = (s, dist, c)
    return best
