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

def now() -> datetime:
    """ Provide timestamp with 1 millisecond resolution"""
    value = datetime.now()
    return value.replace(microsecond=int(value.microsecond / 1000) * 1000)

class TestModel(unittest.TestCase):
    def setUp(self) -> None:
        Database.use("testDatabase")
        if os.path.exists(Database.file): # remove database if it exists already
            os.remove(Database.file)
        Database.createTables() # create new database
        return super().setUp()

    def test_setupDatabase(self):
        self.assertTrue(os.path.exists(Database.file))

    @parameterized.expand([
        ["Status", Status(now(), 'landed')],
        ["Message", Message(now(), 'message')],
        ["Weather", Weather(now(), 102510.6, 64.3, 24.0)],
        ["Telemetry", Telemetry(now(), 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11)]
    ])
    def test_simpleRoundtrip(self, name: str, dut: Entry):
        dut.save()

        actual = dut.__class__.get()
        self.assertIsNotNone(actual)
        self.assertIsInstance(actual[-1], dut.__class__)

        for property, value in vars(dut).items():
            self.assertEqual(actual[-1].__getattribute__(property), value)

    def test_polymorphicRoundtrip(self):
        status = 'landed'
        dut = Status(now(), status)
        dut.createTable()
        dut.save()
        dut = Message(now(), "message")
        dut.createTable()
        dut.save()

        actual = Entry.get()
        self.assertIsNotNone(actual)
        self.assertIsInstance(actual[-1], Message)

    def test_queryLimit(self):
        # Arrange
        numberOfEntries: int = 10
        for i in range(1, numberOfEntries):
            timestamp = now()
            dut = Status(timestamp, "landed")
            dut.save()

        # Act
        resultSingle = Status.get(int(numberOfEntries / 2))
        resultAll = Entry.get(int(numberOfEntries / 2))

        # Assert
        self.assertLessEqual(len(resultSingle), numberOfEntries / 2)
        self.assertEqual(resultSingle[-1].timestamp, timestamp)
        self.assertLessEqual(len(resultAll), numberOfEntries / 2)
        self.assertEqual(resultAll[-1].timestamp, timestamp)

if __name__ == '__main__':
    unittest.main()