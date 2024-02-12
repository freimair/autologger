from datetime import datetime
import unittest
from parameterized import parameterized

import os

from apps.logbook.database.Model import Model

class TestModel(unittest.TestCase):
    def test_setupDatabase(self):
        dut = Model(datetime.now(), 0, "landed")
        dut.createTable()

        self.assertTrue(os.path.exists('resources/sqlite3.db'))

    def test_simpleRoundtrip(self):
        dut = Model(datetime.now(), 0, "landed")
        dut.createTable()

        dut.save()
        actual = Model.get()
        self.assertIsNotNone(actual)

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