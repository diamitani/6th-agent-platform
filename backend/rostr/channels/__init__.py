from .base import BaseChannel, ChannelMessage, MessageDirection
from .whatsapp import WhatsAppChannel
from .signal import SignalChannel
from .slack_channel import SlackChannel
from .teams import TeamsChannel
from .telegram import TelegramChannel

CHANNELS = {
    "whatsapp": WhatsAppChannel,
    "signal": SignalChannel,
    "slack": SlackChannel,
    "teams": TeamsChannel,
    "telegram": TelegramChannel,
}

__all__ = [
    "BaseChannel",
    "ChannelMessage",
    "MessageDirection",
    "WhatsAppChannel",
    "SignalChannel",
    "SlackChannel",
    "TeamsChannel",
    "TelegramChannel",
    "CHANNELS",
]
