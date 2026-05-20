"""Main NPAO orchestrator - Navigate, Prioritize, Allocate, Orchestrate"""

from typing import List, Dict, Optional
from rostr.npao.phases import Phase, Phase5D
from rostr.npao.prioritizer import PriorityScorer, Task
from rostr.npao.allocator import AgentAllocator, Agent


class NPAOOrchestrator:
    """
    NPAO Orchestration Engine

    Four functions:
    1. Navigate - Determine phase for each task
    2. Prioritize - Score and order tasks
    3. Allocate - Match tasks to agents
    4. Orchestrate - Execute the allocation
    """

    def __init__(self):
        self.prioritizer = PriorityScorer()
        self.allocator = AgentAllocator()
        self.agents: List[Agent] = []
        self.tasks: List[Task] = []

    def register_agent(self, agent: Agent):
        """Register an agent with the orchestrator"""
        self.agents.append(agent)

    def navigate(self, task_description: str) -> Phase:
        """
        Navigate: Classify task into a phase

        Args:
            task_description: Natural language task description

        Returns:
            Phase classification
        """
        return Phase5D.classify_phase(task_description)

    def prioritize(self, tasks: List[Task]) -> List[Task]:
        """
        Prioritize: Score and sort tasks by priority

        Args:
            tasks: List of tasks to prioritize

        Returns:
            Tasks sorted by priority (highest first)
        """
        return self.prioritizer.prioritize(tasks)

    def allocate(self, tasks: List[Task]) -> Dict[str, Optional[Agent]]:
        """
        Allocate: Match tasks to agents

        Args:
            tasks: List of tasks to allocate

        Returns:
            Dictionary mapping task_id -> agent (or None if no agent available)
        """
        allocations = {}

        for task in tasks:
            agent = self.allocator.allocate(task, self.agents)
            allocations[task.id] = agent

            # Update agent's current tasks if allocated
            if agent:
                agent.current_tasks.append(task.id)

        return allocations

    def orchestrate(self, tasks: List[Task]) -> List[Dict]:
        """
        Orchestrate: Full NPAO cycle

        Args:
            tasks: List of tasks to orchestrate

        Returns:
            List of execution plans with task, agent, and priority
        """

        # 1. Navigate - classify phases (already done when tasks created)

        # 2. Prioritize - score and sort
        prioritized_tasks = self.prioritize(tasks)

        # 3. Allocate - match to agents
        allocations = self.allocate(prioritized_tasks)

        # 4. Build execution plan
        execution_plan = []

        for task in prioritized_tasks:
            priority_score = self.prioritizer.score(task, tasks)
            agent = allocations.get(task.id)

            execution_plan.append({
                "task_id": task.id,
                "description": task.description,
                "phase": task.phase.value,
                "priority_score": priority_score,
                "agent": agent.name if agent else "UNALLOCATED",
                "status": "ready" if agent else "blocked"
            })

        return execution_plan

    def execute(self, execution_plan: List[Dict]) -> List[str]:
        """
        Execute the orchestrated plan

        In production, this would dispatch tasks to agents.
        For MVP, we return the execution order.

        Args:
            execution_plan: Plan from orchestrate()

        Returns:
            List of execution log messages
        """

        log = []

        log.append("=== NPAO Execution Plan ===\n")

        for i, item in enumerate(execution_plan, 1):
            log.append(
                f"{i}. [{item['phase'].upper()}] {item['description']}\n"
                f"   Priority: {item['priority_score']:.2f} | "
                f"Agent: {item['agent']} | "
                f"Status: {item['status']}"
            )

        return log
