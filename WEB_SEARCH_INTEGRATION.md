# Web Search Integration for ROSTR Framework

## Overview

Web search capabilities have been integrated into the 6th Agent platform using DuckDuckGo HTML search. The implementation follows ROSTR architecture principles, including source credibility tiering, automatic classification, and integration with the existing RAGDAL pipeline.

## Quick Start

### Test Web Search Locally

```bash
# From your local machine (for testing)
curl -X POST http://localhost:8000/api/search/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "ROSTR framework agent architecture",
    "max_results": 5,
    "tier_filter": ["PRIMARY", "EDITORIAL"],
    "require_credibility_threshold": 0.7
  }'
```

### Deploy to EC2 Instance

1. SSH into your EC2 instance:
```bash
ssh -i your-key.pem ubuntu@52.20.23.44
```

2. Update and deploy:
```bash
cd ~/6th-agent-platform
git pull
chmod +x deploy_web_search.sh
./deploy_web_search.sh
```

## API Reference

### Search Endpoint

**POST** `/api/search/query`

Execute web search with ROSTR tier filtering.

**Request Body:**
```json
{
  "query": "Your search query",
  "max_results": 10,
  "tier_filter": ["PRIMARY", "EDITORIAL", "COMMUNITY"],
  "require_credibility_threshold": 0.5
}
```

**Response:**
```json
{
  "results": [
    {
      "url": "https://example.com/article",
      "title": "Article Title",
      "snippet": "Content snippet...",
      "tier": "PRIMARY",
      "credibility_score": 1.0,
      "published_date": "2024-12-15T10:30:00"
    }
  ],
  "count": 3,
  "avg_credibility": 0.87
}
```

## Usage in Agents

### Using from Python Agents

```python
import httpx
from rostr.ragdal.tiers import SourceTier

async def search_with_agent(query: str, agent_id: str):
    """Example agent function to use web search"""
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/api/search/query",
            json={
                "query": query,
                "max_results": 5,
                "tier_filter": [SourceTier.PRIMARY.name, SourceTier.EDITORIAL.name],
                "require_credibility_threshold": 0.8
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            results = data["results"]
            
            # Process results based on credibility
            high_cred_results = [
                r for r in results 
                if r["credibility_score"] >= 0.9
            ]
            
            return {
                "all_results": results,
                "high_credibility": high_cred_results,
                "average_credibility": data["avg_credibility"]
            }
    
    return {"error": "Search failed"}
```

### Integration with RAGDAL Pipeline

```python
from rostr.ragdal.pipeline import RAGDALPipeline
from rostr.ragdal.search import SearchExecutor

class EnhancedRAGDALPipeline(RAGDALPipeline):
    """ROSTR Dynamic Acquisition Layer with Web Search"""
    
    async def multi_pass_retrieval(self, query: str, confidence_threshold: float = 0.8):
        """
        Multi-pass retrieval with web search capabilities
        """
        
        executor = SearchExecutor()
        
        # Pass 1: Broad sweep
        initial_results = await executor.search(
            query=query,
            max_results=10,
            tier_filter=[SourceTier.PRIMARY, SourceTier.EDITORIAL]
        )
        
        # Analyze coverage
        confidence_per_topic = self._analyze_coverage(initial_results)
        
        # Pass 2: Gap fill for low confidence topics
        if any(conf < confidence_threshold for conf in confidence_per_topic.values()):
            gap_queries = self._generate_gap_queries(confidence_per_topic, confidence_threshold)
            
            gap_results = []
            for gap_query in gap_queries:
                results = await executor.search(
                    query=gap_query,
                    max_results=3,
                    tier_filter=[SourceTier.PRIMARY]
                )
                gap_results.extend(results)
            
            # Combine and deduplicate
            all_results = await self._merge_results(initial_results, gap_results)
        else:
            all_results = initial_results
        
        # Extract and process content
        knowledge_entries = []
        for result in all_results:
            if result.credibility_score >= 0.7:
                content = await executor.extract_content(result.url)
                if content:
                    knowledge_entries.append(
                        self._create_knowledge_entry(content, result.credibility_score)
                    )
        
        await executor.close()
        return knowledge_entries
```

## ROSTR Integration Points

### PAL Compilation Integration

The web search can be invoked during PAL compilation for intent understanding:

```python
from rostr.pal.compiler import PALCompiler

class EnhancedPALCompiler(PALCompiler):
    async def compile(self, raw_input: str, context: dict = None):
        # Extract search intent
        if self._requires_web_search(raw_input):
            from rostr.ragdal.search import SearchExecutor
            
            executor = SearchExecutor()
            search_results = await executor.search(
                query=self._extract_search_query(raw_input),
                max_results=3,
                tier_filter=[SourceTier.PRIMARY]
            )
            
            # Enhance intent with search results
            enhanced_intent = await self._enrich_intent_with_search(
                raw_input, 
                search_results
            )
            
            await executor.close()
            return await super().compile(enhanced_intent, context)
        
        return await super().compile(raw_input, context)
```

### NPAO Orchestration Integration

Agents can be dynamically allocated search capabilities:

