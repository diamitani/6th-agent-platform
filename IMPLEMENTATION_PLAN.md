# 6th Agent - Implementation Plan
**Enhanced Version: ROSTR + 6thAgent MVP + Assistant Builder Copilot**

---

## What Needs to Be Built

Based on the PDFs, here's what we need to add to the existing ROSTR implementation:

---

## Phase 1: CLI Tool (Days 1-2)

### Goal
Create `6th` CLI that can generate assistant projects locally

### Implementation

**File:** `cli/index.js` (Node.js)

```javascript
#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

program
  .name('6th')
  .description('6th Agent - AI copilot for building AI copilots')
  .version('1.0.0');

// 6th create <name>
program
  .command('create <name>')
  .option('-d, --description <desc>', 'Agent description')
  .option('-m, --model <model>', 'AI model', 'ollama/deepseek-r1:7b')
  .action(async (name, options) => {
    console.log(`🚀 Creating agent: ${name}`);
    
    // 1. Call PAL to compile intent
    const pal = await compilePAL(options.description);
    
    // 2. Generate JTBD
    const jtbd = await generateJTBD(pal.intent);
    
    // 3. Generate system instructions
    const systemInstructions = await generateSystemInstructions(jtbd);
    
    // 4. Generate function schemas
    const functions = await generateFunctionSchemas(pal.tools);
    
    // 5. Create project directory
    await createProjectStructure(name, {
      pal,
      jtbd,
      systemInstructions,
      functions
    });
    
    console.log(`✅ Agent created: 6th_projects/${name}`);
  });

// 6th add-knowledge <file>
program
  .command('add-knowledge <file>')
  .action(async (file) => {
    console.log(`📚 Ingesting knowledge: ${file}`);
    // Call RAG DAL to process and embed file
    await ingestKnowledge(file);
    console.log(`✅ Knowledge added`);
  });

// 6th generate-ui
program
  .command('generate-ui')
  .option('-t, --template <type>', 'UI template', 'chat')
  .option('--theme <theme>', 'Color theme', 'professional')
  .action(async (options) => {
    console.log(`🎨 Generating UI...`);
    // Call v0.dev API
    const ui = await generateV0UI(options);
    console.log(`✅ UI generated: frontend/`);
  });

// 6th deploy
program
  .command('deploy')
  .option('-p, --platform <platform>', 'Deploy platform', 'vercel')
  .action(async (options) => {
    console.log(`🚀 Deploying to ${options.platform}...`);
    
    // 1. Bundle project
    await bundleProject();
    
    // 2. Push to GitHub
    await pushToGitHub();
    
    // 3. Deploy to Vercel
    const url = await deployToVercel();
    
    console.log(`✅ Deployed!`);
    console.log(`🌐 Live URL: ${url}`);
  });

program.parse();
```

**Key Functions:**

```javascript
// backend/cli/pal-compiler.js
async function compilePAL(description) {
  const response = await fetch('http://localhost:8000/api/pal/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description })
  });
  
  return response.json();
}

// backend/cli/jtbd-generator.js
async function generateJTBD(intent) {
  // Call DeepSeek/OpenAI to generate JTBD framework
  const prompt = `
    Given this agent intent: ${intent.primary_intent}
    Domain: ${intent.domain}
    
    Generate a Jobs-to-be-Done framework:
    1. Functional job (what it does)
    2. Emotional job (how users feel)
    3. Social job (how users look)
    4. Success criteria (measurable)
    5. Failure modes (what not to do)
  `;
  
  const jtbd = await callLLM(prompt);
  return jtbd;
}

// backend/cli/system-instructions.js
async function generateSystemInstructions(jtbd) {
  // Generate 8-part system instructions
  const template = `
    # System Instructions
    
    ## 1. Primary Instruction
    ${jtbd.functional_job}
    
    ## 2. Role Definition
    You are an AI ${jtbd.role}...
    
    ## 3. Core Responsibilities
    - ${jtbd.success_criteria[0]}
    - ${jtbd.success_criteria[1]}
    ...
    
    ## 4. Operational Rules
    - Never: ${jtbd.failure_modes[0]}
    - Always: ${jtbd.constraints[0]}
    ...
    
    ## 5. Reasoning & Decision Logic
    ...
    
    ## 6. Output Formatting Rules
    ...
    
    ## 7. Examples
    ...
    
    ## 8. Edge Cases & Constraints
    ...
  `;
  
  return template;
}
```

---

## Phase 2: v0.dev Integration (Day 4)

### Goal
Generate React + Tailwind frontends via v0.dev API

### Implementation

**File:** `backend/integrations/v0_dev.py`

