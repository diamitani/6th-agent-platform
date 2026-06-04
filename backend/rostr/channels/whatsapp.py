import os
import httpx
from loguru import logger
from .base import BaseChannel, ChannelMessage, MessageDirection


class WhatsAppChannel(BaseChannel):
    def __init__(self, config: dict = None):
        super().__init__(
            config
            or {
                "api_token": os.getenv("WHATSAPP_API_TOKEN"),
                "phone_number_id": os.getenv("WHATSAPP_PHONE_NUMBER_ID"),
                "api_version": "v21.0",
            }
        )
        self.base_url = (
            f"https://graph.facebook.com/{self.config.get('api_version', 'v21.0')}"
        )
        self.client = None

    async def connect(self) -> bool:
        if not self.config.get("api_token") or not self.config.get("phone_number_id"):
            logger.warning("WhatsApp: missing credentials")
            return False
        self.client = httpx.AsyncClient(
            headers={"Authorization": f"Bearer {self.config['api_token']}"},
            timeout=30.0,
        )
        self.connected = True
        logger.info("WhatsApp channel connected")
        return True

    async def disconnect(self):
        if self.client:
            await self.client.aclose()
        self.connected = False
        logger.info("WhatsApp channel disconnected")

    async def send_message(self, message: ChannelMessage) -> bool:
        if not self.connected:
            logger.error("WhatsApp: not connected")
            return False

        try:
            url = f"{self.base_url}/{self.config['phone_number_id']}/messages"
            payload = {
                "messaging_product": "whatsapp",
                "to": message.recipient,
                "type": "text",
                "text": {"body": message.text},
            }
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            logger.info(f"WhatsApp message sent to {message.recipient}")
            return True
        except Exception as e:
            logger.error(f"WhatsApp send failed: {e}")
            return False

    async def listen(self, handler):
        self.set_message_handler(handler)
        logger.info("WhatsApp listener registered (webhook-based)")
        return True


class WhatsAppWebhookHandler:
    def __init__(self, channel: WhatsAppChannel):
        self.channel = channel

    async def verify(self, mode: str, token: str, challenge: str) -> str:
        verify_token = self.channel.config.get(
            "verify_token", os.getenv("WHATSAPP_VERIFY_TOKEN")
        )
        if mode == "subscribe" and token == verify_token:
            return challenge
        return "verification_failed"

    async def process_webhook(self, body: dict):
        for entry in body.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                for msg in value.get("messages", []):
                    channel_msg = ChannelMessage(
                        id=msg.get("id", ""),
                        channel="whatsapp",
                        direction=MessageDirection.INBOUND,
                        sender=msg.get("from", ""),
                        recipient=value.get("metadata", {}).get("phone_number_id", ""),
                        text=msg.get("text", {}).get("body", ""),
                        metadata={"message_type": msg.get("type", "")},
                    )
                    await self.channel.handle_incoming(channel_msg)
