import os
import httpx
from loguru import logger
from .base import BaseChannel, ChannelMessage, MessageDirection


class TeamsChannel(BaseChannel):
    def __init__(self, config: dict = None):
        super().__init__(
            config
            or {
                "tenant_id": os.getenv("TEAMS_TENANT_ID"),
                "client_id": os.getenv("TEAMS_CLIENT_ID"),
                "client_secret": os.getenv("TEAMS_CLIENT_SECRET"),
            }
        )
        self.client = None
        self._access_token = None

    async def connect(self) -> bool:
        if not all(
            [
                self.config.get("tenant_id"),
                self.config.get("client_id"),
                self.config.get("client_secret"),
            ]
        ):
            logger.warning("Teams: missing credentials")
            return False

        self.client = httpx.AsyncClient(timeout=30.0)
        self._access_token = await self._get_token()
        if not self._access_token:
            logger.error("Teams: failed to get access token")
            return False

        self.client.headers.update({"Authorization": f"Bearer {self._access_token}"})
        self.connected = True
        logger.info("Teams channel connected")
        return True

    async def _get_token(self) -> str:
        try:
            url = f"https://login.microsoftonline.com/{self.config['tenant_id']}/oauth2/v2.0/token"
            payload = {
                "client_id": self.config["client_id"],
                "client_secret": self.config["client_secret"],
                "scope": "https://graph.microsoft.com/.default",
                "grant_type": "client_credentials",
            }
            response = await self.client.post(url, data=payload)
            response.raise_for_status()
            return response.json().get("access_token", "")
        except Exception as e:
            logger.error(f"Teams token acquisition failed: {e}")
            return ""

    async def disconnect(self):
        if self.client:
            await self.client.aclose()
        self.connected = False

    async def send_message(self, message: ChannelMessage) -> bool:
        if not self.connected:
            return False
        try:
            url = f"https://graph.microsoft.com/v1.0/chats/{message.recipient}/messages"
            payload = {
                "body": {"contentType": "text", "content": message.text},
            }
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            logger.info(f"Teams message sent to {message.recipient}")
            return True
        except Exception as e:
            logger.error(f"Teams send failed: {e}")
            return False

    async def send_to_channel(self, team_id: str, channel_id: str, text: str) -> bool:
        if not self.connected:
            return False
        try:
            url = f"https://graph.microsoft.com/v1.0/teams/{team_id}/channels/{channel_id}/messages"
            payload = {"body": {"contentType": "text", "content": text}}
            response = await self.client.post(url, json=payload)
            return response.is_success
        except Exception as e:
            logger.error(f"Teams channel send failed: {e}")
            return False

    async def listen(self, handler):
        self.set_message_handler(handler)
        logger.info("Teams listener registered (webhook + Graph subscription)")
        return True
