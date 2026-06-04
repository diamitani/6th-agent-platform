import os
from loguru import logger
from . import CHANNELS, BaseChannel, ChannelMessage


class ChannelManager:
    def __init__(self, message_bus=None):
        self.channels: dict[str, BaseChannel] = {}
        self.message_bus = message_bus
        self.connection_status: dict[str, bool] = {}
        logger.info("ChannelManager initialized")

    async def connect_all(self, enabled: list[str] = None) -> dict[str, bool]:
        enabled = enabled or list(CHANNELS.keys())
        results = {}

        for name in enabled:
            cls = CHANNELS.get(name)
            if not cls:
                logger.warning(f"Unknown channel: {name}")
                results[name] = False
                continue

            channel = cls()
            self.channels[name] = channel
            channel.set_message_handler(self._on_message)
            ok = await channel.connect()
            self.connection_status[name] = ok
            results[name] = ok

            if ok:
                await channel.listen(self._on_message)

        logger.info(f"Channel connections: {results}")
        return results

    async def disconnect_all(self):
        for name, channel in self.channels.items():
            await channel.disconnect()
            self.connection_status[name] = False
        self.channels.clear()
        logger.info("All channels disconnected")

    async def broadcast(self, text: str, channels: list[str] = None) -> dict[str, bool]:
        targets = channels or list(self.channels.keys())
        results = {}
        for name in targets:
            channel = self.channels.get(name)
            if not channel:
                results[name] = False
                continue
            msg = ChannelMessage(
                id=f"broadcast-{name}",
                channel=name,
                direction=None,
                sender="system",
                recipient="*",
                text=text,
            )
            results[name] = await channel.send_message(msg)
        return results

    async def send_to(self, channel_name: str, recipient: str, text: str) -> bool:
        channel = self.channels.get(channel_name)
        if not channel:
            logger.error(f"Channel {channel_name} not connected")
            return False
        msg = ChannelMessage(
            id=f"out-{channel_name}",
            channel=channel_name,
            direction=None,
            sender="6th-agent",
            recipient=recipient,
            text=text,
        )
        return await channel.send_message(msg)

    async def _on_message(self, message: ChannelMessage):
        logger.info(
            f"Message received via {message.channel} from {message.sender}: {message.text[:100]}"
        )
        if self.message_bus:
            await self.message_bus.publish(
                f"channel.{message.channel}.incoming",
                {
                    "sender": message.sender,
                    "text": message.text,
                    "channel": message.channel,
                    "message_id": message.id,
                    "recipient": message.recipient,
                },
            )

    def get_status(self) -> dict[str, bool]:
        return dict(self.connection_status)

    def get_connected_count(self) -> int:
        return sum(1 for v in self.connection_status.values() if v)

    async def health_all(self) -> list[dict]:
        results = []
        for name, channel in self.channels.items():
            status = await channel.health_check()
            results.append(status)
        return results
