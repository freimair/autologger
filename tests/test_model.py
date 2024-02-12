from datetime import datetime
import unittest
from parameterized import parameterized

import os
from apps.logbook.database.Entry import Entry
from apps.logbook.database.Status import Status

class TestModel(unittest.TestCase):
    def test_setupDatabase(self):
        dut = Status(datetime.now(), "landed")
        dut.createTable()

        self.assertTrue(os.path.exists('resources/sqlite3.db'))

    def test_simpleRoundtrip(self):
        status = 'landed'
        dut = Status(datetime.now(), status)
        dut.createTable()

        dut.save()
        actual = Status.get()
        self.assertIsNotNone(actual)
        self.assertEqual(actual[-1].status, status)

    def test_polymorphicRoundtrip(self):
        status = 'landed'
        dut = Status(datetime.now(), status)
        dut.createTable()

        dut.save()
        actual = Entry.get()
        self.assertIsNotNone(actual)
        self.assertEqual(actual[-1].type, Status.type)


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