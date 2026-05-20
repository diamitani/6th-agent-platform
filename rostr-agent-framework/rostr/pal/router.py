"""Route compiled instructions to appropriate agents or tools"""

from typing import Dict, Any, Optional
from dataclasses import dataclass
from rostr.pal.intent import Intent, Domain


@dataclass
class RouteTarget:
    """Target for routing instructions"""
    agent_type: str
    tools_enabled: Dict[str, bool]
    memory_mode: str
    output_format: str
    verification_required: bool


class Router:
    """Routes instructions to appropriate execution targets"""

    DOMAIN_ROUTING = {
        Domain.CODE: "builder",
        Domain.DESIGN: "designer",
        Domain.RESEARCH: "researcher",
        Domain.OPS: "ops",
        Domain.SALES: "sales",
        Domain.CONTENT: "content",
        Domain.DEPLOY: "deployer",
        Domain.DEBUG: "debugger",
    }

    def route(self, intent: Intent) -> RouteTarget:
        """Determine routing target based on intent"""

        agent_type = self.DOMAIN_ROUTING.get(intent.domain, "general")

        # Determine tools based on domain
        tools = self._determine_tools(intent.domain)

        # Determine memory mode
        memory_mode = "session" if intent.urgency == "immediate" else "project"

        # Determine output format
        output_format = self._determine_output_format(intent.domain)

        # Determine if verification is needed
        verification_required = (
            intent.domain in [Domain.DEPLOY, Domain.OPS] or
            intent.ambiguity_score > 0.7
        )

        return RouteTarget(
            agent_type=agent_type,
            tools_enabled=tools,
            memory_mode=memory_mode,
            output_format=output_format,
            verification_required=verification_required
        )

    def _determine_tools(self, domain: Domain) -> Dict[str, bool]:
        """Determine which tools should be enabled"""
        tool_matrix = {
            Domain.CODE: {
                "file_system": True,
                "code_execution": True,
                "web_search": False,
                "browser": False,
            },
            Domain.RESEARCH: {
                "file_system": False,
                "code_execution": False,
                "web_search": True,
                "browser": True,
            },
            Domain.DESIGN: {
                "file_system": True,
                "code_execution": False,
                "web_search": True,
                "browser": True,
            },
            Domain.DEPLOY: {
                "file_system": True,
                "code_execution": True,
                "web_search": False,
                "browser": False,
            },
            Domain.DEBUG: {
                "file_system": True,
                "code_execution": True,
                "web_search": True,
                "browser": False,
            },
        }

        return tool_matrix.get(domain, {
            "file_system": True,
            "code_execution": False,
            "web_search": True,
            "browser": False,
        })

    def _determine_output_format(self, domain: Domain) -> str:
        """Determine expected output format"""
        format_map = {
            Domain.CODE: "code",
            Domain.DESIGN: "file",
            Domain.RESEARCH: "markdown",
            Domain.OPS: "action",
            Domain.SALES: "markdown",
            Domain.CONTENT: "markdown",
            Domain.DEPLOY: "action",
            Domain.DEBUG: "markdown",
        }
        return format_map.get(domain, "markdown")
