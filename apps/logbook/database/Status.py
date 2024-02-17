from dataclasses import dataclass
from apps.logbook.database.Entry import Entry

@dataclass(init=False)
class Status(Entry):
    status: str
