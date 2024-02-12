from dataclasses import dataclass
from datetime import datetime
from apps.logbook.database.Database import Database

@dataclass
class Model:
    timestamp: datetime
    type: int
    status: str

    def createTable(self) -> None:
        with Database() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS model (
                    timestamp INTEGER,
                    type INTEGER,
                    status TEXT
                )
                """)

    def save(self):
        with Database() as cursor:
            cursor.execute("INSERT INTO model (timestamp, type, status) VALUES (:timestamp, :type, :status)", {
                'timestamp': int(self.timestamp.timestamp() * 1000 + self.timestamp.microsecond),
                'type': self.type,
                'status': self.status
                })

    @staticmethod
    def get(since: datetime|None = None, until: datetime = datetime.now()):
        with Database() as cursor:
            entries = cursor.execute("SELECT * FROM model").fetchall()
            return [Model(entry[0], entry[1], entry[2]) for entry in entries]