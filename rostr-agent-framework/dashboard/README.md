# Rostr Dashboard

Modern web dashboard for the Rostr Agent Framework - visualize and control your agent team operating system.

## Features

### Mission Control
- Real-time overview of all agents, tasks, and knowledge
- Live stats: active agents, running tasks, completed work, knowledge entries
- PAL compilation pipeline visualization
- NPAO task queue with priority scoring
- Recent activity timeline

### Agent Management
- View all registered agents
- Monitor agent status (active/idle)
- Track agent load and capacity
- View current tasks per agent

### Task Orchestration (NPAO)
- Priority-sorted task queue
- 5D phase classification (PreD, Design, Development, Deployment, Debugging)
- Multi-dimensional priority scores
- Real-time task allocation status

### Knowledge Base
- Browse RAG DAL knowledge entries
- Search across all namespaces (project, org, team, global)
- Source credibility tiers
- Confidence scores per entry

### Analytics
- Agent performance metrics
- Task completion trends
- Knowledge growth curves
- Cost tracking

## Tech Stack

- **Framework:** Next.js 15 (React Server Components)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Icons:** Lucide React
- **Charts:** Recharts
- **Backend:** FastAPI (Python) - proxied through Next.js
- **Real-time:** WebSocket connections for live updates

## Getting Started

### Prerequisites

```bash
node >= 18
npm or yarn
```

### Installation

```bash
cd dashboard
npm install
```

### Development

```bash
# Start the dashboard (connects to backend at localhost:8000)
npm run dev

# Open browser at http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

## Architecture

```
┌─────────────────────────────────────────────┐
│          Next.js Dashboard (Port 3000)       │
│                                             │
│  Mission Control │ Agents │ Tasks │ KB     │
└──────────────┬──────────────────────────────┘
               │
               ▼
       API Proxy (/api/*)
               │
               ▼
┌──────────────────────────────────────────────┐
│      FastAPI Backend (Port 8000)             │
│                                              │
│  Rostr Hub │ PAL │ RAG DAL │ NPAO           │
└──────────────────────────────────────────────┘
```

## Dashboard Pages

### `/` - Mission Control
Real-time overview of entire system:
- Stats cards (agents, tasks, knowledge)
- PAL pipeline status
- Active agents
- Task queue
- Recent activity

### `/agents` - Agent Registry
- All registered agents
- Capabilities and tools
- Phase specializations
- Performance stats

### `/tasks` - NPAO Task Board
- Priority-sorted queue
- Phase classification
- Allocation status
- Dependency visualization

### `/knowledge` - Knowledge Base
- Browse all entries
- Filter by namespace, tier, confidence
- Search with vector similarity
- Source provenance

### `/analytics` - Analytics Dashboard
- Agent utilization over time
- Task completion rates
- Knowledge growth
- Cost per task

### `/pal` - PAL Compiler
- Submit raw intent
- Watch compilation pipeline
- View enhanced prompts
- See routing decisions

### `/ragdal` - RAG DAL Explorer
- Submit research queries
- Watch multi-pass retrieval
- See source tier distribution
- View confidence scores

## Components

### Panels
- `StatsCards` - Key metrics overview
- `PALPipeline` - Real-time PAL compilation stages
- `AgentStatusPanel` - Live agent monitoring
- `TaskQueuePanel` - NPAO-sorted tasks
- `RecentActivityPanel` - Timeline of events

### UI Components (shadcn/ui)
All components in `components/ui/` are from shadcn/ui for consistent design system.

## API Integration

Dashboard connects to Rostr backend via API proxy:

```typescript
// Example: Fetch agents
const response = await fetch('/api/agents')
const agents = await response.json()

// Example: Submit task via PAL
const response = await fetch('/api/pal/compile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: "Research competitor pricing" })
})
```

## Environment Variables

Create `.env.local`:

```bash
# Backend API URL (default: http://localhost:8000)
NEXT_PUBLIC_API_URL=http://localhost:8000

# WebSocket URL for real-time updates
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Enable analytics
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

## Real-Time Updates

Dashboard uses WebSockets for live updates:

```typescript
// components/useRealtimeUpdates.ts
const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL)

ws.onmessage = (event) => {
  const update = JSON.parse(event.data)
  
  switch (update.type) {
    case 'agent_status_changed':
      updateAgentStatus(update.data)
      break
    case 'task_completed':
      refreshTaskQueue()
      break
    case 'knowledge_added':
      updateKnowledgeCount()
      break
  }
}
```

## Theming

Dashboard supports light and dark modes via Tailwind CSS dark mode.

Toggle theme:
```typescript
// components/ThemeToggle.tsx
const toggleTheme = () => {
  document.documentElement.classList.toggle('dark')
}
```

## Performance

- **Server Components** - Zero JavaScript for static content
- **Code Splitting** - Each route loads only what it needs
- **Image Optimization** - Next.js automatic image optimization
- **Caching** - API responses cached when appropriate

## Contributing

Dashboard uses:
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting

```bash
npm run lint
npm run format
```

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

```bash
docker build -t rostr-dashboard .
docker run -p 3000:3000 rostr-dashboard
```

### Static Export

```bash
npm run build
npm run export
# Deploy /out directory to any static host
```

## Screenshots

### Mission Control
![Mission Control](docs/screenshots/mission-control.png)

### Task Board
![Task Board](docs/screenshots/task-board.png)

### Agent Registry
![Agents](docs/screenshots/agents.png)

## License

MIT - Same as Rostr Agent Framework

## Links

- [Rostr Framework](../README.md)
- [Documentation](../docs/)
- [API Reference](../docs/api-reference.md)
