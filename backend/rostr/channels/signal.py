import os
import httpx
from loguru import logger
from .base import BaseChannel, ChannelMessage, MessageDirection


class SignalChannel(BaseChannel):
    def __init__(self, config: dict = None):
        super().__init__(
            config
            or {
                "signal_url": os.getenv("SIGNAL_CLI_URL", "http://localhost:8080"),
                "phone_number": os.getenv("SIGNAL_PHONE_NUMBER"),
            }
        )
        self.client = None

    async def connect(self) -> bool:
        if not self.config.get("signal_url") or not self.config.get("phone_number"):
            logger.warning("Signal: missing config")
            return False
        self.client = httpx.AsyncClient(
            base_url=self.config["signal_url"], timeout=15.0
        )
        self.connected = True
        logger.info("Signal channel connected")
        return True

    async def disconnect(self):
        if self.client:
            await self.client.aclose()
        self.connected = False
        logger.info("Signal channel disconnected")

    async def send_message(self, message: ChannelMessage) -> bool:
        if not self.connected:
            return False
        try:
            payload = {
                "recipient": [message.recipient],
                "message": message.text,
                "number": self.config["phone_number"],
            }
            response = await self.client.post("/v2/send", json=payload)
            response.raise_for_status()
            logger.info(f"Signal message sent to {message.recipient}")
            return True
        except Exception as e:
            logger.error(f"Signal send failed: {e}")
            return False

    async def listen(self, handler):
        self.set_message_handler(handler)
        logger.info("Signal listener registered (signal-cli daemon)")
        return True
