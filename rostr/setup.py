from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="rostr",
    version="0.1.0",
    author="Patrick Diamitani",
    author_email="patrick@diamitani.com",
    description="A Unified Agent Operating System for Production-Grade Multi-Agent Systems",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/rostr",
    project_urls={
        "Documentation": "https://rostr.dev",
        "Research Paper": "https://github.com/yourusername/rostr/blob/main/docs/paper/ROSTR_Research_Paper.md",
        "Bug Tracker": "https://github.com/yourusername/rostr/issues",
    },
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    python_requires=">=3.10",
    install_requires=[
        "anthropic>=0.18.0",
        "openai>=1.0.0",
        "langchain>=0.1.0",
        "pydantic>=2.0.0",
        "numpy>=1.24.0",
        "supabase>=2.0.0",
        "chromadb>=0.4.0",
        "python-dotenv>=1.0.0",
        "httpx>=0.25.0",
        "rich>=13.0.0",
        "typer>=0.9.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-cov>=4.1.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "mypy>=1.5.0",
            "ruff>=0.1.0",
            "ipython>=8.0.0",
            "jupyter>=1.0.0",
        ],
        "docs": [
            "mkdocs>=1.5.0",
            "mkdocs-material>=9.0.0",
            "mkdocstrings[python]>=0.23.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "rostr=rostr.cli:app",
        ],
    },
)
