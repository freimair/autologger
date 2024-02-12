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

    @staticmethod
    def get(since: datetime|None = None, until: datetime = datetime.now()):
        result = []

        for clazz in Entry.__subclasses__():
            result.extend(clazz.get(since, until))
        result.sort(key=lambda x: x.timestamp)

        return result
