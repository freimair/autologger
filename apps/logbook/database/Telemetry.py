from dataclasses import dataclass
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry

@dataclass(init=False)
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