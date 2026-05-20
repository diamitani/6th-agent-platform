"""Basic usage example for Rostr Agent Framework"""

from rostr.core import RostrHub
from rostr.agents import BuilderAgent, ResearcherAgent


def main():
    # Initialize hub
    print("Initializing Rostr Hub...")
    hub = RostrHub(workspace="quickstart-demo")

    # Register agents
    print("Registering agents...")
    builder = BuilderAgent(name="code-builder")
    researcher = ResearcherAgent(name="research-assistant")

    hub.register_agent(builder.to_definition())
    hub.register_agent(researcher.to_definition())

    # Execute a development task
    print("\nExecuting development task...")
    result = hub.execute(
        "Build a REST API endpoint for user registration"
    )

    print(f"\n=== Development Task Result ===")
    print(f"Phase: {result['phase']}")
    print(f"Agent Type: {result['agent_type']}")
    print(f"Compiled Intent: {result['compiled_intent']}")
    print(f"\nEnhanced Prompt (first 200 chars):")
    print(result['enhanced_prompt'][:200] + "...")

    # Execute a research task
    print("\n\nExecuting research task...")
    result = hub.execute(
        "Research best practices for password hashing in 2026"
    )

    print(f"\n=== Research Task Result ===")
    print(f"Phase: {result['phase']}")
    print(f"Agent Type: {result['agent_type']}")
    print(f"Compiled Intent: {result['compiled_intent']}")

    if result.get('research'):
        print(f"\nResearch Report (first 300 chars):")
        print(result['research'][:300] + "...")

    # Show workspace status
    print("\n\n=== Workspace Status ===")
    context = hub.get_context()
    print(f"Project: {context['project']}")
    print(f"Recent Activity: {len(context['recent_activity'])} events")

    print("\n✓ Quickstart complete!")


if __name__ == "__main__":
    main()
