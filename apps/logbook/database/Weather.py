from dataclasses import dataclass
from apps.logbook.database.Entry import Entry

@dataclass(init=False)
class Weather(Entry):
    AirPressure: float
    Humidity: float
    AirTemperature: float
