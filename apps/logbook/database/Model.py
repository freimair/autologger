
from apps.logbook.database.Database import Database

class Model:
    def createTable(self) -> None:
        with Database() as cursor:
            cursor.execute("""
                CREATE TABLE model (
                    date INTEGER,
                    type INTEGER,
                    status TEXT
                )
                """)

