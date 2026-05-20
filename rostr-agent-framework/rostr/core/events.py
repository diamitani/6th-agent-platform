"""Event bus for async agent communication"""

from typing import Dict, List, Callable, Any
from dataclasses import dataclass
from datetime import datetime
import asyncio


@dataclass
class Event:
    """An event in the system"""
    topic: str
    event_type: str
    payload: Dict[str, Any]
    timestamp: datetime
    source: str


class EventBus:
    """Publish/subscribe event bus for agent communication"""

    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}
        self.event_history: List[Event] = []

    def subscribe(self, topic: str, handler: Callable):
        """Subscribe to a topic"""
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        self.subscribers[topic].append(handler)

    def unsubscribe(self, topic: str, handler: Callable):
        """Unsubscribe from a topic"""
        if topic in self.subscribers:
            self.subscribers[topic].remove(handler)

    async def publish(
        self,
        topic: str,
        event_type: str,
        payload: Dict[str, Any],
        source: str
    ):
        """Publish an event to all subscribers"""

        event = Event(
            topic=topic,
            event_type=event_type,
            payload=payload,
            timestamp=datetime.now(),
            source=source
        )

        # Store in history
        self.event_history.append(event)

        # Notify subscribers
        if topic in self.subscribers:
            tasks = [
                handler(event)
                for handler in self.subscribers[topic]
            ]
            await asyncio.gather(*tasks, return_exceptions=True)

    def get_history(
        self,
        topic: Optional[str] = None,
        limit: int = 100
    ) -> List[Event]:
        """Get event history"""

        if topic:
            events = [e for e in self.event_history if e.topic == topic]
        else:
            events = self.event_history

        return events[-limit:]
