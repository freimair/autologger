from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime

from apps.logbook.database.Database import Database

@dataclass
class Entry(ABC):
    timestamp: datetime

    @classmethod
    def createTable(cls, fields: str = '') -> None:
        with Database() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS """ + cls.__name__ + """ (
                    timestamp INTEGER,
                    """ + fields + """
                )
                """)

    @classmethod
    @abstractmethod
    def fromArray(cls, data: list[Any]) -> "Entry":
        pass

    @abstractmethod
    def save(self) -> None:
        pass

    @classmethod
    def get(cls, limit: int = 50) -> "list[Entry]":
        if cls is Entry:
            result = []

            for clazz in cls.__subclasses__():
                result.extend(clazz.get(limit))
            result.sort(key=lambda x: x.timestamp)

            return result[-limit:]
        else:
            with Database() as cursor:
                entries = cursor.execute("SELECT * FROM " + cls.__name__ + " ORDER BY timestamp DESC LIMIT ?", (limit,)).fetchall()
                entries.sort(key=lambda x: x[0]) # sort for timestamp ASC
                return [cls.fromArray(entry) for entry in entries]
