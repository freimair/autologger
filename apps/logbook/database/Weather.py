from dataclasses import dataclass
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry

@dataclass
class Weather(Entry):
    airPressure: float
    humidity: float
    airTemperature: float

    @classmethod
    def fromArray(cls, data):
        instance = cls(data[1], data[2], data[3])
        instance.setTimestamp(data[0])
        return instance

    @classmethod
    def createTable(cls):
        super(Weather, cls).createTable("""
                    airPressure INTEGER,
                    humidity INTEGER,
                    airTemperature INTEGER
            """)
