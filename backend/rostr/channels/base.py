from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
from typing import Optional


class MessageDirection(Enum):
    INBOUND = "inbound"
    OUTBOUND = "outbound"


@dataclass
class ChannelMessage:
    id: str
    channel: str
    direction: MessageDirection
    sender: str
    recipient: str
    text: str
    timestamp: datetime = field(default_factory=datetime.utcnow)
    metadata: dict = field(default_factory=dict)


class BaseChannel(ABC):
    def __init__(self, config: dict = None):
        self.config = config or {}
        self.connected = False
        self.message_handler = None

    @abstractmethod
    async def connect(self) -> bool: ...

    @abstractmethod
    async def disconnect(self): ...

    @abstractmethod
    async def send_message(self, message: ChannelMessage) -> bool: ...

    @abstractmethod
    async def listen(self, handler): ...

    async def health_check(self) -> dict:
        return {
            "channel": self.__class__.__name__,
            "connected": self.connected,
            "config_set": bool(self.config),
        }

    def set_message_handler(self, handler):
        self.message_handler = handler

    async def handle_incoming(self, message: ChannelMessage):
        if self.message_handler:
            await self.message_handler(message)
