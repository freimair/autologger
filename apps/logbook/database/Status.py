from dataclasses import dataclass
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry

@dataclass
class Status(Entry):
    status: str

    @classmethod
    def fromArray(cls, data):
        instance = cls(data[1])
        instance.setTimestamp(data[0])
        return instance


    @classmethod
    def createTable(cls):
        super(Status, cls).createTable("""
                    status TEXT
            """)
