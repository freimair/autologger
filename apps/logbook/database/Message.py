from dataclasses import dataclass
from datetime import datetime
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry

@dataclass
class Message(Entry):
    message: str

    @classmethod
    def fromArray(cls, data):
        instance = cls(data[1])
        instance.timestamp = datetime.fromtimestamp(data[0] / 1000)
        return instance


    @classmethod
    def createTable(cls):
        super(Message, cls).createTable("""
                    message TEXT
            """)

    def save(self):
        with Database() as cursor:
            cursor.execute("INSERT INTO " + self.__class__.__name__ + " (timestamp, message) VALUES (:timestamp, :message)", {
                'timestamp': int(self.timestamp.timestamp() * 1000),
                'message': self.message
                })