```python
import httpx
import os

class V0DevClient:
    """Client for v0.dev frontend generation API"""
    
    def __init__(self):
        self.api_key = os.getenv("V0_DEV_API_KEY")
        self.base_url = "https://api.v0.dev/generate"
        
    async def generate_ui(
        self,
        description: str,
        template: str = "chat",
        theme: str = "professional"
    ) -> dict:
        """Generate UI from description"""
        
        # Build v0.dev prompt
        prompt = self._build_prompt(description, template, theme)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.base_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "prompt": prompt,
                    "framework": "react",
                    "styling": "tailwind",
                    "typescript": True
                },
                timeout=60.0
            )
            
            response.raise_for_status()
            return response.json()
    
    def _build_prompt(self, description, template, theme):
        """Build v0.dev prompt from agent description"""
        
        templates = {
            "chat": f"""
                Create a professional chat interface for: {description}
                
                Features:
                - Message list with user/assistant messages
                - Input field with send button
                - File upload button
                - Typing indicator
                - Message history scrollable
                - Responsive design
                
                Style:
                - Tailwind CSS
                - {theme} color scheme
                - Modern, clean UI
                - shadcn/ui components
                
                Return: Full Next.js 15 app with App Router
            """,
            
            "dashboard": f"""
                Create an admin dashboard for: {description}
                
                Features:
                - Sidebar navigation
                - Stats cards
                - Data tables
                - Charts (usage, performance)
                - Settings panel
                
                Style: {theme} theme, Tailwind CSS
            """,
            
            "form": f"""
                Create a form-based interface for: {description}
                
                Features:
                - Multi-step form wizard
                - Validation
                - Progress indicator
                - Submit to API
                
                Style: {theme} theme, Tailwind CSS
            """
        }
        
        return templates.get(template, templates["chat"])
    
    async def save_generated_code(self, code: dict, output_dir: str):
        """Save generated code to project directory"""
        import os
        import json
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Save each file
        for file in code.get("files", []):
            file_path = os.path.join(output_dir, file["path"])
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, "w") as f:
                f.write(file["content"])
        
        # Save package.json
        with open(os.path.join(output_dir, "package.json"), "w") as f:
            json.dump(code.get("package_json", {}), f, indent=2)
```

---

## Phase 3: Vercel Deployment (Day 5)

### Goal
One-click deployment to Vercel with live URL

### Implementation

**File:** `backend/deployment/vercel.py`

```python
import httpx
import os
import subprocess

class VercelDeployer:
    """Deploy projects to Vercel"""
    
    def __init__(self):
        self.api_token = os.getenv("VERCEL_API_TOKEN")
        self.team_id = os.getenv("VERCEL_TEAM_ID")
        
    async def deploy(self, project_path: str, project_name: str) -> str:
        """Deploy project to Vercel and return live URL"""
        
        # 1. Create vercel.json config
        await self._create_vercel_config(project_path)
        
        # 2. Push to GitHub first
        repo_url = await self._push_to_github(project_path, project_name)
        
        # 3. Deploy via Vercel CLI
        url = await self._deploy_via_cli(project_path, project_name)
        
        return url
    
    async def _create_vercel_config(self, project_path: str):
        """Generate vercel.json configuration"""
        import json
        
        config = {
            "version": 2,
            "builds": [
                {
                    "src": "frontend/package.json",
                    "use": "@vercel/next"
                },
                {
                    "src": "backend/main.py",
                    "use": "@vercel/python"
                }
            ],
            "routes": [
                {
                    "src": "/api/(.*)",
                    "dest": "backend/main.py"
                },
                {
                    "src": "/(.*)",
                    "dest": "frontend/$1"
                }
            ],
            "env": {
                "OLLAMA_HOST": "@ollama_host",
                "DATABASE_URL": "@database_url"
            }
        }
        
        with open(f"{project_path}/vercel.json", "w") as f:
            json.dump(config, f, indent=2)
    
    async def _push_to_github(self, project_path: str, project_name: str) -> str:
        """Push project to GitHub"""
        
        # Initialize git repo
        subprocess.run(["git", "init"], cwd=project_path)
        subprocess.run(["git", "add", "."], cwd=project_path)
        subprocess.run([
            "git", "commit", "-m",
            f"6th Agent: {project_name} deployment"
        ], cwd=project_path)
        
        # Create GitHub repo via API
        github_token = os.getenv("GITHUB_TOKEN")
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.github.com/user/repos",
                headers={
                    "Authorization": f"Bearer {github_token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                json={
                    "name": project_name,
                    "private": False,
                    "description": f"6th Agent: {project_name}"
                }
            )
            
            repo_url = response.json()["clone_url"]
        
        # Push to GitHub
        subprocess.run([
            "git", "remote", "add", "origin", repo_url
        ], cwd=project_path)
        subprocess.run([
            "git", "push", "-u", "origin", "main"
        ], cwd=project_path)
        
        return repo_url
    
    async def _deploy_via_cli(self, project_path: str, project_name: str) -> str:
        """Deploy using Vercel CLI"""
        
        # Run vercel deploy --prod
        result = subprocess.run(
            ["vercel", "deploy", "--prod", "--yes", "--token", self.api_token],
            cwd=project_path,
            capture_output=True,
            text=True
        )
        
        # Extract URL from output
        output = result.stdout
        url = output.split("Production: ")[-1].strip()
        
        return url
```

