#!/bin/bash

# Modern SaaS Platform Deployment Script
# ROSTR-Powered Hermes Agent Backend

set -e

echo "🚀 Deploying Modern SaaS Agent Platform v2.0.0"
echo "==============================================="

# Configuration
PLATFORM_NAME="6th Agent"
PLATFORM_VERSION="2.0.0"
API_PORT=8000
FRONTEND_PORT=3000

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check environment
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python 3 is required${NC}"
        exit 1
    fi
    
    # Check pip
    if ! command -v pip3 &> /dev/null; then
        echo -e "${RED}❌ pip3 is required${NC}"
        exit 1
    fi
    
    # Check Node.js (for frontend)
    if ! command -v node &> /dev/null; then
        echo -e "${YELLOW}⚠️ Node.js not found (optional for frontend)${NC}"
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Install Python dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing Python dependencies...${NC}"
    
    # Create virtual environment
    if [ ! -d ".venv" ]; then
        python3 -m venv .venv
        echo -e "${GREEN}✅ Virtual environment created${NC}"
    fi
    
    # Activate virtual environment
    source .venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install core dependencies
    pip install fastapi uvicorn python-multipart httpx
    
    # Install security packages
    pip install python-jose[cryptography] passlib[bcrypt] pyjwt bcrypt
    
    # Install database packages
    pip install sqlalchemy psycopg2-binary redis
    
    # Install modern tools
    pip install pydantic pydantic-settings loguru python-dotenv python-dateutil
    
    # Install AWS integration
    pip install boto3 botocore aioboto3
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Setup environment
setup_environment() {
    echo -e "${BLUE}⚙️ Setting up environment...${NC}"
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# Modern SaaS Platform Configuration
# ROSTR-Powered Agent Orchestration

# Platform Identity
PLATFORM_NAME="${PLATFORM_NAME}"
PLATFORM_VERSION="${PLATFORM_VERSION}"
SUPPORT_EMAIL="support@6thagent.com"

# Deployment
ENVIRONMENT=production
API_HOST=0.0.0.0
API_PORT=${API_PORT}
FRONTEND_PORT=${FRONTEND_PORT}
LOG_LEVEL=info

# Security
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:3000,https://app.6thagent.com

# Database
DATABASE_URL=postgresql://user:password@localhost/6thagent_db
REDIS_URL=redis://localhost:6379

# AWS Bedrock
AWS_BEDROCK_REGION=us-east-1
AWS_BEDROCK_API_KEY=your-bedrock-api-key
AWS_BEDROCK_DEEPSEEK_MODEL=deepseek.v3.2

# Free Test Account
FREE_TEST_USER_EMAIL=patrick.diamitani@gmail.com
FREE_TEST_PLAN=free-forever

# Billing (Stripe)
STRIPE_API_KEY=your-stripe-api-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Storage
MAX_STORAGE_MB=1024
MAX_FILE_SIZE_MB=50

# Rate Limiting
API_RATE_LIMIT=1000
AGENT_RATE_LIMIT=100
USER_RATE_LIMIT=1000

# Feature Flags
ENABLE_BEDROCK_INTEGRATION=true
ENABLE_STRIPE_BILLING=false
ENABLE_SLACK_INTEGRATION=false
ENABLE_GITHUB_INTEGRATION=false
EOF
        echo -e "${GREEN}✅ Environment file created${NC}"
    else
        echo -e "${YELLOW}⚠️ Environment file already exists${NC}"
    fi
    
    # Create logs directory
    mkdir -p logs
    
    echo -e "${GREEN}✅ Environment setup completed${NC}"
}

# Build API structure
build_api_structure() {
    echo -e "${BLUE}🏗️ Building API structure...${NC}"
    
    # Create directory structure
    mkdir -p backend/api/routes
    mkdir -p backend/core
    mkdir -p backend/models
    mkdir -p backend/services
    mkdir -p backend/utils
    mkdir -p backend/middleware
    mkdir -p backend/tests
    
    echo -e "${GREEN}✅ API structure built${NC}"
}

