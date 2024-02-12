from dataclasses import dataclass
from datetime import datetime
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry

@dataclass
class Status(Entry):
    status: str
    type = 1

    @classmethod
    def fromArray(cls, data):
        return cls(data[0] / 1000, data[2])


    def createTable(self):
        with Database() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS """ + self.__class__.__name__ + """ (
                    timestamp INTEGER,
                    type INTEGER,
                    status TEXT
                )
                """)

    def save(self):
        with Database() as cursor:
            cursor.execute("INSERT INTO " + self.__class__.__name__ + " (timestamp, type, status) VALUES (:timestamp, :type, :status)", {
                'timestamp': int(self.timestamp.timestamp() * 1000),
                'type': self.type,
                'status': self.status
                })