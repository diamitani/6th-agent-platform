"""Main RAG DAL pipeline with autonomous loop protocol"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
import asyncio
import uuid

from rostr.ragdal.search import SearchExecutor, SearchResult, ExtractedContent
from rostr.ragdal.knowledge_base import KnowledgeBase, KnowledgeEntry
from rostr.ragdal.tiers import SourceTier


@dataclass
class SubTopic:
    """A sub-topic within a research query"""
    topic: str
    confidence: float
    sources: List[str]


@dataclass
class RAGDALReport:
    """Final research report from RAG DAL"""
    query: str
    passes_run: int
    overall_confidence: float
    sources_consulted: int
    date: datetime
    findings: List[Dict[str, Any]]
    open_questions: List[str]
    gap_indicators: List[str]
    raw_sources: List[Dict[str, Any]]

    def to_markdown(self) -> str:
        """Generate markdown report"""
        md = f"""# RAG DAL Report: {self.query}

**Passes run:** {self.passes_run}
**Overall confidence:** {self.overall_confidence:.1f}/10
**Sources consulted:** {self.sources_consulted}
**Date:** {self.date.isoformat()}

## Key Findings

"""
        for finding in self.findings:
            md += f"""### {finding['topic']}
**Answer:** {finding['answer']}
**Confidence:** {finding['confidence']:.1f}/10
**Primary sources:** {', '.join(finding['primary_sources'])}

