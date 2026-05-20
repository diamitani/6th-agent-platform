"""Search execution across multiple tiers"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import httpx
import asyncio
from bs4 import BeautifulSoup
from rostr.ragdal.tiers import SourceTier, SourceTierClassifier


@dataclass
class SearchResult:
    """A single search result"""
    url: str
    title: str
    snippet: str
    tier: SourceTier
    credibility_score: float
    published_date: Optional[datetime] = None


@dataclass
class ExtractedContent:
    """Extracted and cleaned content from a URL"""
    url: str
    title: str
    content: str
    author: Optional[str]
    published_date: Optional[datetime]
    tier: SourceTier
    credibility_score: float


class SearchExecutor:
    """Executes web searches across credibility tiers"""

    def __init__(self):
        self.classifier = SourceTierClassifier()
        self.client = httpx.AsyncClient(timeout=30.0)

    async def search(
        self,
        query: str,
        tier_filter: Optional[List[SourceTier]] = None,
        max_results: int = 10
    ) -> List[SearchResult]:
        """
        Execute a web search

        In a production implementation, this would use:
        - SerpAPI for Google search
        - Bing Search API
        - DuckDuckGo API
        - Or a combination

        For this MVP, we'll return mock results showing the structure.
        """

        # TODO: Integrate with real search API
        # For now, return example structure

        mock_results = [
            SearchResult(
                url="https://arxiv.org/example",
                title=f"Research paper about {query}",
                snippet=f"Academic research on {query}...",
                tier=SourceTier.PRIMARY,
                credibility_score=1.0
            ),
            SearchResult(
                url="https://techcrunch.com/example",
                title=f"News article about {query}",
                snippet=f"Recent developments in {query}...",
                tier=SourceTier.EDITORIAL,
                credibility_score=0.75
            ),
            SearchResult(
                url="https://medium.com/example",
                title=f"Blog post about {query}",
                snippet=f"Practical experience with {query}...",
                tier=SourceTier.COMMUNITY,
                credibility_score=0.40
            ),
        ]

        # Filter by tier if specified
        if tier_filter:
            mock_results = [r for r in mock_results if r.tier in tier_filter]

        return mock_results[:max_results]

    async def extract_content(self, url: str) -> Optional[ExtractedContent]:
        """
        Extract and clean content from a URL

        Args:
            url: URL to extract from

        Returns:
            ExtractedContent or None if extraction fails
        """

        try:
            response = await self.client.get(url, follow_redirects=True)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'lxml')

            # Remove navigation, ads, scripts
            for tag in soup(['nav', 'header', 'footer', 'script', 'style', 'aside']):
                tag.decompose()

            # Extract title
            title = soup.find('title')
            title_text = title.get_text() if title else ""

            # Extract main content
            # Look for article, main, or fallback to body
            main_content = (
                soup.find('article') or
                soup.find('main') or
                soup.find('body')
            )

            if not main_content:
                return None

            # Get text content
            content = main_content.get_text(separator='\n', strip=True)

            # Classify tier and get credibility score
            tier, credibility_score = self.classifier.classify(url, title_text, content)

            # Extract metadata
            author = self._extract_author(soup)
            published_date = self._extract_date(soup)

            return ExtractedContent(
                url=url,
                title=title_text,
                content=content,
                author=author,
                published_date=published_date,
                tier=tier,
                credibility_score=credibility_score
            )

        except Exception as e:
            print(f"Error extracting content from {url}: {e}")
            return None

    def _extract_author(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract author from page metadata"""
        author_meta = soup.find('meta', attrs={'name': 'author'})
        if author_meta and author_meta.get('content'):
            return author_meta['content']
        return None

    def _extract_date(self, soup: BeautifulSoup) -> Optional[datetime]:
        """Extract published date from page metadata"""
        date_meta = soup.find('meta', attrs={'property': 'article:published_time'})
        if date_meta and date_meta.get('content'):
            try:
                return datetime.fromisoformat(date_meta['content'].replace('Z', '+00:00'))
            except:
                pass
        return None

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
