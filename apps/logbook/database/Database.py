import sqlite3

class Database():
    file: str

    def __enter__(self):
        self.conn = sqlite3.connect(Database.file)
        self.conn.row_factory = sqlite3.Row
        return self.conn.cursor()

    def __exit__(self, type, value, traceback):
        self.conn.commit()
        self.conn.close()

    @classmethod
    def _createTables(cls):
        from apps.logbook.database.Entry import Entry
        for entryType in Entry.__subclasses__():
            entryType.createTable()

    @classmethod
    def use(cls, databaseName: str):
        cls.file = 'resources/' + databaseName + '.db'
        cls._createTables()