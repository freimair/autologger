from dataclasses import dataclass
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry

@dataclass
class Weather(Entry):
    airPressure: float
    humidity: float
    airTemperature: float
    type = 3

    @classmethod
    def fromArray(cls, data):
        return cls(data[0] / 1000, data[2] / 10, data[3] / 10, data[4] / 10)

    @classmethod
    def createTable(cls):
        super(Weather, cls).createTable("""
                    airPressure INTEGER,
                    humidity INTEGER,
                    airTemperature INTEGER
            """)

    def save(self):
        with Database() as cursor:
            cursor.execute("INSERT INTO " + self.__class__.__name__ + " (timestamp, type, airPressure, humidity, airTemperature) VALUES (:timestamp, :type, :pressure, :humidity, :temperature)", {
                'timestamp': int(self.timestamp.timestamp() * 1000),
                'type': self.type,
                'pressure': self.airPressure * 10,
                'humidity': self.humidity * 10,
                'temperature': self.airTemperature * 10,
                })