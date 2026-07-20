# 6th Agent Platform v2.1.0

**Modern SaaS Platform for ROSTR-Powered Agent Orchestration**

A clean, minimalist, modular redesign of the 6th Agent platform with multi-tenant workspaces, usage-based billing, and AWS Bedrock integration.

---

## 🎯 Modern Features

### **Clean SaaS Dashboard**
- Simplistic, minimalist interface
- Real-time activity feed
- Key metrics at a glance
- Dark/light theme ready

### **Multi-Tenant Architecture**
- Personal & team workspaces
- Invite-based team management
- Role-based permissions (admin, member, viewer)
- Isolated agent environments

### **Usage-Based Billing**
- Free forever test account
- Pro ($49/month) & Enterprise tiers
- AWS Bedrock cost tracking
- Detailed usage analytics

### **ROSTR Framework Integration**
- Phase-aware orchestration (PreD, Design, Development, Deployment, Debugging)
- Multi-pass RAG retrieval with source credibility
- Persistent knowledge compounding
- Agent performance optimization

### **AWS Bedrock Backed**
- DeepSeek V3.2 model integration
- Claude Sonnet 4.6 support
- Cost-optimized model selection
- Usage-based billing per workspace

---

## 🚀 Quick Start

### **1. Local Development**
```bash
# Clone and setup
git clone https://github.com/diamitani/6th-agent-platform
cd 6th-agent-platform

# Make deployment scripts executable
chmod +x deploy_modern.sh test_modern_api.sh

# Deploy modern platform
./deploy_modern.sh

# Start API server
./test_modern_api.sh
```

### **2. Free Forever Test Account**
```
Email: patrick.diamitani@gmail.com
Token: free-test-token
Workspace: workspace-001
Plan: free-forever
Features:
  - Up to 5 agents
  - Basic analytics
  - Email support
  - 1GB storage
```

---

## 📊 API Endpoints

### **Core Routes**
```
GET  /                   → Platform info
GET  /api/v2/health     → System health
GET  /api/v2/dashboard → Modern dashboard
GET  /api/v2/workspaces → Multi-tenant workspaces
GET  /api/v2/agents    → Agent management
GET  /api/v2/billing   → Usage-based billing
GET  /api/v2/analytics → Performance metrics
POST /api/v2/search     → Web search integration
```

### **Authentication**
```
POST /api/v2/auth/login    → User login
POST /api/v2/auth/register → New user registration
```

### **Free Test Access**
```
GET /api/v2/free-test → Free account details
Use token: 'free-test-token'
```

---

## 🏗️ Architecture

### **Modern Structure**
```
6th-agent-platform/
├── backend/
│   ├── modern_api.py           # Clean SaaS API
│   ├── api/routes/            # Modular routes
│   │   ├── auth.py           # Authentication
│   │   ├── users.py          # User management
│   │   ├── workspaces.py     # Multi-tenant workspaces
│   │   ├── billing.py        # Usage-based billing
│   │   └── analytics.py      # Performance analytics
│   └── requirements-modular.txt
├── deploy_modern.sh          # Modern deployment
├── test_modern_api.sh        # API testing
└── README_modern.md         # This file
```

### **Key Components**
1. **ROSTR Framework** - Phase-aware orchestration
2. **Multi-Tenant Workspaces** - Isolated agent environments
3. **Usage-Based Billing** - AWS cost tracking
4. **Clean Dashboard** - Modern SaaS interface
5. **Free Forever Account** - Test account for platform development

---

## 🔧 Deployment

### **To EC2 Instance**
```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@52.20.23.44

# Clone repository
git clone https://github.com/diamitani/6th-agent-platform
cd 6th-agent-platform

# Install Python dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn python-multipart

# Start server
uvicorn modern_api:app --host 0.0.0.0 --port 8000 --reload
```

### **Nginx Configuration** (optional)
```nginx
server {
    listen 80;
    server_name 6thagent.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📈 Analytics & Monitoring

### **Dashboard Metrics**
- Agent performance (success rate, avg time)
- Cost per task ($0.0103 average)
- API usage & rate limiting
- Storage utilization (125MB/1024MB)

### **Cost Breakdown**
- **AWS Bedrock**: 96.7% ($12.47/month)
- **Storage**: 3.3% ($0.42/month)
- **Total**: $12.89/month

### **Agent Performance**
1. **Research Agent** (847 tasks, 99.2% success, $8.47)
2. **Builder Agent** (400 tasks, 97.5% success, $4.42)

---

## 💳 Billing Plans

### **Free Forever**
- $0/month (patrick.diamitani@gmail.com)
- Up to 5 agents
- 1GB storage
- Basic analytics

### **Pro** ($49/month)
- Unlimited agents
- 10GB storage
- Advanced analytics
- Team workspaces
- Priority support

### **Enterprise** (Contact)
- Unlimited everything
- 24/7 support
- SLA guarantee
- Custom development

---

## 🔐 Security

### **Features**
- JWT token authentication
- Role-based access control
- API key rotation
- Session management
- Two-factor authentication (optional)

### **Permissions**
- **Admin**: Full workspace access
- **Member**: Agent creation & task execution
- **Viewer**: Read-only access

---

## 🛠️ Development

### **Setup Environment**
```bash
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements-modular.txt

