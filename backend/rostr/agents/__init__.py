from .engineering_agent import EngineeringAgent
from .ai_agent import AIAgent
from .design_agent import DesignAgent
from .development_agent import DevelopmentAgent
from .backend_agent import BackendAgent
from .frontend_agent import FrontendAgent
from .product_agent import ProductAgent
from .devops_agent import DevOpsAgent
from .qa_agent import QAAgent
from .security_agent import SecurityAgent
from .skill_agent import SkillAgent

MASTER_AGENTS = {
    "engineering": EngineeringAgent,
    "ai": AIAgent,
    "design": DesignAgent,
    "development": DevelopmentAgent,
    "backend": BackendAgent,
    "frontend": FrontendAgent,
    "product": ProductAgent,
    "devops": DevOpsAgent,
    "qa": QAAgent,
    "security": SecurityAgent,
    "skill": SkillAgent,
}

SKILL_AGENT = SkillAgent

__all__ = [
    "MASTER_AGENTS",
    "SKILL_AGENT",
    "EngineeringAgent",
    "AIAgent",
    "DesignAgent",
    "DevelopmentAgent",
    "BackendAgent",
    "FrontendAgent",
    "ProductAgent",
    "DevOpsAgent",
    "QAAgent",
    "SecurityAgent",
    "SkillAgent",
]
