# Web Search Integration Guide for 6th Agent Platform

## Overview

The 6th Agent platform now includes integrated web search capabilities using DuckDuckGo as the primary search provider. This implementation includes the ROSTR tier system for source credibility assessment, allowing agents to filter search results by source quality.

## Current Implementation Status

✅ **Web search is fully implemented and integrated** with the following components:

1. **Search Engine** (`/Users/patmini/6th-agent-platform/rostr-agent-framework/rostr/ragdal/search.py`)
   - DuckDuckGo web search implementation
   - Result parsing and URL extraction
   - ROSTR tier classification integration
   - Content extraction from URLs
   - Fallback search methods

2. **API Endpoints** (`/Users/patmini/6th-agent-platform/backend/api/routes/web_search.py`)
   - `/api/search/query` - POST endpoint for web search
   - `/api/search/health` - GET endpoint for health check
   - ROSTR tier filtering support
   - Credibility threshold filtering

3. **Main Application Integration** (`/Users/patmini/6th-agent-platform/backend/main.py`)
   - Web search routes included in FastAPI app
   - Available at `/api/search/*` endpoints

4. **Deployment Script** (`/Users/patmini/6th-agent-platform/deploy_web_search.sh`)
   - Ready-to-use deployment script for EC2 instances
   - Automated testing and setup instructions

## How It Works

### Search Flow
1. User/Agent submits search query via API
2. `SearchExecutor` tries multiple search methods (DuckDuckGo → Bing → Fallback)
3. Results are classified using ROSTR tier system:
   - **PRIMARY**: Academic, government, official sources
   - **EDITORIAL**: News, media, expert blogs  
   - **COMMUNITY**: Forums, social media, user-generated
4. Credibility scores assigned based on source tier
5. Filtered and ranked results returned to requester

### API Usage Example

```bash
# Search with basic query
curl -X POST http://localhost:8000/api/search/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "latest AI agent frameworks",
    "max_results": 5
  }'

# Search with tier filtering
curl -X POST http://localhost:8000/api/search/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "ROSTR framework architecture",
    "max_results": 10,
    "tier_filter": ["PRIMARY", "EDITORIAL"],
    "require_credibility_threshold": 0.7
  }'
```

### Agent Integration Example

Agents can use web search by:
1. Importing `from rostr.ragdal.search import SearchExecutor`
2. Creating a search executor instance
3. Calling `await executor.search(query, tier_filter, max_results)`
4. Extracting content from results with `await executor.extract_content(url)`

## Testing Instructions

### 1. Local Testing (Development)

```bash
cd /Users/patmini/6th-agent-platform/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install required packages
pip install httpx beautifulsoup4

# Run test scripts
python test_simple_search.py
python test_search.py
```

### 2. Server Deployment (EC2 Instance i-05dc9c09fe056d67a)

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@52.20.23.44

# Navigate to repository
cd ~/6th-agent-platform

# Run deployment script
./deploy_web_search.sh

# Test the deployed service
curl -X POST http://localhost:8000/api/search/query \
  -H "Content-Type: application/json" \
  -d '{"query": "test search", "max_results": 3}'
```

## Recommended Improvements

### 1. API Key Integration Options
Consider adding support for:
- **SerpAPI**: More reliable but requires API key
- **Google Search API**: High-quality results but paid
- **Bing Search API**: Good alternative with free tier

### 2. Caching Implementation
Add Redis caching for:
- Common search queries
- Frequently accessed URLs
- Extracted content

### 3. Rate Limiting
Implement rate limiting to:
- Prevent abuse
- Respect DuckDuckGo's terms
- Manage API costs (if using paid APIs)

### 4. Enhanced Parsing
Improve HTML parsing for:
- Better content extraction
- More accurate tier classification  
- Author and date metadata extraction

## Usage in Agent Workflows

### Research Agent
The Researcher agent (`rostr/agents/researcher.py`) includes web search as a core capability:

```python
from rostr.ragdal.search import SearchExecutor

# Example agent workflow
async def research_topic(self, topic: str):
    executor = SearchExecutor()
    results = await executor.search(
        query=f"{topic} latest developments",
        tier_filter=[SourceTier.PRIMARY, SourceTier.EDITORIAL],
        max_results=10
    )
    
    # Process and synthesize results
    synthesized = await self.synthesize_knowledge(results)
    await executor.close()
    return synthesized
```

### Multi-Agent Collaboration
Agents can share search results through:
- State manager for cross-agent knowledge sharing
- Message bus for real-time result distribution
- Shared workspace for collaborative research

## Monitoring & Maintenance

### Health Checks
Monitor web search health via:
```bash
curl http://localhost:8000/api/search/health
```

### Logging
Search activity is logged to:
- Application logs (`logs/6th-agent.log`)
- Search-specific metrics
- Error tracking for failed searches

### Performance Metrics
Track:
- Average response time
- Success rate by search method
- Cache hit/miss ratio
- Credibility score distribution

## Troubleshooting

### Common Issues

1. **No search results returned**
   - Check internet connectivity
   - Verify DuckDuckGo accessibility
   - Review HTML parsing selectors

2. **SSL certificate errors**
   - Update certificates: `sudo apt-get update && sudo apt-get install ca-certificates`
   - Use http_client with verify=False for development only

3. **Rate limiting**
   - Implement exponential backoff
   - Consider alternative search providers
   - Add request delays

4. **Content extraction failures**
   - Update BeautifulSoup parsing logic
   - Try alternative content extraction methods
   - Implement fallback extraction strategies

## Conclusion

The web search integration is production-ready with DuckDuckGo support. For high-volume or mission-critical applications, consider adding paid search API options. The ROSTR tier system provides built-in source quality assessment, making this particularly suitable for research-focused agent workflows.

For updates or improvements, refer to the search implementation in `rostr-agent-framework/rostr/ragdal/`.