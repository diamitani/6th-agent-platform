"""Message Bus - Agent-to-agent communication"""

from typing import Dict, List, Callable, Any
from dataclasses import dataclass
import asyncio


@dataclass
class Message:
    """Message between agents"""
    from_agent: str
    to_agent: str
    topic: str
    payload: Dict[str, Any]
    timestamp: float


class MessageBus:
    """Async message bus for agent communication"""

    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}
        self.messages: List[Message] = []

    async def publish(self, topic: str, payload: Dict[str, Any], from_agent: str = "system"):
        """Publish message to topic"""
        message = Message(
            from_agent=from_agent,
            to_agent="broadcast",
            topic=topic,
            payload=payload,
            timestamp=asyncio.get_event_loop().time()
        )
        self.messages.append(message)

        # Notify subscribers
        if topic in self.subscribers:
            for callback in self.subscribers[topic]:
                await callback(message)

    async def subscribe(self, topic: str, callback: Callable):
        """Subscribe to topic"""
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        self.subscribers[topic].append(callback)

    async def close(self):
        """Cleanup"""
        self.subscribers.clear()
        self.messages.clear()
