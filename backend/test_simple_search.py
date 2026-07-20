#!/usr/bin/env python3
"""Simple web search test"""

import httpx
from bs4 import BeautifulSoup
import asyncio
from urllib.parse import quote_plus

async def test_duckduckgo_search():
    """Test DuckDuckGo search directly"""
    
    client = httpx.AsyncClient(timeout=30.0, headers={
        'User-Agent': 'Mozilla/5.0 (compatible; 6thAgent/1.0; +https://6thagent.com)'
    })
    
    try:
        query = "ROSTR framework multi-agent systems"
        encoded_query = quote_plus(query)
        url = f"https://html.duckduckgo.com/html/?q={encoded_query}"
        
        print(f"Searching for: {query}")
        print(f"URL: {url}")
        
        response = await client.get(url)
        print(f"Status: {response.status_code}")
        
        # Save the HTML for inspection
        with open('test_search.html', 'w', encoding='utf-8') as f:
            f.write(response.text)
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Look for results
        results = []
        
        # Check for common DuckDuckGo result structures
        result_divs = soup.find_all('div', class_='result')
        print(f"Found {len(result_divs)} divs with class 'result'")
        
        for div in result_divs[:5]:
            title_div = div.find('a', class_='result__a')
            snippet_div = div.find('a', class_='result__snippet')
            
            if title_div:
                title = title_div.get_text(strip=True)
                href = title_div.get('href', '')
                snippet = snippet_div.get_text(strip=True) if snippet_div else ""
                
                print(f"\nTitle: {title}")
                print(f"URL: {href}")
                print(f"Snippet: {snippet[:100]}...")
                print("-" * 50)
                
                results.append({
                    'title': title,
                    'url': href,
                    'snippet': snippet
                })
        
        # Also check for other potential result structures
        if not results:
            print("\nTrying alternative selectors...")
            
            # Look for any links that might contain search results
            links = soup.find_all('a')
            for link in links[:10]:
                text = link.get_text(strip=True)
                href = link.get('href', '')
                if text and len(text) > 10 and 'http' in href:
                    print(f"\nLink: {text[:50]}...")
                    print(f"URL: {href}")
        
        await client.aclose()
        
        print(f"\n✅ DuckDuckGo search test completed!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = asyncio.run(test_duckduckgo_search())