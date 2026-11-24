import unittest
from extract_scores import parse_points_150, parse_marc_score, parse_plat_estrella, match_name

class TestParsePoints150(unittest.TestCase):
    def test_simple_sentence(self):
        t = "Vinga. Entrecopes d'en Jordi ha obtingut 93 punts d'un total de 150. La cuina"
        self.assertEqual(parse_points_150(t), [("Entrecopes d'en Jordi", 93)])
    def test_suma_verb(self):
        t = "Les Coques suma 100 punts d'un total de 150. El menú"
        self.assertEqual(parse_points_150(t), [("Les Coques", 100)])
    def test_multiple_in_one_text(self):
        t = ("El d'Anna Sas ha obtingut 100 punts d'un total de 150. L'espai. "
             "El Barhaus ha obtingut 102 punts d'un total de 150. Unes")
        self.assertEqual(parse_points_150(t), [("Anna Sas", 100), ("Barhaus", 102)])
    def test_no_match(self):
        self.assertEqual(parse_points_150("Res a veure aquí."), [])

class TestParseMarc(unittest.TestCase):
    def test_nota_final_with_name(self):
        t = "Marc fa que el Rosamar es consolidi al capdamunt de la classificació amb una nota final de 7,8."
        self.assertEqual(parse_marc_score(t), ("Rosamar", 7.8))
    def test_no_name_is_none(self):
        self.assertIsNone(parse_marc_score("Marc confirma la victòria amb una nota final de 8,1."))
    def test_comma_decimal(self):
        t = "Marc manté el Denver al capdamunt, amb una nota final de 8,1."
        self.assertEqual(parse_marc_score(t), ("Denver", 8.1))

class TestParsePlat(unittest.TestCase):
    def test_plat_estrella_colon(self):
        t = "plat estrella: l'espatlleta de cabrit. Després"
        self.assertEqual(parse_plat_estrella(t), "l'espatlleta de cabrit")
    def test_none(self):
        self.assertIsNone(parse_plat_estrella("res"))

class TestMatchName(unittest.TestCase):
    def test_unambiguous(self):
        cands = [{"id": "a", "name": "Rosamar"}, {"id": "b", "name": "Denver"}]
        self.assertEqual(match_name("Rosamar", cands)["id"], "a")
    def test_ambiguous_returns_none(self):
        cands = [{"id": "a", "name": "Casa Coder"}, {"id": "b", "name": "Casa Coder"}]
        self.assertIsNone(match_name("Casa Coder", cands))
    def test_no_match_returns_none(self):
        self.assertIsNone(match_name("Inexistent", [{"id": "a", "name": "Rosamar"}]))

if __name__ == "__main__":
    unittest.main()
