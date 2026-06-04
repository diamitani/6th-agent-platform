import os
import httpx
from loguru import logger
from .base import BaseChannel, ChannelMessage, MessageDirection


class SlackChannel(BaseChannel):
    def __init__(self, config: dict = None):
        super().__init__(
            config
            or {
                "bot_token": os.getenv("SLACK_BOT_TOKEN"),
                "signing_secret": os.getenv("SLACK_SIGNING_SECRET"),
                "app_token": os.getenv("SLACK_APP_TOKEN"),
            }
        )
        self.client = None

    async def connect(self) -> bool:
        if not self.config.get("bot_token"):
            logger.warning("Slack: missing bot token")
            return False
        self.client = httpx.AsyncClient(
            base_url="https://slack.com/api",
            headers={"Authorization": f"Bearer {self.config['bot_token']}"},
            timeout=15.0,
        )
        self.connected = True
        logger.info("Slack channel connected")
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
                "channel": message.recipient,
                "text": message.text,
                "mrkdwn": True,
            }
            response = await self.client.post("/chat.postMessage", json=payload)
            data = response.json()
            if not data.get("ok"):
                logger.error(f"Slack send failed: {data.get('error')}")
                return False
            return True
        except Exception as e:
            logger.error(f"Slack send failed: {e}")
            return False

    async def reply_in_thread(self, channel: str, thread_ts: str, text: str) -> bool:
        if not self.connected:
            return False
        try:
            payload = {
                "channel": channel,
                "text": text,
                "thread_ts": thread_ts,
                "mrkdwn": True,
            }
            response = await self.client.post("/chat.postMessage", json=payload)
            return response.json().get("ok", False)
        except Exception as e:
            logger.error(f"Slack reply failed: {e}")
            return False

    async def listen(self, handler):
        self.set_message_handler(handler)
        logger.info("Slack listener registered (Events API)")
        return True

    async def process_event(self, event: dict):
        if event.get("type") == "event_callback":
            inner = event.get("event", {})
            if inner.get("type") == "message" and "bot_id" not in inner:
                msg = ChannelMessage(
                    id=inner.get("ts", ""),
                    channel="slack",
                    direction=MessageDirection.INBOUND,
                    sender=inner.get("user", ""),
                    recipient=inner.get("channel", ""),
                    text=inner.get("text", ""),
                    metadata={
                        "thread_ts": inner.get("thread_ts"),
                        "team": inner.get("team"),
                    },
                )
                await self.handle_incoming(msg)
