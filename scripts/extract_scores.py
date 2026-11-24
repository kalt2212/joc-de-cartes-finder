"""Extract 3Cat Joc de Cartes scores from local transcripts (TDD module)."""
import re

PTS_RE = re.compile(
    r"([A-ZÀ-Ż][\w'·\- ]{1,40}?)\s+(?:ha obtingut|suma)\s+(\d{1,3})\s+punts\s+d'un\s+total\s+de\s+150"
)
ARTICLES = ("el ", "la ", "els ", "les ", "l'", "d'", "en ", "na ")

LEAD_RE = re.compile(r"^(?:El d'|el d'|El )")

def _strip_article(name):
    return LEAD_RE.sub("", name.strip(), count=1).strip()

def parse_points_150(text):
    out = []
    for m in PTS_RE.finditer(text):
        out.append((_strip_article(m.group(1)), int(m.group(2))))
    return out

MARC_RE = re.compile(
    r"Marc\s+(?:fa que|manté|confirma|desfà|puntua)?\s*(?:el|la|l')?\s*([A-ZÀ-Ż][\w'·\- ]{1,40}?)\b[^.]{0,80}?nota final de\s+(\d+(?:[.,]\d+)?)"
)

def parse_marc_score(text):
    m = MARC_RE.search(text)
    if not m:
        return None
    return (m.group(1).strip(), float(m.group(2).replace(",", ".")))

PLAT_RE = re.compile(r"plat estrella:\s*([^.\n]{3,120})")

def parse_plat_estrella(text):
    m = PLAT_RE.search(text)
    return m.group(1).strip() if m else None

def _norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())

def match_name(name, candidates):
    key = _norm(name)
    hits = [c for c in candidates if _norm(c["name"]) == key]
    if len(hits) == 1:
        return hits[0]
    return None
