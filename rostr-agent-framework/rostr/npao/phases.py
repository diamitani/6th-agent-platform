"""The 5D Framework - PreD, Design, Development, Deployment, Debugging"""

from enum import Enum
from dataclasses import dataclass
from typing import List, Dict, Any


class Phase(str, Enum):
    """The five development phases"""
    PRED = "pred"  # Pre-Development / Drafting
    DESIGN = "design"
    DEVELOPMENT = "development"
    DEPLOYMENT = "deployment"
    DEBUGGING = "debugging"


@dataclass
class PhaseGate:
    """Completion criteria for a phase"""
    phase: Phase
    criteria: List[str]
    question: str
    next_phase: Phase


class Phase5D:
    """The 5D Framework with phase definitions and gates"""

    PHASE_DEFINITIONS = {
        Phase.PRED: {
            "question": "Is this worth building?",
            "description": "Problem definition, research, go/no-go decision",
            "agent_types": ["research", "planning"],
            "output": "PreD Report",
            "base_urgency": 2,
        },
        Phase.DESIGN: {
            "question": "What exactly are we building?",
            "description": "Architecture, wireframes, data models, API contracts",
            "agent_types": ["architect", "designer", "plan-eng-review"],
            "output": "Design Spec",
            "base_urgency": 4,
        },
        Phase.DEVELOPMENT: {
            "question": "Does it work?",
            "description": "Implementation, testing, code review, documentation",
            "agent_types": ["builder", "reviewer", "qa"],
            "output": "Working Code",
            "base_urgency": 6,
        },
        Phase.DEPLOYMENT: {
            "question": "Is it safe to ship?",
            "description": "CI/CD, staging verification, production deploy, monitoring",
            "agent_types": ["deploy", "canary", "benchmark"],
            "output": "Live Feature",
            "base_urgency": 8,
        },
        Phase.DEBUGGING: {
            "question": "What broke and why?",
            "description": "Bug reproduction, root cause analysis, fix, regression test",
            "agent_types": ["investigate", "builder", "qa"],
            "output": "Fix + Post-mortem",
            "base_urgency": 10,  # Always highest priority
        },
    }

    PHASE_GATES = {
        Phase.PRED: PhaseGate(
            phase=Phase.PRED,
            criteria=[
                "Problem stated in one sentence",
                "Target user identified",
                "3+ alternatives considered and rejected",
                "Success criteria defined",
                "Known unknowns documented",
                "Go/no-go decision made"
            ],
            question="Is this worth building?",
            next_phase=Phase.DESIGN
        ),
        Phase.DESIGN: PhaseGate(
            phase=Phase.DESIGN,
            criteria=[
                "Architecture diagram exists",
                "User flows documented",
                "Data models defined",
                "All interfaces specified",
                "Technology choices made",
                "Edge cases identified"
            ],
            question="What exactly are we building?",
            next_phase=Phase.DEVELOPMENT
        ),
        Phase.DEVELOPMENT: PhaseGate(
            phase=Phase.DEVELOPMENT,
            criteria=[
                "All specified features implemented",
                "Test coverage meets threshold",
                "Code review passed",
                "No known blocking bugs",
                "Documentation updated"
            ],
            question="Does it work?",
            next_phase=Phase.DEPLOYMENT
        ),
        Phase.DEPLOYMENT: PhaseGate(
            phase=Phase.DEPLOYMENT,
            criteria=[
                "Staging environment passes QA",
                "Performance benchmarks within target",
                "Security audit passed",
                "Monitoring and alerting active",
                "Rollback procedure tested",
                "Production deploy verified"
            ],
            question="Is it safe to ship?",
            next_phase=Phase.DEBUGGING  # Cycles back if issues found
        ),
        Phase.DEBUGGING: PhaseGate(
            phase=Phase.DEBUGGING,
            criteria=[
                "Bug reproduced reliably",
                "Root cause identified",
                "Fix implemented and tested",
                "Regression test added",
                "Post-mortem written (if P0/P1)"
            ],
            question="What broke and why?",
            next_phase=Phase.DEVELOPMENT  # Returns to dev after fix
        ),
    }

    @classmethod
    def get_definition(cls, phase: Phase) -> Dict[str, Any]:
        """Get definition for a phase"""
        return cls.PHASE_DEFINITIONS[phase]

    @classmethod
    def get_gate(cls, phase: Phase) -> PhaseGate:
        """Get completion gate for a phase"""
        return cls.PHASE_GATES[phase]

    @classmethod
    def get_base_urgency(cls, phase: Phase) -> int:
        """Get base urgency score for a phase"""
        return cls.PHASE_DEFINITIONS[phase]["base_urgency"]

    @classmethod
    def classify_phase(cls, task_description: str) -> Phase:
        """Classify a task into a phase (simplified keyword matching)"""
        desc_lower = task_description.lower()

        # Debugging keywords (highest priority)
        if any(word in desc_lower for word in ["bug", "fix", "broken", "error", "crash"]):
            return Phase.DEBUGGING

        # PreD keywords
        if any(word in desc_lower for word in ["research", "investigate", "explore", "should we"]):
            return Phase.PRED

        # Design keywords
        if any(word in desc_lower for word in ["design", "architect", "plan", "wireframe", "spec"]):
            return Phase.DESIGN

        # Deployment keywords
        if any(word in desc_lower for word in ["deploy", "ship", "release", "production"]):
            return Phase.DEPLOYMENT

        # Default to development
        return Phase.DEVELOPMENT
