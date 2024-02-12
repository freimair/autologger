from datetime import datetime
from apps.logbook.database.Database import Database

class Model:
    def createTable(self) -> None:
        with Database() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS model (
                    date INTEGER,
                    type INTEGER,
                    status TEXT
                )
                """)

    def save(self):
        with Database() as cursor:
            cursor.execute("INSERT INTO model (date, type, status) VALUES (12345,3,'landed')")

    @staticmethod
    def get(since: datetime|None = None, until: datetime = datetime.now()):
        with Database() as cursor:
            entries = cursor.execute("SELECT * FROM model").fetchall()
            return [entry[2] for entry in entries]