"""Source credibility tiering system"""

from enum import Enum
from dataclasses import dataclass
from typing import List
from urllib.parse import urlparse


class SourceTier(int, Enum):
    """Three-tier source credibility hierarchy"""
    PRIMARY = 1  # Weight: 1.0
    EDITORIAL = 2  # Weight: 0.75
    COMMUNITY = 3  # Weight: 0.40


@dataclass
class SourcePattern:
    """Pattern for matching sources to tiers"""
    tier: SourceTier
    domains: List[str]
    patterns: List[str]
    weight: float


class SourceTierClassifier:
    """Classifies sources into credibility tiers"""

    TIER_PATTERNS = [
        # Tier 1: Primary & Authoritative (Weight: 1.0)
        SourcePattern(
            tier=SourceTier.PRIMARY,
            domains=[
                "arxiv.org",
                "pubmed.ncbi.nlm.nih.gov",
                "scholar.google.com",
                "wikipedia.org",
                "britannica.com",
                "gov",  # All .gov domains
                "edu",  # All .edu domains
                "ieee.org",
                "acm.org",
            ],
            patterns=[
                "official documentation",
                "government",
                "academic",
                "encyclopedia",
                "standards body",
            ],
            weight=1.0
        ),

        # Tier 2: Verified & Editorial (Weight: 0.75)
        SourcePattern(
            tier=SourceTier.EDITORIAL,
            domains=[
                "reuters.com",
                "apnews.com",
                "bbc.com",
                "nytimes.com",
                "wsj.com",
                "bloomberg.com",
                "techcrunch.com",
                "theverge.com",
                "gartner.com",
                "forrester.com",
                "mckinsey.com",
            ],
            patterns=[
                "news",
                "journal",
                "peer-reviewed",
                "analyst report",
                "trade publication",
            ],
            weight=0.75
        ),

        # Tier 3: Community & UGC (Weight: 0.40)
        SourcePattern(
            tier=SourceTier.COMMUNITY,
            domains=[
                "medium.com",
                "substack.com",
                "linkedin.com",
                "twitter.com",
                "x.com",
                "reddit.com",
                "stackoverflow.com",
                "news.ycombinator.com",
                "youtube.com",
                "github.com",  # Issues/discussions
            ],
            patterns=[
                "blog",
                "social media",
                "forum",
                "user review",
                "community",
            ],
            weight=0.40
        ),
    ]

    def classify(self, url: str, title: str = "", content: str = "") -> tuple[SourceTier, float]:
        """
        Classify a source into a tier based on URL, title, and content

        Returns:
            (tier, credibility_weight)
        """
        parsed = urlparse(url.lower())
        domain = parsed.netloc.replace("www.", "")

        # Check domain patterns
        for pattern in self.TIER_PATTERNS:
            # Check if domain matches
            if any(d in domain for d in pattern.domains):
                return (pattern.tier, pattern.weight)

            # Check if domain ends with a pattern (for .gov, .edu)
            if any(domain.endswith(f".{d}") for d in pattern.domains):
                return (pattern.tier, pattern.weight)

        # Default to Tier 3 if unknown
        return (SourceTier.COMMUNITY, 0.40)

    def get_tier_weight(self, tier: SourceTier) -> float:
        """Get credibility weight for a tier"""
        weights = {
            SourceTier.PRIMARY: 1.0,
            SourceTier.EDITORIAL: 0.75,
            SourceTier.COMMUNITY: 0.40,
        }
        return weights[tier]