```python
from rostr.npao.orchestrator import NPAOOrchestrator

class SearchEnabledNPAOOrchestrator(NPAOOrchestrator):
    def allocate_task_with_search(self, task, agents):
        """Allocate tasks requiring web search to appropriate agents"""
        
        eligible_agents = [
            a for a in agents 
            if hasattr(a, 'search_capabilities') and 
            a.search_capabilities.get('web_search', False)
        ]
        
        if not eligible_agents:
            # Default allocation
            return super().allocate_task(task, agents)
        
        # Score based on search proficiency
        search_scores = []
        for agent in eligible_agents:
            score = (
                agent.search_capabilities.get('success_rate', 0.0) * 0.6 +
                agent.search_capabilities.get('avg_credibility', 0.0) * 0.3 +
                (1.0 - agent.current_tasks / agent.max_parallel_tasks) * 0.1
            )
            search_scores.append((agent, score))
        
        return max(search_scores, key=lambda x: x[1])[0]
```

## Credibility Tier System

The web search uses ROSTR's three-tier source credibility hierarchy:

### Tier 1: Primary & Authoritative Sources (Weight: 1.0)
- Academic journals (arXiv, PubMed, JSTOR)
- Official documentation (.gov, .edu domains)
- Standards bodies and encyclopedias
- **Usage:** Establish ground truth

### Tier 2: Verified & Editorial Sources (Weight: 0.75)
- Major news outlets (Reuters, AP, BBC)
- Trade publications and industry reports
- Analyst reports (Gartner, McKinsey)
- **Usage:** Contextualize Tier 1, current events

### Tier 3: Community & UGC Sources (Weight: 0.40)
- Blogs, social media, forums
- Stack Overflow, Reddit, Hacker News
- User reviews and community content
- **Usage:** Real-world signal, edge cases

## Example Use Cases

### 1. Research Agent
```python
# Use web search for comprehensive research
async def research_task(agent, topic: str):
    results = await agent.search_web(
        query=f"latest developments {topic}",
        tier_filter=["PRIMARY", "EDITORIAL"],
        require_credibility_threshold=0.8
    )
    return await agent.synthesize_research(results)
```

### 2. Market Analysis Agent
```python
# Search for market trends and competitor analysis
async def analyze_market(agent, industry: str):
    searches = [
        f"{industry} market trends 2024",
        f"competitor analysis {industry}",
        f"{industry} customer reviews"
    ]
    
    all_results = []
    for search_query in searches:
        results = await agent.search_web(
            query=search_query,
            tier_filter=["EDITORIAL", "COMMUNITY"],
            require_credibility_threshold=0.6
        )
        all_results.extend(results)
    
    return await agent.analyze_sentiment(all_results)
```

### 3. Technical Debugging Agent
```python
# Search for technical solutions and bug fixes
async def debug_issue(agent, error_message: str):
    # Search for exact error
    exact_results = await agent.search_web(
        query=f'"{error_message}"',
        tier_filter=["COMMUNITY"],
        require_credibility_threshold=0.5
    )
    
    # Search for similar errors
    similar_results = await agent.search_web(
        query=f"how to fix {error_message.split(':')[0]}",
        tier_filter=["COMMUNITY"],
        require_credibility_threshold=0.4
    )
    
    return await agent.rank_solutions(exact_results + similar_results)
```

## Monitoring and Metrics

### Health Checks
```bash
# Check search service health
curl http://localhost:8000/api/search/health
```

### Performance Metrics
- Average search latency
- Success rate per tier
- Credibility score distribution
- Result relevancy (manual feedback)

### Error Handling
The system includes:
- Connection timeout fallback to cached results
- DuckDuckGo failsafe with mock results
- Tier filtering fallback to COMMUNITY if no matches

## Production Considerations

### Scaling Web Search
1. **Consider commercial APIs** for higher reliability:
   - SerpAPI ($50/month for 10k requests)
   - Google Custom Search API
   - Bing Search API

2. **Caching Implementation**:
   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=1000)
   async def cached_search(query: str, max_results: int = 10):
       """Cache search results for common queries"""
       return await search_executor.search(query, max_results=max_results)
   ```

3. **Rate Limiting**:
   - DuckDuckGo has no official rate limits but be respectful
   - Implement 2-5 second delays between searches
   - Use exponential backoff for failed requests

## Troubleshooting

### Common Issues

1. **No results from DuckDuckGo**
   - Check internet connectivity
   - Verify DuckDuckGo HTML endpoints are accessible
   - Try alternative search methods in `search.py`

2. **Low credibility scores**
   - Adjust tier filter to include more sources
   - Lower `require_credibility_threshold`
   - Check URL classification in `tiers.py`

3. **Slow search performance**
   - Increase timeout in `SearchExecutor`
   - Implement result caching
   - Consider commercial search APIs

## Next Steps

### Short-term Enhancements
1. **Add SerpAPI integration** for more reliable results
2. **Implement search result caching** to reduce duplication
3. **Add search history tracking** for audit trails

### Long-term Improvements
1. **Custom search index** using Common Crawl data
2. **ML-based result relevancy scoring**
3. **Multi-modal search** (images, videos, PDFs)

## Support

For issues with web search integration:
1. Check `/api/search/health` endpoint
2. Review logs at `logs/6th-agent.log`
3. Test with simple queries first
4. Verify DuckDuckGo accessibility from your location

---

*Deployed with ROSTR Framework v1.0 | Last Updated: 2026-07-20*