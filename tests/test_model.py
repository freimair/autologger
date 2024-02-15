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

def roundIfDateTime(value):
    """ Provide timestamp with 1 millisecond resolution"""
    if(isinstance(value, datetime)):
        return value.replace(microsecond=int(value.microsecond / 1000) * 1000)
    return value

class TestModel(unittest.TestCase):
    def setUp(self) -> None:
        Database.use("testDatabase")
        if os.path.exists(Database.file): # remove database if it exists already
            os.remove(Database.file)
        Database.createTables() # create new database
        return super().setUp()

    def test_setupDatabase(self):
        self.assertTrue(os.path.exists(Database.file))

    def test_fromDictionary(self):
        """see if incomplete data works, and make sure no alien data gets inserted"""

        fixture = 102510.6
        dut: Weather = Weather.fromDictionary({'airPressure': fixture,
            'unknown': 'unkown'})

        self.assertFalse(hasattr(dut, 'unkown'))
        self.assertFalse(hasattr(dut, 'airTemperature'))
        self.assertEqual(dut.airPressure, fixture)

    @parameterized.expand([
        ["Status", Status.fromDictionary({'status': 'landed'})],
        ["Message", Message.fromDictionary({'message': 'message'})],
        ["Weather", Weather.fromDictionary({'airPressure': 102510.6, 'humidity': 64.3, 'airTemperature': 24.0})],
        ["Telemetry", Telemetry.fromDictionary({'CoG': 120, 'SoG': 7.5})]
    ])
    def test_simpleRoundtrip(self, name: str, dut: Entry):
        dut.save()

        actual = dut.__class__.get()
        self.assertIsNotNone(actual)
        self.assertIsInstance(actual[-1], dut.__class__)

        for property, value in vars(dut).items():
            self.assertEqual(actual[-1].__getattribute__(property), roundIfDateTime(value))

    def test_polymorphicRoundtrip(self):
        status = 'landed'
        dut = Status.fromDictionary({'status': status})
        dut.createTable()
        dut.save()
        dut = Message.fromDictionary({'message': status})
        dut.createTable()
        dut.save()

        actual = Entry.get()
        self.assertIsNotNone(actual)
        self.assertIsInstance(actual[-1], Message)

    def test_queryLimit(self):
        # Arrange
        numberOfEntries: int = 10
        for i in range(1, numberOfEntries):
            dut = Status.fromDictionary({'status': 'status'})
            timestamp = dut.timestamp
            dut.save()

        # Act
        resultSingle = Status.get(int(numberOfEntries / 2))
        resultAll = Entry.get(int(numberOfEntries / 2))

        # Assert
        self.assertLessEqual(len(resultSingle), numberOfEntries / 2)
        self.assertEqual(resultSingle[-1].timestamp, roundIfDateTime(timestamp))
        self.assertLessEqual(len(resultAll), numberOfEntries / 2)
        self.assertEqual(resultAll[-1].timestamp, roundIfDateTime(timestamp))

if __name__ == '__main__':
    unittest.main()