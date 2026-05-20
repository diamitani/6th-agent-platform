# Contributing to Rostr

Thank you for your interest in contributing to Rostr! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional. We're building infrastructure for the AI community.

## How to Contribute

### 1. Areas Where We Need Help

#### High Priority
- **Domain PAL Templates** - Enhancement templates for specific domains (sales, legal, engineering)
- **Custom Agents** - Pre-built agents for common use cases
- **RAG Connectors** - Integrations with academic databases, APIs, data sources
- **Documentation** - Tutorials, guides, examples

#### Medium Priority
- **NPAO Improvements** - Better priority models, allocation algorithms
- **Testing** - Unit tests, integration tests, performance tests
- **Bug Fixes** - Check [Issues](https://github.com/rostr-ai/rostr/issues)

#### Future
- **Dashboard UI** - Web interface for monitoring and control
- **Agent Marketplace** - Community registry of agents
- **Cloud Deployment** - Guides for AWS, GCP, Azure

### 2. Development Setup

```bash
# Clone the repository
git clone https://github.com/rostr-ai/rostr.git
cd rostr

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install in development mode
pip install -e ".[dev]"

# Install pre-commit hooks
pre-commit install
```

### 3. Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=rostr --cov-report=html

# Run specific test file
pytest tests/test_pal.py
```

### 4. Code Style

We use:
- **Black** for code formatting (line length: 100)
- **Ruff** for linting
- **MyPy** for type checking

```bash
# Format code
black rostr/ tests/

# Lint
ruff check rostr/ tests/

# Type check
mypy rostr/
```

### 5. Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/my-feature`
3. **Make your changes**
4. **Add tests** for new functionality
5. **Run tests and linting**: `pytest && black . && ruff check .`
6. **Commit with clear messages**: `git commit -m "Add: feature description"`
7. **Push to your fork**: `git push origin feature/my-feature`
8. **Open a Pull Request**

#### PR Guidelines
- Clear title and description
- Reference related issues
- Include tests for new features
- Update documentation
- Keep PRs focused (one feature/fix per PR)

### 6. Commit Message Format

```
Type: Brief description (50 chars or less)

More detailed explanation if needed (wrap at 72 chars).

Closes #123
```

**Types:**
- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Changes to existing feature
- `Docs:` Documentation changes
- `Test:` Adding or updating tests
- `Refactor:` Code restructuring
- `Chore:` Maintenance tasks

### 7. Creating a Custom Agent

```python
# rostr/agents/my_agent.py

import uuid
from rostr.agents.base import BaseAgent
from rostr.npao.phases import Phase


class MyAgent(BaseAgent):
    """Description of what this agent does"""

    def __init__(self, name: str = "my-agent", model: str = "claude-sonnet-4-6"):
        super().__init__(
            agent_id=str(uuid.uuid4()),
            name=name,
            agent_type="my_agent_type",
            capabilities=[
                "capability_1",
                "capability_2"
            ],
            tools=[
                "tool_1",
                "tool_2"
            ],
            phases=[
                Phase.DEVELOPMENT  # Which phases this agent handles
            ],
            model=model
        )

    def _get_output_formats(self):
        return ["markdown", "json"]
```

Then add to `rostr/agents/__init__.py`:
```python
from rostr.agents.my_agent import MyAgent

__all__ = [..., "MyAgent"]
```

### 8. Creating a PAL Domain Template

```python
# rostr/pal/templates/sales.py

SALES_ENHANCEMENT_RULES = """
For sales-related tasks:
1. Always include ICP context
2. Prioritize personalization
3. Add clear CTAs
4. Specify delivery channel
5. Include success metrics
"""

def enhance_sales_prompt(intent, context):
    # Your enhancement logic
    pass
```

### 9. Documentation Guidelines

- Use clear, simple language
- Include code examples
- Show expected output
- Link to related docs
- Test all examples

### 10. Testing Guidelines

```python
# tests/test_my_feature.py

import pytest
from rostr.my_module import MyClass


def test_my_feature():
    """Test description"""
    obj = MyClass()
    result = obj.my_method()
    assert result == expected_value


@pytest.mark.asyncio
async def test_async_feature():
    """Test async functionality"""
    result = await my_async_function()
    assert result is not None
```

## Community

- [GitHub Discussions](https://github.com/rostr-ai/rostr/discussions) - Questions, ideas, feedback
- [Discord](https://discord.gg/rostr) - Real-time chat
- [Twitter](https://twitter.com/rostr_ai) - Updates

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors are recognized in:
- README.md
- Release notes
- Contributors page

Thank you for helping build the future of agent infrastructure! 🚀
