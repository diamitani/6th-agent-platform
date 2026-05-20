#!/bin/bash

# 6th Agent Quickstart Script
# This script helps you get 6th Agent running quickly

set -e

echo "════════════════════════════════════════════════════════════════"
echo "  🚀 6th Agent - ROSTR-Powered Agent Platform"
echo "  Quickstart Installation Script"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."
echo ""

# Check Python
if command -v python3.11 &> /dev/null; then
    echo "✅ Python 3.11+ found: $(python3.11 --version)"
else
    echo "❌ Python 3.11+ not found. Please install from https://python.org"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 20 ]; then
        echo "✅ Node.js 20+ found: v$(node --version)"
    else
        echo "❌ Node.js 20+ required. Current: $(node --version)"
        exit 1
    fi
else
    echo "❌ Node.js not found. Please install from https://nodejs.org"
    exit 1
fi

# Check Ollama
if command -v ollama &> /dev/null; then
    echo "✅ Ollama found: $(ollama --version 2>&1 | head -1)"
else
    echo "❌ Ollama not found. Installing..."
    curl https://ollama.ai/install.sh | sh
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📦 Installing Ollama Models"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Pull models if not already present
if ! ollama list | grep -q "deepseek-r1:7b"; then
    echo "⬇️  Pulling deepseek-r1:7b (Fast model ~4.7GB)..."
    ollama pull deepseek-r1:7b
else
    echo "✅ deepseek-r1:7b already installed"
fi

if ! ollama list | grep -q "nomic-embed-text"; then
    echo "⬇️  Pulling nomic-embed-text (Embeddings ~274MB)..."
    ollama pull nomic-embed-text
else
    echo "✅ nomic-embed-text already installed"
fi

echo ""
echo "Optional: deepseek-r1:32b (Reasoning model ~19GB)"
echo "To install later: ollama pull deepseek-r1:32b"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "⚙️  Setting up Backend"
echo "════════════════════════════════════════════════════════════════"
echo ""

cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3.11 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env

    # Generate JWT secret
    SECRET=$(python -c "import secrets; print(secrets.token_hex(32))")
    sed -i '' "s/your-secret-key-change-this-in-production/$SECRET/" .env
fi

echo "✅ Backend setup complete"
echo ""

cd ..

echo "════════════════════════════════════════════════════════════════"
echo "🎨 Setting up Frontend (Optional)"
echo "════════════════════════════════════════════════════════════════"
echo ""

if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    cd frontend

    if [ ! -d "node_modules" ]; then
        echo "Installing Node.js dependencies..."
        npm install
    fi

    if [ ! -f ".env" ]; then
        echo "Creating frontend .env file..."
        cp .env.example .env 2>/dev/null || echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env
    fi

    echo "✅ Frontend setup complete"
    cd ..
else
    echo "⚠️  Frontend not yet implemented - skipping"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ Installation Complete!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Start Ollama (if not running):"
echo "   ollama serve"
echo ""
echo "2. Start the backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn main:app --reload --port 8000"
echo ""
echo "3. Test the API:"
echo "   curl http://localhost:8000/health"
echo ""
echo "4. Create your first agent:"
echo "   curl -X POST http://localhost:8000/api/agents/create \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"description\": \"Research agent for competitor analysis\"}'"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - GETTING_STARTED.md - Detailed setup guide"
echo "   - ARCHITECTURE.md - System architecture"
echo "   - PROJECT_SUMMARY.md - What's been built"
echo ""
echo "🌐 API Documentation (when running):"
echo "   http://localhost:8000/docs"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Happy agent building! 🚀"
echo "════════════════════════════════════════════════════════════════"
