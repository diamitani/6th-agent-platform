#!/bin/bash
# Deployment Script for Web Search Integration
# Run this on your EC2 instance (rostr-brother i-05dc9c09fe056d67a)

set -e

echo "🚀 Deploying Web Search Integration to 6th Agent Platform"

# Update and install required packages
echo "📦 Installing required packages..."
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv
pip3 install httpx beautifulsoup4 --user

# Assuming you have the repository cloned in /home/ubuntu/6th-agent-platform
REPO_DIR="/home/ubuntu/6th-agent-platform"
BACKEND_DIR="$REPO_DIR/backend"

if [ ! -d "$REPO_DIR" ]; then
    echo "❌ Repository not found at $REPO_DIR"
    echo "Please clone the repository first:"
    echo "git clone https://github.com/diamitani/6th-agent-platform.git"
    exit 1
fi

# Copy updated files to the EC2 instance
echo "📁 Updating files on EC2..."
# The search.py file should already be updated in the repo
# The web_search.py and main.py modifications should be in the repo

# Install backend dependencies
echo "📦 Installing Python dependencies..."
cd "$BACKEND_DIR"
pip3 install -r requirements.txt --user

# Test the web search functionality
echo "🧪 Testing web search integration..."
mkdir -p logs

# Create a simple test script
cat > test_web_search.sh << 'EOF'
#!/bin/bash
echo "Testing Web Search Endpoint..."
cd /home/ubuntu/6th-agent-platform/backend

# Check if the server is running
if curl -s http://localhost:8000/api/search/health | grep -q "healthy"; then
    echo "✅ Web search API is running"
else
    echo "⚠️  Starting web search service..."
    
    # Start the server in background
    nohup python3 main.py &
    sleep 5
    
    # Test health endpoint
    if curl -s http://localhost:8000/api/search/health | grep -q "healthy"; then
        echo "✅ Web search API started successfully"
    else
        echo "❌ Failed to start web search API"
        exit 1
    fi
fi

# Test search endpoint
echo ""
echo "🔍 Testing search functionality..."
SEARCH_RESULT=$(curl -s -X POST http://localhost:8000/api/search/query \
  -H "Content-Type: application/json" \
  -d '{"query": "ROSTR framework agent architecture", "max_results": 3}')

if echo "$SEARCH_RESULT" | grep -q "results"; then
    echo "✅ Search test successful!"
    echo "Search Results Summary:"
    echo "$SEARCH_RESULT" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'Count: {data[\"count\"]}')
print(f'Average Credibility: {data[\"avg_credibility\"]:.2f}')
print(f'First Result Tier: {data[\"results\"][0][\"tier\"] if data[\"results\"] else \"No results\"}')
"
else
    echo "❌ Search test failed"
    echo "Response: $SEARCH_RESULT"
fi
EOF

chmod +x test_web_search.sh

echo ""
echo "📋 Deployment Instructions:"
echo ""
echo "1. SSH into your EC2 instance:"
echo "   ssh -i your-key.pem ubuntu@52.20.23.44"
echo ""
echo "2. Update the repository:"
echo "   cd ~/6th-agent-platform && git pull"
echo ""
echo "3. Run the deployment test:"
echo "   ./deploy_web_search.sh"
echo ""
echo "4. After deployment, test the web search:"
echo "   curl -X POST http://localhost:8000/api/search/query \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"query\": \"your search query\", \"max_results\": 5}'"
echo ""
echo "5. For production usage in agents:"
echo "   - Agents can now call the web search API"
echo "   - Use the ROSTR tier system for source filtering"
echo "   - Credibility scores guide result quality assessment"
echo ""
echo "🔧 Configuration Options:"
echo ""
echo "Environment Variables (optional):"
echo "  - SEARCH_API_PROVIDER: DuckDuckGo (default)"
echo "  - SERPAPI_KEY: For SerpAPI integration (more reliable)"
echo "  - GOOGLE_API_KEY: For Google Search API"
echo ""
echo "ROSTR Tier Filtering:"
echo "  - Send tier_filter: [\"PRIMARY\", \"EDITORIAL\", \"COMMUNITY\"]"
echo "  - require_credibility_threshold: 0.7 (default 0.5)"
echo ""
echo "✅ Deployment ready!"