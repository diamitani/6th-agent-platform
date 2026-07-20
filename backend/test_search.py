#!/usr/bin/env python3
"""Test web search integration for ROSTR framework"""

import asyncio
import sys
import os

# Add the rostr-agent-framework to path
sys.path.insert(0, '/Users/patmini/6th-agent-platform/rostr-agent-framework')

from rostr.ragdal.search import SearchExecutor
from rostr.ragdal.tiers import SourceTier

async def test_search():
    """Test the web search functionality"""
    
    print("Testing ROSTR web search integration...")
    
    try:
        executor = SearchExecutor()
        
        # Test search
        query = "ROSTR framework multi-agent systems"
        print(f"\nSearching for: {query}")
        
        results = await executor.search(query, max_results=5)
        
        print(f"\nFound {len(results)} results:")
        print("-" * 80)
        
        for i, result in enumerate(results, 1):
            print(f"\n[{i}] {result.title}")
            print(f"    URL: {result.url}")
            print(f"    Tier: {result.tier.name}")
            print(f"    Credibility: {result.credibility_score:.2f}")
            print(f"    Snippet: {result.snippet[:200]}...")
        
        # Test content extraction
        if results:
            print(f"\n\nTesting content extraction from first result...")
            content = await executor.extract_content(results[0].url)
            
            if content:
                print(f"    Title: {content.title}")
                print(f"    Content length: {len(content.content)} chars")
                print(f"    Tier: {content.tier.name}")
                print(f"    Credibility: {content.credibility_score:.2f}")
            else:
                print("    Content extraction failed")
        
        await executor.close()
        print("\n✅ Search test completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = asyncio.run(test_search())
    sys.exit(0 if success else 1)