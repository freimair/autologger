import unittest
from parameterized import parameterized

import os

from apps.logbook.database.Model import Model

class TestModel(unittest.TestCase):
    def test_setupDatabase(self):
        dut = Model()

        self.assertTrue(os.path.exists('resources/sqlite3.db'))

    @parameterized.expand([
        ["A", "a", "a"],
        ["B", "a", "b"],
        ["C", "b", "b"],
    ])
    @unittest.skip("parameterized demo")
    def test_parameterized(self, name: str, value: str, expected: str):
        self.assertEqual(value, expected)

if __name__ == '__main__':
    unittest.main()