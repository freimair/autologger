from dataclasses import dataclass
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry

@dataclass
class Telemetry(Entry):
    CoG: int
    SoG: float
    Heading: int
    Windspeed: float
    WindAngle: int
    Log: float
    Latitude: float
    Longitude: float
    Depth: float
    DepthOffset: float
    SpeedThroughWater: float

    @classmethod
    def fromArray(cls, data):
        return cls(data[0] / 1000, data[1], data[2] / 10, data[3], data[4] / 10, data[5], data[6] / 10, data[7] / 10000000, data[8] / 10000000, data[9] / 10, data[10] / 10, data[11] / 10)


    @classmethod
    def createTable(cls):
        super(Telemetry, cls).createTable("""
                    CoG INTEGER,
                    SoG INTEGER,
                    Heading INTEGER,
                    Windspeed INTEGER,
                    WindAngle INTEGER,
                    Log INTEGER,
                    Latitude INTEGER,
                    Longitude INTEGER,
                    Depth INTEGER,
                    DepthOffset INTEGER,
                    SpeedThroughWater INTEGER
            """)

    def save(self):
        with Database() as cursor:
            cursor.execute("INSERT INTO " + self.__class__.__name__ + " (timestamp, CoG, SoG, Heading, Windspeed, WindAngle, Log, Latitude, Longitude, Depth, DepthOffset, SpeedThroughWater) VALUES (:timestamp, :cog, :sog, :heading, :windspeed, :windangle, :log, :lat, :lon, :depth, :depthOffset, :speedthroughwater)", {
                'timestamp': int(self.timestamp.timestamp() * 1000),
                'cog': self.CoG,
                'sog': self.SoG * 10,
                'heading': self.Heading,
                'windspeed': self.Windspeed * 10,
                'windangle': self.WindAngle,
                'log': self.Log * 10,
                'lat': self.Latitude * 10000000,
                'lon': self.Longitude * 10000000,
                'depth': self.Depth * 10,
                'depthOffset': self.DepthOffset * 10,
                'speedthroughwater': self.SpeedThroughWater * 10
                })