from dataclasses import dataclass
from apps.logbook.database.Entry import Entry

@dataclass(init=False)
class Weather(Entry):
    airPressure: float
    humidity: float
    airTemperature: float
