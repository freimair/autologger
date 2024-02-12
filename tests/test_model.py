import unittest
from parameterized import parameterized

class TestModel(unittest.TestCase):
    def test_helloWorld(self):
        sepp = "Hello World"
        self.assertIsNotNone(sepp)

    @parameterized.expand([
        ["A", "a", "a"],
        ["B", "a", "b"],
        ["C", "b", "b"],
    ])
    def test_parameterized(self, name: str, value: str, expected: str):
        self.assertEqual(value, expected)

if __name__ == '__main__':
    unittest.main()