---

## Phase 4: Web Wizard (Day 6)

### Goal
Beautiful Next.js wizard for non-CLI users

### Implementation

**File:** `frontend/app/wizard/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

export default function AgentWizard() {
  const [step, setStep] = useState(1);
  const [agentData, setAgentData] = useState({
    name: '',
    description: '',
    model: 'ollama/deepseek-r1:7b',
    template: 'chat',
    knowledgeFiles: []
  });

  const steps = [
    { num: 1, title: 'Describe', desc: 'Define your agent' },
    { num: 2, title: 'Integrate', desc: 'Choose AI model' },
    { num: 3, title: 'Design', desc: 'Pick UI template' },
    { num: 4, title: 'Knowledge', desc: 'Upload files (optional)' },
    { num: 5, title: 'Deploy', desc: 'Push to production' }
  ];

  const handleNext = async () => {
    if (step === 1) {
      // Call PAL to compile description
      const response = await fetch('/api/pal/compile', {
        method: 'POST',
        body: JSON.stringify({ description: agentData.description })
      });
      const compiled = await response.json();
      setAgentData(prev => ({ ...prev, compiled }));
    }
    
    if (step === 3) {
      // Generate UI via v0.dev
      const response = await fetch('/api/v0dev/generate', {
        method: 'POST',
        body: JSON.stringify({
          description: agentData.description,
          template: agentData.template
        })
      });
      const ui = await response.json();
      setAgentData(prev => ({ ...prev, ui }));
    }
    
    if (step === 5) {
      // Deploy to Vercel
      const response = await fetch('/api/deploy', {
        method: 'POST',
        body: JSON.stringify(agentData)
      });
      const { url } = await response.json();
      window.open(url, '_blank');
    }
    
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <Progress value={(step / 5) * 100} className="mb-4" />
          <div className="flex justify-between">
            {steps.map(s => (
              <div
                key={s.num}
                className={`text-center ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <div className="font-bold">{s.title}</div>
                <div className="text-sm">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-bold mb-4">Describe Your Agent</h2>
              <p className="text-gray-600 mb-6">
                In plain English, what should your AI agent do?
              </p>
              <Input
                placeholder="Example: I need an AI that drafts personalized cold emails for B2B SaaS prospects"
                value={agentData.description}
                onChange={(e) => setAgentData({ ...agentData, description: e.target.value })}
                className="mb-4 text-lg p-6"
              />
              <Input
                placeholder="Agent name (e.g., sales-agent)"
                value={agentData.name}
                onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
                className="text-lg p-6"
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-3xl font-bold mb-4">Choose AI Model</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  className={`p-6 border-2 rounded-lg ${
                    agentData.model.includes('ollama') ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  onClick={() => setAgentData({ ...agentData, model: 'ollama/deepseek-r1:7b' })}
                >
                  <h3 className="font-bold mb-2">Local (Ollama)</h3>
                  <p className="text-sm text-gray-600">100% free, privacy-focused</p>
                </button>
                <button
                  className={`p-6 border-2 rounded-lg ${
                    agentData.model.includes('openai') ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  onClick={() => setAgentData({ ...agentData, model: 'openai/gpt-4' })}
                >
                  <h3 className="font-bold mb-2">OpenAI (BYOK)</h3>
                  <p className="text-sm text-gray-600">Bring your own API key</p>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-3xl font-bold mb-4">Pick UI Template</h2>
              {/* Template gallery */}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-3xl font-bold mb-4">Add Knowledge (Optional)</h2>
              {/* File upload */}
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-3xl font-bold mb-4">Deploy</h2>
              <Button onClick={handleNext} className="w-full py-6 text-lg">
                🚀 Deploy to Vercel
              </Button>
            </div>
          )}

          {step < 5 && (
            <Button onClick={handleNext} className="w-full mt-6 py-6 text-lg">
              Continue →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Summary: What to Build Next

### Priority 1 (Core MVP)
1. ✅ **PAL Compiler** (Done)
2. ✅ **ROSTR Hub** (Done)
3. ✅ **Ollama Integration** (Done)
4. 🔨 **CLI Tool** (`6th create`, `6th deploy`)
5. 🔨 **v0.dev Integration**
6. 🔨 **Vercel Deployment**
7. 🔨 **JTBD Generator**
8. 🔨 **Function Schema Generator**

### Priority 2 (Polish)
1. 🔨 **Web Wizard** (Next.js)
2. 🔨 **Landing Page** + Waitlist
3. 🔨 **Demo Videos**
4. 🔨 **Documentation**

### Priority 3 (Growth)
1. 🔨 **Multi-Model Support** (OpenAI, Bedrock, Gemini BYOK)
2. 🔨 **Template Marketplace**
3. 🔨 **Analytics Dashboard**
4. 🔨 **Team Features**

---

**Next Step:** Start with the CLI tool (Node.js + oclif)