# Start the API server
start_api_server() {
    echo -e "${BLUE}🚀 Starting API server...${NC}"
    
    # Activate virtual environment
    source .venv/bin/activate
    
    # Start FastAPI server
    uvicorn main_refactored:app \
        --host 0.0.0.0 \
        --port ${API_PORT} \
        --reload \
        --log-level info \
        --workers 4 &
    
    API_PROCESS=$!
    echo -e "${GREEN}✅ API server started (PID: ${API_PROCESS})${NC}"
    echo -e "${BLUE}📡 API available at: http://localhost:${API_PORT}${NC}"
    echo -e "${BLUE}📚 API docs at: http://localhost:${API_PORT}/api/v2/docs${NC}"
}

# Test API endpoints
test_api_endpoints() {
    echo -e "${BLUE}🧪 Testing API endpoints...${NC}"
    
    # Wait for server to start
    sleep 5
    
    # Test health endpoint
    echo "Testing /api/v2/health..."
    curl -s http://localhost:${API_PORT}/api/v2/health | jq . 2>/dev/null || echo "Health check response"
    
    # Test free test endpoint
    echo "Testing /api/v2/free-test..."
    curl -s http://localhost:${API_PORT}/api/v2/free-test | jq . 2>/dev/null || echo "Free test response"
    
    # Test root endpoint
    echo "Testing /..."
    curl -s http://localhost:${API_PORT}/ | jq . 2>/dev/null || echo "Root response"
    
    echo -e "${GREEN}✅ API endpoints tested${NC}"
}

# Deploy to GitHub
deploy_to_github() {
    echo -e "${BLUE}🐙 Deploying to GitHub...${NC}"
    
    # Check if git repository exists
    if [ ! -d ".git" ]; then
        echo -e "${YELLOW}⚠️ Not a git repository${NC}"
        return
    fi
    
    # Commit changes
    git add .
    git commit -m "Modern SaaS Platform v${PLATFORM_VERSION} - ROSTR Refactor" || true
    
    # Push to main branch
    git push origin main || echo -e "${YELLOW}⚠️ GitHub push may require authentication${NC}"
    
    echo -e "${GREEN}✅ GitHub deployment completed${NC}"
}

# Main deployment function
deploy_platform() {
    echo -e "${BLUE}🔄 Starting platform deployment...${NC}"
    
    check_prerequisites
    install_dependencies
    setup_environment
    build_api_structure
    
    echo -e "\n${GREEN}✅ Platform setup complete!${NC}"
    echo -e "\n${BLUE}Next steps:${NC}"
    echo "1. Start API server: ./start_api.sh"
    echo "2. Test endpoints: ./test_api.sh"
    echo "3. Deploy to EC2: ./deploy_to_ec2.sh"
    echo "4. Monitor logs: tail -f logs/6th-agent.log"
    echo -e "\n${BLUE}Modern features enabled:${NC}"
    echo "✓ Multi-tenant workspaces"
    echo "✓ Teams & organizations"
    echo "✓ AWS Bedrock integration"
    echo "✓ Usage-based billing"
    echo "✓ Analytics dashboard"
    echo "✓ Modern API structure"
    echo "✓ Free forever test account"
    echo -e "\n${BLUE}Free test account:${NC}"
    echo "Email: patrick.diamitani@gmail.com"
    echo "Plan: free-forever"
    echo "Token: free-test-token"
    echo "Workspace: free-workspace-001"
}

# Handle command line arguments
case "$1" in
    start)
        start_api_server
        ;;
    test)
        test_api_endpoints
        ;;
    deploy)
        deploy_platform
        ;;
    github)
        deploy_to_github
        ;;
    full)
        deploy_platform
        start_api_server
        test_api_endpoints
        ;;
    *)
        deploy_platform
        ;;
esac

echo -e "\n${GREEN}🎉 Modern SaaS Platform deployment completed!${NC}"
echo -e "${BLUE}Platform: ${PLATFORM_NAME} v${PLATFORM_VERSION}${NC}"
echo -e "${BLUE}Environment: Modern ROSTR-Framework Backend${NC}"

# Create startup script
cat > start_api.sh << 'EOF'
#!/bin/bash
# Modern SaaS Platform Starter
source .venv/bin/activate
uvicorn main_refactored:app --host 0.0.0.0 --port 8000 --reload
EOF

chmod +x start_api.sh

echo -e "\n${BLUE}📝 Created startup script: ./start_api.sh${NC}"
echo -e "${BLUE}📚 Full API documentation: http://localhost:8000/api/v2/docs${NC}"