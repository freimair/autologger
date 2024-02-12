import sqlite3

class Database():
    """ for using a database in a 'with' block """
    def __init__(self, file='resources/sqlite3.db'):
        self.file=file

    def __enter__(self):
        self.conn = sqlite3.connect(self.file)
        return self.conn.cursor()

    def __exit__(self, type, value, traceback):
        self.conn.commit()
        self.conn.close()