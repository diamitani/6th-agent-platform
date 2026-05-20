"""State Manager - Session and project state persistence"""

from typing import Dict, Any, Optional
from datetime import datetime
import json


class StateManager:
    """Manages session and project state"""

    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.projects: Dict[str, Dict[str, Any]] = {}

    async def create_session(self, session_id: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create new session"""
        session = {
            "session_id": session_id,
            "created_at": datetime.utcnow().isoformat(),
            "state": {},
            "context": {},
            "metadata": metadata or {}
        }
        self.sessions[session_id] = session
        return session

    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session state"""
        return self.sessions.get(session_id)

    async def update_session(self, session_id: str, updates: Dict[str, Any]):
        """Update session state"""
        if session_id in self.sessions:
            self.sessions[session_id]["state"].update(updates)

    async def save_to_project(self, project_id: str, key: str, value: Any):
        """Save data to project state"""
        if project_id not in self.projects:
            self.projects[project_id] = {}
        self.projects[project_id][key] = value