# Run development server
uvicorn modern_api:app --reload
```

### **Testing**
```bash
# Test API endpoints
./test_modern_api.sh

# Manually test endpoints
curl -H "Authorization: Bearer free-test-token" http://localhost:8000/api/v2/dashboard
```

---

## 🔗 Integrations

### **AWS Bedrock**
- DeepSeek V3.2 model
- Claude Sonnet 4.6
- Usage tracking per workspace
- Cost optimization

### **Rostr Framework**
- Phase-aware orchestration
- Multi-pass RAG retrieval
- Persistent knowledge base
- Agent performance optimization

### **Web Search**
- Integrated search API
- Result ranking & filtering
- Cost tracking per search

---

## 📱 User Experience

### **Modern Dashboard**
- Clean, minimalist design
- Real-time activity feed
- Quick metrics overview
- Dark/light theme support

### **Workspace Management**
- Easy team invitations
- Role-based permissions
- Agent performance tracking
- Cost monitoring

### **Agent Creation**
- Simple agent configuration
- Model selection (DeepSeek/Claude)
- Tool enablement (web search, code execution)
- Performance monitoring

---

## 🚀 Deployment Scripts

### **deploy_modern.sh**
```bash
./deploy_modern.sh          # Deploy platform
./deploy_modern.sh start   # Start API server
./deploy_modern.sh test    # Test API endpoints
./deploy_modern.sh github  # Deploy to GitHub
./deploy_modern.sh full    # Full deployment pipeline
```

### **test_modern_api.sh**
```bash
./test_modern_api.sh       # Test all API endpoints
# Also starts server if not running
```

---

## 📄 Documentation

- **API Docs**: http://localhost:8000/api/v2/docs
- **Redoc**: http://localhost:8000/api/v2/redoc
- **OpenAPI**: http://localhost:8000/api/v2/openapi.json

---

## 🆓 Free Test Account

### **For Platform Development**
```
Email: patrick.diamitani@gmail.com
Token: free-test-token
Workspace: workspace-001
Plan: free-forever
Status: Active
Usage: Unlimited for testing
```

### **Terms**
- Account is free forever for testing and development
- Includes all basic platform features
- Usage tracked for platform improvement
- No credit card required

---

## 🔄 Updates & Maintenance

### **Recent Changes**
1. **v2.1.0**: Modern SaaS redesign
   - Clean dashboard interface
   - Multi-tenant workspaces
   - Usage-based billing
   - RESTful API structure

2. **v2.0.0**: ROSTR integration
   - Phase-aware orchestration
   - Multi-pass RAG retrieval
   - Persistent knowledge base

### **Future Roadmap**
- [ ] Team collaboration features
- [ ] Advanced billing dashboard
- [ ] Mobile application
- [ ] Slack/Discord integration
- [ ] Advanced agent analytics

---

## 📞 Support

- **Email**: patrick.diamitani@gmail.com
- **Technical Issues**: GitHub Issues
- **Billing Questions**: support@6thagent.com
- **Priority Support**: Pro & Enterprise plans

---

## 📜 License

Proprietary platform for agent orchestration.
Free test account for platform development.

© 2026 Patrick Diamitani | 6th Agent Platform

---

## 🎯 Summary

**6th Agent Platform v2.1.0** transforms the messy backend into a clean, modern SaaS platform with:

✅ **Clean Dashboard** - Simple, minimalist interface  
✅ **Multi-Tenant Workspaces** - Personal & team environments  
✅ **Usage-Based Billing** - AWS cost tracking  
✅ **ROSTR Framework** - Phase-aware orchestration  
✅ **AWS Bedrock** - DeepSeek & Claude integration  
✅ **Free Forever Account** - Test platform development  

Ready for deployment to EC2 or any cloud platform with scalable, modular architecture.

---

**Next Step**: Deploy to EC2 using `./deploy_modern.sh` or test locally with `./test_modern_api.sh`