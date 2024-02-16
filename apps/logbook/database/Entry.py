from abc import ABC
from dataclasses import dataclass
from datetime import datetime
import copy
from typing import Self

from apps.logbook.database.Database import Database

@dataclass(init=False)
class Entry(ABC):
    timestamp: datetime

    @classmethod
    def getAttributes(cls):
        return [name for name in cls.__dataclass_fields__]

    @classmethod
    def createTable(cls) -> None:
        fields: list[str] = []
        for name, details in cls.__dataclass_fields__.items():
            if str == details.type:
                fieldtype = 'TEXT'
            elif int == details.type or datetime == details.type:
                fieldtype = 'INTEGER'
            elif float == details.type:
                fieldtype = 'REAL'
            fields.append(name + ' ' + fieldtype)

        with Database() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS """ + cls.__name__ + """ (
                    """ + ','.join(fields) + """
                )
                """)

    @classmethod
    def getAvailableTypes(cls) -> list[type]:
        from apps.logbook.database.Status import Status
        from apps.logbook.database.Message import Message
        from apps.logbook.database.Telemetry import Telemetry
        from apps.logbook.database.Weather import Weather
        return [Status, Message, Telemetry, Weather]

    @classmethod
    def getType(cls, name: str) -> type:
        for clazz in cls.getAvailableTypes():
            if name.casefold() == clazz.__name__.casefold():
                return clazz
        raise Exception("Entry Type not found")

    @classmethod
    def fromDictionary(cls, data: dict[str, str|int|float]) -> Self:
        instance = cls()
        instance.timestamp = datetime.now() # is overwritten if data contains timestamp
        for attribute in cls.getAttributes():
            if(attribute in data or attribute in data.keys()):
                if("timestamp" == attribute and isinstance(data[attribute], int)):
                    instance._setTimestamp(int(data[attribute]))
                else:
                    setattr(instance, attribute, data[attribute])
        return instance

    def _setTimestamp(self, unixTimeStamp: int) -> None:
        self.timestamp = datetime.fromtimestamp(unixTimeStamp / 1000)

    def _getUnixTimestamp(self) -> int:
        return int(self.timestamp.timestamp() * 1000)

    def save(self) -> None:
        fieldData = copy.deepcopy(vars(self))
        fieldData['timestamp'] = self._getUnixTimestamp()

        with Database() as cursor:
            cursor.execute("INSERT INTO " + self.__class__.__name__ + " ("
                + ','.join(fieldData.keys()) + ") VALUES ("
                + ','.join([':' + key for key in fieldData.keys()])
                + ")", fieldData)

    @classmethod
    def get(cls, limit: int = 50) -> "list[Entry]":
        if cls is Entry:
            result = []

            for clazz in cls.getAvailableTypes():
                result.extend(clazz.get(limit))
            result.sort(key=lambda x: x.timestamp)

            return result[-limit:]
        else:
            with Database() as cursor:
                entries = cursor.execute("SELECT * FROM " + cls.__name__ + " ORDER BY timestamp DESC LIMIT ?", (limit,)).fetchall()
                entries.sort(key=lambda x: x[0]) # sort for timestamp ASC
                return [cls.fromDictionary(entry) for entry in entries]
