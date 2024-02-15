from dataclasses import dataclass
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry

@dataclass(init=False)
class Status(Entry):
    status: str

    @classmethod
    def createTable(cls):
        super(Status, cls).createTable("""
                    status TEXT
            """)
