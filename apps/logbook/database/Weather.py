from dataclasses import dataclass
from datetime import datetime
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry

@dataclass
class Weather(Entry):
    airPressure: float
    humidity: float
    airTemperature: float

    @classmethod
    def fromArray(cls, data):
        return cls(datetime.fromtimestamp(data[0] / 1000), data[1] / 10, data[2] / 10, data[3] / 10)

    @classmethod
    def createTable(cls):
        super(Weather, cls).createTable("""
                    airPressure INTEGER,
                    humidity INTEGER,
                    airTemperature INTEGER
            """)

    def save(self):
        with Database() as cursor:
            cursor.execute("INSERT INTO " + self.__class__.__name__ + " (timestamp, airPressure, humidity, airTemperature) VALUES (:timestamp, :pressure, :humidity, :temperature)", {
                'timestamp': int(self.timestamp.timestamp() * 1000),
                'pressure': self.airPressure * 10,
                'humidity': self.humidity * 10,
                'temperature': self.airTemperature * 10,
                })