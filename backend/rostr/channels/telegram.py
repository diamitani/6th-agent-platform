import os
import httpx
from loguru import logger
from .base import BaseChannel, ChannelMessage, MessageDirection


class TelegramChannel(BaseChannel):
    def __init__(self, config: dict = None):
        super().__init__(
            config
            or {
                "bot_token": os.getenv("TELEGRAM_BOT_TOKEN"),
            }
        )
        self.client = None
        self._offset = 0

    async def connect(self) -> bool:
        if not self.config.get("bot_token"):
            logger.warning("Telegram: missing bot token")
            return False
        self.client = httpx.AsyncClient(
            base_url=f"https://api.telegram.org/bot{self.config['bot_token']}",
            timeout=15.0,
        )
        me = await self.client.get("/getMe")
        if me.status_code != 200:
            logger.error("Telegram: invalid bot token")
            return False
        self.connected = True
        logger.info("Telegram channel connected")
        return True

    async def disconnect(self):
        if self.client:
            await self.client.aclose()
        self.connected = False

    async def send_message(self, message: ChannelMessage) -> bool:
        if not self.connected:
            return False
        try:
            payload = {
                "chat_id": message.recipient,
                "text": message.text,
                "parse_mode": "Markdown",
            }
            response = await self.client.post("/sendMessage", json=payload)
            data = response.json()
            if not data.get("ok"):
                logger.error(f"Telegram send failed: {data.get('description')}")
                return False
            return True
        except Exception as e:
            logger.error(f"Telegram send failed: {e}")
            return False

    async def send_markdown(self, chat_id: str, text: str) -> bool:
        if not self.connected:
            return False
        try:
            payload = {"chat_id": chat_id, "text": text, "parse_mode": "MarkdownV2"}
            response = await self.client.post("/sendMessage", json=payload)
            return response.json().get("ok", False)
        except Exception as e:
            logger.error(f"Telegram markdown send failed: {e}")
            return False

    async def listen(self, handler):
        self.set_message_handler(handler)
        logger.info("Telegram listener registered (long-polling)")

    async def poll_updates(self):
        if not self.connected:
            return
        try:
            response = await self.client.get(
                "/getUpdates",
                params={
                    "offset": self._offset,
                    "timeout": 30,
                },
            )
            data = response.json()
            if not data.get("ok"):
                return

            for update in data.get("result", []):
                self._offset = update["update_id"] + 1
                msg = update.get("message")
                if not msg:
                    continue
                text = msg.get("text", "")
                chat_id = str(msg["chat"]["id"])
                if not text or text.startswith("/"):
                    continue

                channel_msg = ChannelMessage(
                    id=str(update["update_id"]),
                    channel="telegram",
                    direction=MessageDirection.INBOUND,
                    sender=str(msg["from"]["id"]),
                    recipient=chat_id,
                    text=text,
                    metadata={
                        "chat_type": msg["chat"]["type"],
                        "username": msg["from"].get("username"),
                    },
                )
                await self.handle_incoming(channel_msg)

        except Exception as e:
            logger.error(f"Telegram poll error: {e}")
