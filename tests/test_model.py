from datetime import datetime
import unittest
from parameterized import parameterized

import os
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry
from apps.logbook.database.Message import Message
from apps.logbook.database.Status import Status
from apps.logbook.database.Weather import Weather

class TestModel(unittest.TestCase):
    def setUp(self) -> None:
        Database.createTables()
        return super().setUp()

    def test_setupDatabase(self):
        dut = Status(datetime.now(), "landed")
        dut.createTable()
        self.assertTrue(os.path.exists('resources/sqlite3.db'))

    @parameterized.expand([
        ["Status", Status(datetime.now(), 'landed')],
        ["Message", Message(datetime.now(), 'message')],
        ["Weather", Weather(datetime.now(), 102510.6, 64.3, 24.0)],
    ])
    def test_simpleRoundtrip(self, name: str, dut: Entry):
        dut.save()

        actual = dut.__class__.get()
        self.assertIsNotNone(actual)
        self.assertEqual(actual[-1].type, dut.type)

    def test_polymorphicRoundtrip(self):
        status = 'landed'
        dut = Status(datetime.now(), status)
        dut.createTable()
        dut.save()
        dut = Message(datetime.now(), "message")
        dut.createTable()
        dut.save()

        actual = Entry.get()
        self.assertIsNotNone(actual)
        self.assertEqual(actual[-1].type, Message.type)

if __name__ == '__main__':
    unittest.main()