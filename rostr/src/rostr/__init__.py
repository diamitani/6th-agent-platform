"""
ROSTR: A Unified Agent Operating System

A modular framework for production-grade multi-agent systems with phase-aware
orchestration and persistent knowledge compounding.
"""

from .pal import PAL
from .ragdal import RAGDAL
from .npao import NPAO
from .hub import Hub, Agent

__version__ = "0.1.0"
__author__ = "Patrick Diamitani"

__all__ = ["PAL", "RAGDAL", "NPAO", "Hub", "Agent"]
