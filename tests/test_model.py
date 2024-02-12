from datetime import datetime
import unittest
from parameterized import parameterized

import os
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry
from apps.logbook.database.Message import Message
from apps.logbook.database.Status import Status
from apps.logbook.database.Telemetry import Telemetry
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
        ["Telemetry", Telemetry(datetime.now(), 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11)]
    ])
    def test_simpleRoundtrip(self, name: str, dut: Entry):
        dut.save()

        actual = dut.__class__.get()
        self.assertIsNotNone(actual)
        self.assertIsInstance(actual[-1], dut.__class__)

        for property, value in vars(dut).items():
            if(isinstance(value, datetime)): # we do not memorize microseconds in our system, only milliseconds
                value = value.replace(microsecond=int(value.microsecond / 1000) * 1000)
            self.assertEqual(actual[-1].__getattribute__(property), value)

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
        self.assertIsInstance(actual[-1], Message)

if __name__ == '__main__':
    unittest.main()