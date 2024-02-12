from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class Entry(ABC):
    timestamp: datetime
    type: int = field(init=False)
    status: str

    @abstractmethod
    def createTable(self) -> None:
        pass

    @abstractmethod
    def save(self) -> None:
        pass

    @classmethod
    def get(cls, since: datetime|None = None, until: datetime = datetime.now()) -> list:
        result = []

        for clazz in cls.__subclasses__():
            result.extend(clazz.get(since, until))
        result.sort(key=lambda x: x.timestamp)

        return result
