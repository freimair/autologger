from dataclasses import dataclass
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
