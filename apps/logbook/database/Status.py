from dataclasses import dataclass
from datetime import datetime
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry

@dataclass
class Status(Entry):
    status: str
    type = 1

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
                'timestamp': int(self.timestamp.timestamp() * 1000 + self.timestamp.microsecond),
                'type': self.type,
                'status': self.status
                })

    @classmethod
    def get(cls, since: datetime|None = None, until: datetime = datetime.now()) -> list:
        with Database() as cursor:
            entries = cursor.execute("SELECT * FROM " + cls.__name__).fetchall()
            return [cls(entry[0], entry[2]) for entry in entries]