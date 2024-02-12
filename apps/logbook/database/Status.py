from dataclasses import dataclass
from datetime import datetime
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry

@dataclass
class Status(Entry):
    status: str

    @classmethod
    def fromArray(cls, data):
        return cls(datetime.fromtimestamp(data[0] / 1000), data[1])


    @classmethod
    def createTable(cls):
        super(Status, cls).createTable("""
                    status TEXT
            """)

    def save(self):
        with Database() as cursor:
            cursor.execute("INSERT INTO " + self.__class__.__name__ + " (timestamp, status) VALUES (:timestamp, :status)", {
                'timestamp': int(self.timestamp.timestamp() * 1000),
                'status': self.status
                })