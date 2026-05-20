"""Builder agent - code generation and editing"""

import uuid
from rostr.agents.base import BaseAgent
from rostr.npao.phases import Phase


class BuilderAgent(BaseAgent):
    """Agent specialized in code generation, file editing, and implementation"""

    def __init__(
        self,
        name: str = "builder",
        model: str = "claude-sonnet-4-6"
    ):
        super().__init__(
            agent_id=str(uuid.uuid4()),
            name=name,
            agent_type="builder",
            capabilities=[
                "code_generation",
                "file_editing",
                "api_integration",
                "test_writing",
                "refactoring"
            ],
            tools=[
                "file_system",
                "code_execution",
                "bash"
            ],
            phases=[
                Phase.DEVELOPMENT,
                Phase.DEBUGGING
            ],
            model=model
        )

    def _get_output_formats(self):
        return ["code", "diff", "file"]
