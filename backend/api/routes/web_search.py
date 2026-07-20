"""
Web Search API for ROSTR Framework
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from rostr.ragdal.search import SearchExecutor, SearchResult
from rostr.ragdal.tiers import SourceTier
import asyncio

router = APIRouter(prefix="/search", tags=["Web Search"])


class SearchQuery(BaseModel):
    query: str
    max_results: int = 10
    tier_filter: Optional[List[str]] = None
    require_credibility_threshold: Optional[float] = 0.5


class SearchResponse(BaseModel):
    results: List[dict]
    count: int
    avg_credibility: float


@router.post("/query", response_model=SearchResponse)
async def search_web(
    search_query: SearchQuery,
):
    """
    Execute web search with ROSTR tier filtering
    
    This endpoint allows agents to search the web with automatic
    source credibility classification using the ROSTR tier system.
    """
    try:
        # Convert tier filter strings to SourceTier enums if provided
        tier_filter = None
        if search_query.tier_filter:
            tier_filter = []
            for tier_str in search_query.tier_filter:
                try:
                    tier_enum = SourceTier[tier_str.upper()]
                    tier_filter.append(tier_enum)
                except KeyError:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid tier '{tier_str}'. Must be PRIMARY, EDITORIAL, or COMMUNITY"
                    )
        
        # Create search executor
        executor = SearchExecutor()
        
        # Execute search
        results = await executor.search(
            query=search_query.query,
            tier_filter=tier_filter,
            max_results=search_query.max_results
        )
        
        # Filter by credibility threshold if specified
        if search_query.require_credibility_threshold:
            filtered_results = [
                r for r in results
                if r.credibility_score >= search_query.require_credibility_threshold
            ]
        else:
            filtered_results = results
        
        # Prepare response
        formatted_results = []
        total_credibility = 0.0
        
        for result in filtered_results:
            formatted_results.append({
                "url": result.url,
                "title": result.title,
                "snippet": result.snippet,
                "tier": result.tier.name,
                "credibility_score": result.credibility_score,
                "published_date": result.published_date.isoformat() if result.published_date else None
            })
            total_credibility += result.credibility_score
        
        avg_credibility = total_credibility / len(filtered_results) if filtered_results else 0.0
        
        # Clean up
        await executor.close()
        
        return SearchResponse(
            results=formatted_results,
            count=len(formatted_results),
            avg_credibility=avg_credibility
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")


@router.get("/health")
async def health_check():
    """
    Health check for web search service
    """
    try:
        # Test a simple search to verify functionality
        executor = SearchExecutor()
        test_results = await executor.search("test", max_results=1)
        await executor.close()
        
        return {
            "status": "healthy",
            "search_api": "DuckDuckGo/AZillionSites",
            "test_successful": len(test_results) > 0,
            "version": "1.0.0"
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "search_api": "DuckDuckGo/AZillionSites",
            "version": "1.0.0"
        }