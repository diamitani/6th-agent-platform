"""Context injection for agent instructions"""

from typing import Dict, Any, Optional
from dataclasses import dataclass
from pathlib import Path
import os


@dataclass
class AgentContext:
    """Context container for agent execution"""
    project_context: Dict[str, Any]
    user_context: Dict[str, Any]
    org_context: Dict[str, Any]
    session_context: Dict[str, Any]

    def to_prompt(self) -> str:
        """Convert context to a prompt-ready string"""
        parts = []

        if self.project_context:
            parts.append("## Project Context")
            if "name" in self.project_context:
                parts.append(f"Project: {self.project_context['name']}")
            if "goals" in self.project_context:
                parts.append(f"Goals: {self.project_context['goals']}")
            if "decisions" in self.project_context:
                parts.append(f"Recent Decisions:\n{self.project_context['decisions']}")

        if self.user_context:
            parts.append("\n## User Context")
            if "role" in self.user_context:
                parts.append(f"User Role: {self.user_context['role']}")
            if "expertise" in self.user_context:
                parts.append(f"Expertise: {', '.join(self.user_context['expertise'])}")

        if self.org_context:
            parts.append("\n## Organization Context")
            if "name" in self.org_context:
                parts.append(f"Organization: {self.org_context['name']}")
            if "conventions" in self.org_context:
                parts.append(f"Conventions:\n{self.org_context['conventions']}")

        if self.session_context:
            parts.append("\n## Session Context")
            if "previous_tasks" in self.session_context:
                parts.append(f"Previous Tasks: {len(self.session_context['previous_tasks'])} completed")

        return "\n".join(parts)


class ContextInjector:
    """Injects relevant context into agent instructions"""

    def __init__(self, workspace_path: Optional[Path] = None):
        self.workspace_path = workspace_path or Path.cwd() / "rostr-data"

    def load_project_context(self, project_id: str) -> Dict[str, Any]:
        """Load project-specific context"""
        project_path = self.workspace_path / "projects" / project_id

        context = {}

        # Load README
        readme_path = project_path / "README.md"
        if readme_path.exists():
            context["name"] = project_id
            context["readme"] = readme_path.read_text()

        # Load goals
        goals_path = project_path / "goals.md"
        if goals_path.exists():
            context["goals"] = goals_path.read_text()

        # Load recent decisions
        decisions_path = project_path / "decisions.md"
        if decisions_path.exists():
            with open(decisions_path) as f:
                # Get last 5 decisions
                lines = f.readlines()
                context["decisions"] = "".join(lines[-20:])

        return context

    def load_user_context(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Load user-specific context"""
        # Default user context
        return {
            "role": "developer",
            "expertise": ["python", "ai", "automation"],
            "preferences": {
                "detail_level": "moderate",
                "code_style": "pythonic"
            }
        }

    def load_org_context(self, org_id: Optional[str] = None) -> Dict[str, Any]:
        """Load organization-specific context"""
        if not org_id:
            return {}

        org_path = self.workspace_path / "orgs" / org_id

        context = {}

        # Load identity
        identity_path = org_path / "identity.md"
        if identity_path.exists():
            context["name"] = org_id
            context["identity"] = identity_path.read_text()

        # Load conventions
        conventions_path = org_path / "conventions.md"
        if conventions_path.exists():
            context["conventions"] = conventions_path.read_text()

        return context

    def load_session_context(self, session_id: str) -> Dict[str, Any]:
        """Load session-specific context"""
        # In a real implementation, this would load from a session store
        return {
            "session_id": session_id,
            "previous_tasks": [],
            "active_agents": []
        }

    def inject(
        self,
        project_id: Optional[str] = None,
        user_id: Optional[str] = None,
        org_id: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> AgentContext:
        """Inject all relevant context"""
        return AgentContext(
            project_context=self.load_project_context(project_id) if project_id else {},
            user_context=self.load_user_context(user_id),
            org_context=self.load_org_context(org_id),
            session_context=self.load_session_context(session_id) if session_id else {}
        )
