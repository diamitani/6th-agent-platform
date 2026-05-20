"""Researcher agent - knowledge retrieval and analysis"""

import uuid
from rostr.agents.base import BaseAgent
from rostr.npao.phases import Phase


class ResearcherAgent(BaseAgent):
    """Agent specialized in research, investigation, and knowledge synthesis"""

    def __init__(
        self,
        name: str = "researcher",
        model: str = "claude-sonnet-4-6"
    ):
        super().__init__(
            agent_id=str(uuid.uuid4()),
            name=name,
            agent_type="researcher",
            capabilities=[
                "web_research",
                "knowledge_synthesis",
                "competitive_analysis",
                "fact_checking",
                "report_writing"
            ],
            tools=[
                "web_search",
                "browser",
                "ragdal"
            ],
            phases=[
                Phase.PRED,
                Phase.DESIGN
            ],
            model=model
        )

    def _get_output_formats(self):
        return ["markdown", "report"]
