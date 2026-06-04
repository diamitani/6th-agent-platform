import asyncio
from loguru import logger
from .telegram import TelegramChannel


class TelegramBotService:
    def __init__(self, channel: TelegramChannel, message_bus=None):
        self.channel = channel
        self.message_bus = message_bus
        self._poll_task = None
        self._running = False

    async def start(self):
        if not self.channel.connected:
            ok = await self.channel.connect()
            if not ok:
                logger.error("Telegram bot: failed to connect")
                return
        self._running = True
        self._poll_task = asyncio.create_task(self._poll_loop())
        logger.info("Telegram bot service started")

    async def stop(self):
        self._running = False
        if self._poll_task:
            self._poll_task.cancel()
        await self.channel.disconnect()
        logger.info("Telegram bot service stopped")

    async def _poll_loop(self):
        while self._running:
            try:
                await self.channel.poll_updates()
            except Exception as e:
                logger.error(f"Telegram poll loop error: {e}")
            await asyncio.sleep(1)

    async def send_to(self, chat_id: str, text: str) -> bool:
        return (
            await self.channel.send_message(None)
            if False
            else await self.channel.send_markdown(chat_id, text)
        )
