from loguru import logger
from .coordinator import SwarmTask, TaskPhase, TaskPriority


class TaskRouter:
    def __init__(self, agent_registry=None):
        self.agent_registry = agent_registry
        self.phase_agents = {
            TaskPhase.PRE_D: ["product", "engineering"],
            TaskPhase.DESIGN: ["design", "frontend", "product"],
            TaskPhase.DEVELOPMENT: [
                "development",
                "backend",
                "frontend",
                "ai",
                "security",
            ],
            TaskPhase.DEPLOYMENT: ["devops", "backend", "qa"],
            TaskPhase.DEBUGGING: ["qa", "engineering", "security"],
        }
        self.template_tasks = {
            "build_saas_dashboard": self._template_build_saas_dashboard,
            "deploy_cloud_instance": self._template_deploy_cloud_instance,
            "add_channel_integration": self._template_add_channel_integration,
            "create_new_agent": self._template_create_new_agent,
            "run_security_audit": self._template_run_security_audit,
        }
        logger.info("TaskRouter initialized")

    async def route(self, task: SwarmTask) -> list[SwarmTask]:
        subtasks = []

        if task.title in self.template_tasks:
            subtasks = await self.template_tasks[task.title](task)
        else:
            subtasks = await self._generic_route(task)

        logger.info(f"Routed task '{task.title}' into {len(subtasks)} subtasks")
        return subtasks

    def suggest_agents(self, phase: TaskPhase) -> list[str]:
        return self.phase_agents.get(phase, ["engineering"])

    def suggest_phase(self, description: str) -> TaskPhase:
        keywords = {
            "research": TaskPhase.PRE_D,
            "investigate": TaskPhase.PRE_D,
            "explore": TaskPhase.PRE_D,
            "design": TaskPhase.DESIGN,
            "ui": TaskPhase.DESIGN,
            "ux": TaskPhase.DESIGN,
            "prototype": TaskPhase.DESIGN,
            "build": TaskPhase.DEVELOPMENT,
            "implement": TaskPhase.DEVELOPMENT,
            "code": TaskPhase.DEVELOPMENT,
            "develop": TaskPhase.DEVELOPMENT,
            "deploy": TaskPhase.DEPLOYMENT,
            "release": TaskPhase.DEPLOYMENT,
            "ship": TaskPhase.DEPLOYMENT,
            "fix": TaskPhase.DEBUGGING,
            "bug": TaskPhase.DEBUGGING,
            "issue": TaskPhase.DEBUGGING,
            "error": TaskPhase.DEBUGGING,
        }
        desc_lower = description.lower()
        for keyword, phase in keywords.items():
            if keyword in desc_lower:
                return phase
        return TaskPhase.DEVELOPMENT

    async def _generic_route(self, task: SwarmTask) -> list[SwarmTask]:
        return [task]

    async def _template_build_saas_dashboard(self, task: SwarmTask) -> list[SwarmTask]:
        return [
            SwarmTask(
                id=f"{task.id}/1",
                title="Design dashboard UI mockups",
                description="Create wireframes and design specs for the SaaS cloud dashboard",
                phase=TaskPhase.DESIGN,
                priority=task.priority,
                depends_on=[task.id],
            ),
            SwarmTask(
                id=f"{task.id}/2",
                title="Build cloud provider API layer",
                description="Implement Azure/Oracle/AWS API connectors for instance management",
                phase=TaskPhase.DEVELOPMENT,
                priority=task.priority,
                depends_on=[f"{task.id}/1"],
            ),
            SwarmTask(
                id=f"{task.id}/3",
                title="Build dashboard frontend",
                description="Implement the SaaS dashboard UI with instance management, billing, and status",
                phase=TaskPhase.DEVELOPMENT,
                priority=task.priority,
                depends_on=[f"{task.id}/1"],
            ),
            SwarmTask(
                id=f"{task.id}/4",
                title="Implement affiliate signup flow",
                description="Build guided walkthrough for cloud provider signup with affiliate links",
                phase=TaskPhase.DEVELOPMENT,
                priority=task.priority,
                depends_on=[f"{task.id}/2"],
            ),
            SwarmTask(
                id=f"{task.id}/5",
                title="Security review of cloud connectors",
                description="Audit API key handling, network configs, and IAM permissions",
                phase=TaskPhase.DESIGN,
                priority=TaskPriority.HIGH,
                depends_on=[f"{task.id}/2"],
            ),
            SwarmTask(
                id=f"{task.id}/6",
                title="Deploy dashboard to staging",
                description="Containerize and deploy the SaaS dashboard for testing",
                phase=TaskPhase.DEPLOYMENT,
                priority=task.priority,
                depends_on=[f"{task.id}/3", f"{task.id}/4", f"{task.id}/5"],
            ),
        ]

    async def _template_deploy_cloud_instance(self, task: SwarmTask) -> list[SwarmTask]:
        return [
            SwarmTask(
                id=f"{task.id}/1",
                title="Provision cloud infrastructure",
                description="Spin up compute, storage, and networking on the target cloud",
                phase=TaskPhase.DEVELOPMENT,
                priority=task.priority,
                depends_on=[task.id],
            ),
            SwarmTask(
                id=f"{task.id}/2",
                title="Deploy 6th Agent stack",
                description="Docker Compose pull, config injection, health check",
                phase=TaskPhase.DEPLOYMENT,
                priority=task.priority,
                depends_on=[f"{task.id}/1"],
            ),
            SwarmTask(
                id=f"{task.id}/3",
                title="Verify deployment and monitoring",
                description="Run smoke tests, configure logging, set up alerts",
                phase=TaskPhase.DEPLOYMENT,
                priority=task.priority,
                depends_on=[f"{task.id}/2"],
            ),
        ]

    async def _template_add_channel_integration(
        self, task: SwarmTask
    ) -> list[SwarmTask]:
        return [
            SwarmTask(
                id=f"{task.id}/1",
                title="Design channel connector API",
                description="Define the abstract connector interface and message protocol",
                phase=TaskPhase.DESIGN,
                priority=task.priority,
                depends_on=[task.id],
            ),
            SwarmTask(
                id=f"{task.id}/2",
                title="Implement channel adapter",
                description="Build the specific channel integration (WhatsApp/Signal/Teams/Slack)",
                phase=TaskPhase.DEVELOPMENT,
                priority=task.priority,
                depends_on=[f"{task.id}/1"],
            ),
            SwarmTask(
                id=f"{task.id}/3",
                title="Test channel integration",
                description="End-to-end test: send message -> agent processes -> reply on channel",
                phase=TaskPhase.DEVELOPMENT,
                priority=task.priority,
                depends_on=[f"{task.id}/2"],
            ),
            SwarmTask(
                id=f"{task.id}/4",
                title="Document channel setup",
                description="Write deployment guide for the channel connector",
                phase=TaskPhase.DEPLOYMENT,
                priority=task.priority,
                depends_on=[f"{task.id}/3"],
            ),
        ]

    async def _template_create_new_agent(self, task: SwarmTask) -> list[SwarmTask]:
        return [
            SwarmTask(
                id=f"{task.id}/1",
                title="Define agent PAL intent spec",
                description="Extract domain, tools, autonomy level, and state requirements",
                phase=TaskPhase.PRE_D,
                priority=task.priority,
                depends_on=[task.id],
            ),
            SwarmTask(
                id=f"{task.id}/2",
                title="Generate system instructions",
                description="8-part system instructions: role, responsibilities, rules, reasoning, output format",
                phase=TaskPhase.DESIGN,
                priority=task.priority,
                depends_on=[f"{task.id}/1"],
            ),
            SwarmTask(
                id=f"{task.id}/3",
                title="Register agent in hub",
                description="Add agent to registry, configure capabilities and phase mapping",
                phase=TaskPhase.DEVELOPMENT,
                priority=task.priority,
                depends_on=[f"{task.id}/2"],
            ),
            SwarmTask(
                id=f"{task.id}/4",
                title="Create agent UI components",
                description="Build chat interface, status cards, and configuration panel",
                phase=TaskPhase.DEVELOPMENT,
                priority=task.priority,
                depends_on=[f"{task.id}/2"],
            ),
        ]

    async def _template_run_security_audit(self, task: SwarmTask) -> list[SwarmTask]:
        return [
            SwarmTask(
                id=f"{task.id}/1",
                title="Dependency vulnerability scan",
                description="Run npm audit, pip audit, and dependency-check",
                phase=TaskPhase.DEVELOPMENT,
                priority=TaskPriority.HIGH,
                depends_on=[task.id],
            ),
            SwarmTask(
                id=f"{task.id}/2",
                title="Code security review",
                description="Static analysis, secrets detection, OWASP Top 10 check",
                phase=TaskPhase.DESIGN,
                priority=TaskPriority.HIGH,
                depends_on=[task.id],
            ),
            SwarmTask(
                id=f"{task.id}/3",
                title="Infrastructure security review",
                description="Check IAM policies, network rules, encryption configs",
                phase=TaskPhase.DESIGN,
                priority=TaskPriority.HIGH,
                depends_on=[task.id],
            ),
            SwarmTask(
                id=f"{task.id}/4",
                title="Remediation plan",
                description="Document findings, assign fixes to agents, track to completion",
                phase=TaskPhase.DEVELOPMENT,
                priority=TaskPriority.CRITICAL,
                depends_on=[f"{task.id}/1", f"{task.id}/2", f"{task.id}/3"],
            ),
        ]
