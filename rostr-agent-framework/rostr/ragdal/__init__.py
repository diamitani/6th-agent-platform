"""RAG DAL - Retrieval-Augmented Generation Dynamic Acquisition Layer

Hierarchical knowledge retrieval with source credibility tiering.
"""

from rostr.ragdal.pipeline import RAGDALPipeline
from rostr.ragdal.search import SearchExecutor
from rostr.ragdal.knowledge_base import KnowledgeBase
from rostr.ragdal.tiers import SourceTier

__all__ = [
    "RAGDALPipeline",
    "SearchExecutor",
    "KnowledgeBase",
    "SourceTier",
]
