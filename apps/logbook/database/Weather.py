from dataclasses import dataclass
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry

@dataclass(init=False)
class Weather(Entry):
    airPressure: float
    humidity: float
    airTemperature: float

    @classmethod
    def createTable(cls):
        super(Weather, cls).createTable("""
                    airPressure INTEGER,
                    humidity INTEGER,
                    airTemperature INTEGER
            """)
