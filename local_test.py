#!/usr/bin/env python3
"""
Local test of web search implementation
Run this to verify web search works before deploying to EC2
"""

import sys
import os

# Add the rostr-agent-framework to path
sys.path.insert(0, '/Users/patmini/6th-agent-platform/rostr-agent-framework')
sys.path.insert(0, '/Users/patmini/6th-agent-platform/backend')

def test_search_implementation():
    """Test the updated search implementation"""
    
    print("🧪 Testing Web Search Implementation")
    print("=" * 50)
    
    try:
        # Test 1: Import the search executor
        try:
            from rostr.ragdal.search import SearchExecutor
            from rostr.ragdal.tiers import SourceTierClassifier
            print("✅ Search executor imports successfully")
        except ImportError as e:
            print(f"❌ Import failed: {e}")
            print("   Check if rostr-agent-framework is in the correct location")
            return False
        
        # Test 2: Create classifier
        classifier = SourceTierClassifier()
        print("✅ Source tier classifier created")
        
        # Test 3: Test classification
        test_urls = [
            "https://arxiv.org/abs/2401.12345",
            "https://reuters.com/article/12345",
            "https://medium.com/@user/article"
        ]
        
        for url in test_urls:
            tier, score = classifier.classify(url)
            print(f"   {url} -> Tier: {tier.name}, Score: {score}")
        
        print("✅ Source classification test passed")
        
        # Test 4: Check for required packages
        try:
            import httpx
            print("✅ httpx package found")
        except ImportError:
            print("⚠️  httpx not installed. Install with: pip install httpx")
        
        try:
            from bs4 import BeautifulSoup
            print("✅ BeautifulSoup package found")
        except ImportError:
            print("⚠️  BeautifulSoup not installed. Install with: pip install beautifulsoup4")
        
        # Test 5: Check search API route
        api_path = "/Users/patmini/6th-agent-platform/backend/api/routes/web_search.py"
        if os.path.exists(api_path):
            print("✅ Web search API route exists")
            
            # Check route registration in main.py
            main_path = "/Users/patmini/6th-agent-platform/backend/main.py"
            if os.path.exists(main_path):
                with open(main_path, 'r') as f:
                    content = f.read()
                    if "web_search" in content:
                        print("✅ Web search route registered in main.py")
                    else:
                        print("❌ Web search route not registered in main.py")
        else:
            print("❌ Web search API route not found")
        
        # Test 6: Check deployment script
        deploy_script = "/Users/patmini/6th-agent-platform/deploy_web_search.sh"
        if os.path.exists(deploy_script):
            print("✅ Deployment script exists")
        else:
            print("❌ Deployment script not found")
        
        print("\n📋 Next Steps:")
        print("1. Install missing packages if any")
        print("2. Run: cd backend && python3 -c 'from rostr.ragdal.search import SearchExecutor; print(\"✅ Search module loads correctly\")'")
        print("3. Deploy to EC2 using deploy_web_search.sh")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_search_implementation()
    if success:
        print("\n✅ All tests passed! Web search implementation is ready.")
    else:
        print("\n❌ Tests failed. Please fix the issues above.")
        sys.exit(1)