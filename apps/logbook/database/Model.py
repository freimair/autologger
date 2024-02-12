from datetime import datetime
from typing import List, Optional
import sqlite3
from contextlib import closing

class Model:
    def createTable(self):
        with closing(sqlite3.connect('resources/sqlite3.db')) as connection:
            with closing(connection.cursor()) as cursor:
                cursor.execute("""
                    CREATE TABLE model (
                        date INTEGER,
                        type INTEGER,
                        status TEXT
                    )
                    """)

    def __init__(self):
        self.con = sqlite3.connect('resources/sqlite3.db')
        pass