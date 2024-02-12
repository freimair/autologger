from datetime import datetime
import unittest
from parameterized import parameterized

import os
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry
from apps.logbook.database.Message import Message
from apps.logbook.database.Status import Status

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
    ])
    def test_simpleRoundtrip(self, name: str, dut: Entry):
        dut.save()

        actual = dut.__class__.get()
        self.assertIsNotNone(actual)
        self.assertEqual(actual[-1].type, dut.type)
        # self.assertEqual(actual[-1].status, status)

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