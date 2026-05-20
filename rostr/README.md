# ROSTR: A Unified Agent Operating System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Documentation](https://img.shields.io/badge/docs-latest-brightgreen.svg)](https://rostr.dev)

> A modular agent operating system for production-grade multi-agent systems with phase-aware orchestration and persistent knowledge compounding.

## Overview

ROSTR (Runtime, Orchestration, State, Tools, Reference) addresses four fundamental challenges in multi-agent AI systems:

1. **Prompting Bottleneck** — Users lack expertise to craft precise agent instructions
2. **Retrieval Brittleness** — Agents perform shallow, single-pass information gathering without source validation
3. **Context Loss** — Agents operate statelessly, losing knowledge across sessions
4. **Naive Task Routing** — Orchestration systems route work by keyword matching rather than workflow phase

## Architecture

ROSTR provides four integrated components:

### 🧠 PAL (Prompt Abstraction Layer)
A compiler-inspired pipeline that transforms natural language intent into structured agent runtime manifests.

**Five-Stage Pipeline:**
- Intent Extraction
- Context Injection
- Semantic Enhancement
- Runtime Compilation
- Output Routing

### 📚 RAG DAL (Dynamic Acquisition Layer)
Autonomous multi-pass retrieval with hierarchical source credibility scoring.

**Key Features:**
- Three-tier source credibility (Academic/Editorial/Community)
- Multi-pass retrieval with convergence criteria
- Self-assessed coverage validation
- Persistent knowledge base with provenance tracking

### 🎯 NPAO (Navigate, Prioritize, Allocate, Orchestrate)
A decision engine for context-aware task routing.

**5D Phase Taxonomy:**
- **PreD** — Pre-Development research and feasibility
- **Design** — Architecture and specifications
- **Development** — Implementation and testing
- **Deployment** — CI/CD and monitoring
- **Debugging** — Root cause analysis and fixes

**4D Priority Scoring:**
```
Priority = (Phase Urgency × 0.35) + 
           (Dependency Impact × 0.30) + 
           (Business Impact × 0.25) + 
           (Resource Efficiency × 0.10)
```

### 🏢 Rostr Hub (Agent Operating System)
Persistent multi-namespace knowledge platform.

**Core Services:**
- Agent Registry (capability-based discovery)
- Reference Hub (multi-namespace knowledge)
- State Management (session/project/org/agent)
- Message Bus (sync/async communication)

## Quick Start

### Installation

```bash
pip install rostr
```

### Basic Usage

```python
from rostr import Hub, Agent, PAL, NPAO

# Initialize
hub = Hub.initialize()
project = hub.create_project("my-project")

# Register an agent
agent = Agent.register(
    name="research-agent",
    type="researcher",
    capabilities=["web_search", "data_analysis"],
    phases=["PreD"],
    model="claude-sonnet-4-6"
)

# Compile natural language to agent manifest
manifest = PAL.compile(
    intent="Research competitor pricing models",
    project_id=project.id
)

# Route and execute
result = NPAO.execute(manifest)
print(result.output)
```

## Examples

### GTM Account Research Agent

```python
from rostr import RAGDAL

# Configure RAG DAL for research
ragdal = RAGDAL(
    confidence_threshold=0.8,
    tier_weights={"tier1": 1.0, "tier2": 0.75, "tier3": 0.40}
)

# Multi-pass retrieval
report = ragdal.retrieve("Latest pricing for CompetitorX")
print(f"Confidence: {report.confidence}")
print(f"Sources: {len(report.sources)}")
```

See [`/examples`](./examples) for complete implementations.

## Documentation

- 📖 [Full Documentation](https://rostr.dev)
- 📄 [Research Paper](./docs/paper/ROSTR_Research_Paper.md)
- 🚀 [Quickstart Guide](./docs/guides/quickstart.md)
- 🏗️ [Architecture Overview](./docs/guides/architecture.md)
- 📚 [API Reference](./docs/api/)

## Key Innovations

1. **5D Phase Taxonomy with PreD** — Formalizes pre-development research as a first-class workflow stage
2. **Hierarchical Credibility for RAG** — Three-tier source stratification with explicit credibility weights
3. **Multi-Dimensional Priority Scoring** — Context-aware task routing beyond simple FIFO
4. **Persistent Multi-Namespace Knowledge** — Organizational knowledge compounding across sessions and agents

## Comparison to Existing Frameworks

| Framework | Compilation | Credibility-Weighted RAG | Phase Taxonomy | Persistent State | Open Source |
|-----------|-------------|-------------------------|----------------|------------------|-------------|
| LangChain | Templates | Standard RAG | Manual chains | Session-level | ✅ |
| CrewAI | Role definitions | External | Role-based | Limited | ✅ |
| AutoGPT | Self-generated | No credibility control | None | None | ✅ |
| **ROSTR** | **5-stage PAL** | **3-tier multi-pass** | **5D + 4D scoring** | **4-level hierarchy** | **✅** |

## Research

This framework is based on the research paper:

**"ROSTR: A Unified Architecture for Production-Grade Multi-Agent Systems with Phase-Aware Orchestration and Persistent Knowledge Compounding"**  
Patrick Diamitani, April 2026

[Download Paper (PDF)](./docs/paper/ROSTR_Research_Paper.md)

### Citation

```bibtex
@article{diamitani2026rostr,
  title={ROSTR: A Unified Architecture for Production-Grade Multi-Agent Systems with Phase-Aware Orchestration and Persistent Knowledge Compounding},
  author={Diamitani, Patrick},
  journal={arXiv preprint arXiv:2026.XXXXX},
  year={2026}
}
```

## Roadmap

### Short-term (3-6 months)
- ✅ Core framework implementation
- 🚧 Empirical validation suite
- 🚧 Production GTM agent reference implementation
- 📅 Performance optimization (latency, caching)
- 📅 Comprehensive documentation and tutorials

### Medium-term (6-12 months)
- Agent marketplace (community registry)
- Multi-channel deployment (Slack, Teams, Discord)
- Advanced analytics dashboard
- Enterprise features (RBAC, audit logs, SSO)

### Long-term (12-24 months)
- Autonomous phase transitions (ML-based)
- Dynamic priority weight learning
- Meta-learning for PAL enhancement
- Federated knowledge bases

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
git clone https://github.com/yourusername/rostr.git
cd rostr
pip install -e ".[dev]"
pytest
```

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Community

- 🌐 [Website](https://rostr.dev)
- 💬 [Discussions](https://github.com/yourusername/rostr/discussions)
- 🐛 [Issues](https://github.com/yourusername/rostr/issues)
- 📧 Contact: patrick@diamitani.com

## Acknowledgments

Built with inspiration from:
- LangChain for modular agent construction
- DSPy for compilation paradigm
- STORM for multi-perspective retrieval
- Temporal for workflow orchestration patterns

---

**Made with ❤️ for the AI research community**
