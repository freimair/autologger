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
        instance = cls(data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8], data[9], data[10], data[11])
        instance._setTimestamp(data[0])
        return instance


    @classmethod
    def createTable(cls):
        super(Telemetry, cls).createTable("""
                    CoG INTEGER,
                    SoG REAL,
                    Heading INTEGER,
                    Windspeed REAL,
                    WindAngle INTEGER,
                    Log REAL,
                    Latitude REAL,
                    Longitude REAL,
                    Depth REAL,
                    DepthOffset REAL,
                    SpeedThroughWater REAL
            """)