"""

        if self.open_questions:
            md += "## Open Questions (confidence < 7/10)\n\n"
            for q in self.open_questions:
                md += f"- {q}\n"

        if self.gap_indicators:
            md += "\n## Gap Indicators\n\n"
            for gap in self.gap_indicators:
                md += f"- {gap}\n"

        md += "\n## Raw Source Index\n\n"
        md += "| # | URL | Tier | Credibility |\n"
        md += "|---|-----|------|-------------|\n"
        for i, source in enumerate(self.raw_sources, 1):
            md += f"| {i} | {source['url']} | {source['tier']} | {source['credibility']:.2f} |\n"

        return md


class RAGDALPipeline:
    """
    Retrieval-Augmented Generation Dynamic Acquisition Layer

    Autonomous, self-improving web retrieval with hierarchical credibility
    """

    def __init__(
        self,
        storage_path: Optional[Path] = None,
        confidence_threshold: float = 0.8,
        max_passes: int = 3
    ):
        self.storage_path = storage_path or Path.cwd() / "rostr-data" / "knowledge"
        self.confidence_threshold = confidence_threshold
        self.max_passes = max_passes

        self.search_executor = SearchExecutor()
        self.knowledge_base = KnowledgeBase(self.storage_path)

    async def search(
        self,
        query: str,
        namespace: str = "global",
        mode: str = "general_knowledge"
    ) -> RAGDALReport:
        """
        Execute RAG DAL search with autonomous loop

        Args:
            query: Research question
            namespace: Knowledge base namespace
            mode: Search mode (academic_research | news_sentinel | general_knowledge)

        Returns:
            RAGDALReport with findings
        """

        # Check cache first
        cached = self.knowledge_base.search(query, namespace, limit=5)
        if cached and len(cached) > 0:
            # Return cached knowledge if recent and confident
            recent_cache = [c for c in cached if
                          (datetime.now() - c.retrieved_date).days < 7 and
                          c.confidence >= self.confidence_threshold]
            if recent_cache:
                return self._build_report_from_cache(query, recent_cache)

        # Execute multi-pass search
        all_results: List[SearchResult] = []
        all_content: List[ExtractedContent] = []
        pass_count = 0

        # Pass 1: Broad sweep across all tiers
        pass_count += 1
        results = await self.search_executor.search(query, max_results=10)
        all_results.extend(results)

        # Extract content from top results
        for result in results[:5]:
            content = await self.search_executor.extract_content(result.url)
            if content:
                all_content.append(content)

        # Assess confidence
        sub_topics = self._identify_sub_topics(query, all_content)
        overall_confidence = self._calculate_confidence(sub_topics)

        # Pass 2: Gap fill if needed
        if overall_confidence < self.confidence_threshold and pass_count < self.max_passes:
            pass_count += 1
            low_confidence_topics = [st for st in sub_topics if st.confidence < self.confidence_threshold]

            for topic in low_confidence_topics:
                gap_results = await self.search_executor.search(
                    f"{query} {topic.topic}",
                    tier_filter=[SourceTier.PRIMARY, SourceTier.EDITORIAL],
                    max_results=3
                )
                all_results.extend(gap_results)

                for result in gap_results[:2]:
                    content = await self.search_executor.extract_content(result.url)
                    if content:
                        all_content.append(content)

            # Recalculate confidence
            sub_topics = self._identify_sub_topics(query, all_content)
            overall_confidence = self._calculate_confidence(sub_topics)

        # Store in knowledge base
        for content in all_content:
            entry = KnowledgeEntry(
                entry_id=str(uuid.uuid4()),
                query_origin=query,
                content=content.content[:5000],  # Truncate for storage
                summary=content.content[:500],  # First 500 chars as summary
                source_url=content.url,
                source_title=content.title,
                source_author=content.author,
                published_date=content.published_date,
                retrieved_date=datetime.now(),
                tier=content.tier.value,
                credibility_score=content.credibility_score,
                topics=[st.topic for st in sub_topics],
                confidence=overall_confidence,
                verification_status="verified" if overall_confidence >= 0.8 else "uncertain"
            )
            self.knowledge_base.store(entry, namespace)

        # Build final report
        return RAGDALReport(
            query=query,
            passes_run=pass_count,
            overall_confidence=overall_confidence * 10,  # Scale to 0-10
            sources_consulted=len(all_results),
            date=datetime.now(),
            findings=[self._build_finding(st, all_content) for st in sub_topics],
            open_questions=[st.topic for st in sub_topics if st.confidence < 0.7],
            gap_indicators=[],
            raw_sources=[
                {
                    "url": r.url,
                    "title": r.title,
                    "tier": r.tier.value,
                    "credibility": r.credibility_score
                }
                for r in all_results
            ]
        )

    def _identify_sub_topics(
        self,
        query: str,
        content: List[ExtractedContent]
    ) -> List[SubTopic]:
        """Identify sub-topics within the query (simplified)"""
        # In production, this would use LLM to extract sub-topics
        # For MVP, return main query as single topic
        return [
            SubTopic(
                topic=query,
                confidence=0.8 if len(content) >= 2 else 0.5,
                sources=[c.url for c in content]
            )
        ]

    def _calculate_confidence(self, sub_topics: List[SubTopic]) -> float:
        """Calculate overall confidence score"""
        if not sub_topics:
            return 0.0
        return sum(st.confidence for st in sub_topics) / len(sub_topics)

    def _build_finding(
        self,
        sub_topic: SubTopic,
        content: List[ExtractedContent]
    ) -> Dict[str, Any]:
        """Build a finding from content"""
        relevant_content = [c for c in content if c.url in sub_topic.sources]

        return {
            "topic": sub_topic.topic,
            "answer": relevant_content[0].content[:500] if relevant_content else "No answer found",
            "confidence": sub_topic.confidence * 10,
            "primary_sources": [c.url for c in relevant_content if c.tier == SourceTier.PRIMARY],
            "supporting_sources": [c.url for c in relevant_content if c.tier != SourceTier.PRIMARY]
        }

    def _build_report_from_cache(
        self,
        query: str,
        cached: List[KnowledgeEntry]
    ) -> RAGDALReport:
        """Build report from cached knowledge"""
        return RAGDALReport(
            query=query,
            passes_run=0,
            overall_confidence=cached[0].confidence * 10,
            sources_consulted=len(cached),
            date=datetime.now(),
            findings=[{
                "topic": query,
                "answer": c.summary,
                "confidence": c.confidence * 10,
                "primary_sources": [c.source_url],
                "supporting_sources": []
            } for c in cached],
            open_questions=[],
            gap_indicators=[],
            raw_sources=[{
                "url": c.source_url,
                "title": c.source_title,
                "tier": c.tier,
                "credibility": c.credibility_score
            } for c in cached]
        )

    async def close(self):
        """Clean up resources"""
        await self.search_executor.close()
