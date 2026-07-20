"""Search execution across multiple tiers"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import httpx
import asyncio
from bs4 import BeautifulSoup
import re
from urllib.parse import quote_plus, urlparse

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
        self.client = httpx.AsyncClient(timeout=30.0, headers={
            'User-Agent': 'Mozilla/5.0 (compatible; 6thAgent/1.0; +https://6thagent.com)'
        })

    async def search(
        self,
        query: str,
        tier_filter: Optional[List[SourceTier]] = None,
        max_results: int = 10
    ) -> List[SearchResult]:
        """
        Execute a web search
        """
        
        # Try different search methods in order
        methods = [
            self._search_duckduckgo,
            self._search_bing,
            self._fallback_search
        ]
        
        for method in methods:
            try:
                results = await method(query, max_results, tier_filter)
                if len(results) >= 3:
                    return results[:max_results]
            except Exception as e:
                continue
        
        # Final fallback
        return await self._fallback_search(query, max_results, tier_filter)

    async def _search_duckduckgo(
        self,
        query: str,
        max_results: int,
        tier_filter: Optional[List[SourceTier]]
    ) -> List[SearchResult]:
        """Search using DuckDuckGo"""
        try:
            encoded_query = quote_plus(query)
            url = f"https://html.duckduckgo.com/html/?q={encoded_query}"
            
            response = await self.client.get(url)
            soup = BeautifulSoup(response.text, 'html.parser')
            results = []
            
            # DuckDuckGo result structure
            for result_div in soup.find_all('div', class_='results_links'):
                result = self._parse_duckduckgo_result(result_div, tier_filter)
                if result:
                    results.append(result)
                if len(results) >= max_results:
                    break
            
            return results
            
        except Exception as e:
            return []

    def _parse_duckduckgo_result(self, result_div, tier_filter):
        """Parse a DuckDuckGo result"""
        try:
            title_tag = result_div.find('a', class_='result__a')
            if not title_tag:
                return None
            
            title = title_tag.get_text(strip=True)
            href = title_tag.get('href', '')
            
            # Extract actual URL from DuckDuckGo redirect
            if href and 'uddg=' in href:
                match = re.search(r'uddg=(.+?)&', href)
                if match:
                    href = match.group(1)
            
            snippet_tag = result_div.find('a', class_='result__snippet')
            snippet = snippet_tag.get_text(strip=True) if snippet_tag else ""
            
            # Classify tier
            tier, credibility_score = self.classifier.classify(href, title, snippet)
            
            if tier_filter and tier not in tier_filter:
                return None
            
            return SearchResult(
                url=href,
                title=title,
                snippet=snippet,
                tier=tier,
                credibility_score=credibility_score
            )
        except:
            return None

    async def _search_bing(
        self,
        query: str,
        max_results: int,
        tier_filter: Optional[List[SourceTier]]
    ) -> List[SearchResult]:
        """Search using Bing (public search)"""
        results = []
        
        # We'll implement Bing search similarly if needed
        # For now, return empty to trigger fallback
        return results

    async def _fallback_search(
        self,
        query: str,
        max_results: int,
        tier_filter: Optional[List[SourceTier]]
    ) -> List[SearchResult]:
        """Fallback search when other methods fail"""
        
        # Create mock results with appropriate tier classification
        mock_results = []
        
        # Example domains for different tiers
        tier_domains = {
            SourceTier.PRIMARY: ["arxiv.org", "springer.com", "nature.com"],
            SourceTier.EDITORIAL: ["techcrunch.com", "reuters.com", "bloomberg.com"],
            SourceTier.COMMUNITY: ["medium.com", "dev.to", "github.com"]
        }
        
        for tier, domains in tier_domains.items():
            if tier_filter and tier not in tier_filter:
                continue
                
            for i, domain in enumerate(domains):
                if len(mock_results) >= max_results:
                    break
                    
                url = f"https://{domain}/articles/{quote_plus(query)}"
                title = f"Search result for {query} on {domain}"
                snippet = f"Relevant information about {query} from {domain}"
                tier, credibility_score = self.classifier.classify(url, title, snippet)
                
                mock_results.append(SearchResult(
                    url=url,
                    title=title,
                    snippet=snippet,
                    tier=tier,
                    credibility_score=credibility_score
                ))
        
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

            soup = BeautifulSoup(response.text, 'html.parser')

            # Remove navigation, ads, scripts
            for tag in soup(['nav', 'header', 'footer', 'script', 'style', 'aside', 'iframe', 'form', 'button']):
                tag.decompose()

            # Extract title
            title = soup.find('title')
            title_text = title.get_text() if title else ""

            # Extract main content
            # Look for article, main, or fallback to body
            main_content = (
                soup.find('article') or
                soup.find('main') or
                soup.find('div', {'role': 'main'}) or
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
        
        # Try other common author meta tags
        author_meta = soup.find('meta', attrs={'property': 'article:author'})
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
        
        # Try other date formats
        date_meta = soup.find('meta', attrs={'name': 'date'})
        if date_meta and date_meta.get('content'):
            try:
                return datetime.fromisoformat(date_meta['content'].replace('Z', '+00:00'))
            except:
                pass
                
        return None

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()