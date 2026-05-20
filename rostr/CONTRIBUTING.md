# Contributing to ROSTR

Thank you for your interest in contributing to ROSTR! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful, inclusive, and collaborative environment.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/rostr/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Python version, OS, dependencies)
   - Code samples or error logs

### Suggesting Features

1. Check [Discussions](https://github.com/yourusername/rostr/discussions) for existing proposals
2. Create a new discussion with:
   - Use case and motivation
   - Proposed solution
   - Alternative approaches considered
   - Impact on existing functionality

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/rostr.git
   cd rostr
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install development dependencies**
   ```bash
   pip install -e ".[dev]"
   ```

4. **Make your changes**
   - Write clear, documented code
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation as needed

5. **Run tests**
   ```bash
   pytest
   black src/ tests/
   mypy src/
   ```

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation changes
   - `test:` test additions/changes
   - `refactor:` code refactoring
   - `perf:` performance improvements

7. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a pull request on GitHub.

## Development Guidelines

### Code Style

- Follow [PEP 8](https://pep8.org/) for Python code
- Use [Black](https://black.readthedocs.io/) for formatting
- Use type hints (checked with [mypy](https://mypy.readthedocs.io/))
- Write docstrings for public APIs (Google style)

### Testing

- Write unit tests for new functions
- Write integration tests for new features
- Aim for >80% code coverage
- Use `pytest` for all tests

### Documentation

- Update README.md if adding user-facing features
- Add docstrings to all public functions/classes
- Update relevant documentation in `/docs`
- Add examples for new features in `/examples`

## Project Structure

```
rostr/
├── src/
│   ├── pal/          # Prompt Abstraction Layer
│   ├── ragdal/       # RAG Dynamic Acquisition Layer
│   ├── npao/         # Navigate, Prioritize, Allocate, Orchestrate
│   └── hub/          # Rostr Hub
├── tests/            # Test suite
├── examples/         # Example implementations
├── docs/             # Documentation
└── scripts/          # Utility scripts
```

## Component Contribution Guidelines

### PAL (Prompt Abstraction Layer)
- New enhancement rules should be well-documented
- Context injection strategies should be benchmarked
- Model selection heuristics should include reasoning

### RAG DAL
- New source tiers require credibility justification
- Convergence criteria changes should be empirically validated
- Knowledge base schemas must be backwards compatible

### NPAO
- Phase taxonomy extensions need clear use cases
- Priority scoring weights should be configurable
- Allocation algorithms should be tested for fairness

### Rostr Hub
- State management changes must preserve data integrity
- Communication protocols should be protocol-versioned
- Namespace access controls must be security-audited

## Review Process

1. Automated checks (tests, linting) must pass
2. At least one maintainer review required
3. Documentation must be updated
4. Changes must align with project roadmap

## Questions?

- Check [Documentation](https://rostr.dev)
- Ask in [Discussions](https://github.com/yourusername/rostr/discussions)
- Email: patrick@diamitani.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
