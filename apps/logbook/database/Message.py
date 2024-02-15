from dataclasses import dataclass
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry

@dataclass
class Message(Entry):
    message: str

    @classmethod
    def fromArray(cls, data):
        instance = cls(data[1])
        instance._setTimestamp(data[0])
        return instance


    @classmethod
    def createTable(cls):
        super(Message, cls).createTable("""
                    message TEXT
            """)
