from dataclasses import dataclass
from apps.logbook.database.Entry import Entry

@dataclass(init=False)
class Message(Entry):
    subject: str
    content: str
