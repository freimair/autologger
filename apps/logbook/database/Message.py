from dataclasses import dataclass
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry

@dataclass(init=False)
class Message(Entry):
    message: str

    @classmethod
    def createTable(cls):
        super(Message, cls).createTable("""
                    message TEXT
            """)
