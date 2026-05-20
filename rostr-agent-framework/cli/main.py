"""Rostr CLI - Command-line interface for the Rostr Agent Framework"""

import typer
from rich.console import Console
from rich.table import Table
from rich import print as rprint
from pathlib import Path
import json

from rostr.core.hub import RostrHub
from rostr.agents.builder import BuilderAgent
from rostr.agents.researcher import ResearcherAgent

app = typer.Typer(
    name="rostr",
    help="Rostr Agent Framework - Open Source Agent Team Operating System"
)
console = Console()


@app.command()
def init(
    workspace: str = typer.Argument(..., help="Workspace name"),
    path: Path = typer.Option(Path.cwd() / "rostr-data", help="Storage path")
):
    """Initialize a new Rostr workspace"""

    hub = RostrHub(workspace=workspace, storage_path=path)

    console.print(f"[green]✓[/green] Initialized workspace: {workspace}")
    console.print(f"[dim]   Storage path: {path}[/dim]")
    console.print("\n[bold]Next steps:[/bold]")
    console.print("  1. rostr agent add --name builder --type builder")
    console.print("  2. rostr task 'Your first task'")


@app.command()
def agent(
    action: str = typer.Argument(..., help="Action: add, list, remove"),
    name: str = typer.Option(None, "--name", help="Agent name"),
    agent_type: str = typer.Option(None, "--type", help="Agent type: builder, researcher"),
    workspace: str = typer.Option("default", help="Workspace name"),
    path: Path = typer.Option(Path.cwd() / "rostr-data", help="Storage path")
):
    """Manage agents"""

    hub = RostrHub(workspace=workspace, storage_path=path)

    if action == "add":
        if not name or not agent_type:
            console.print("[red]Error: --name and --type required for 'add'[/red]")
            raise typer.Exit(1)

        # Create agent based on type
        if agent_type == "builder":
            agent = BuilderAgent(name=name)
        elif agent_type == "researcher":
            agent = ResearcherAgent(name=name)
        else:
            console.print(f"[red]Error: Unknown agent type '{agent_type}'[/red]")
            raise typer.Exit(1)

        hub.register_agent(agent.to_definition())
        console.print(f"[green]✓[/green] Registered {agent_type} agent: {name}")

    elif action == "list":
        agents = hub.registry.list_all()

        if not agents:
            console.print("[yellow]No agents registered[/yellow]")
            return

        table = Table(title="Registered Agents")
        table.add_column("Name", style="cyan")
        table.add_column("Type", style="magenta")
        table.add_column("Phases", style="green")
        table.add_column("Capabilities")

        for agent in agents:
            table.add_row(
                agent.name,
                agent.type,
                ", ".join(agent.phases),
                ", ".join(agent.capabilities[:3]) + "..."
            )

        console.print(table)

    elif action == "remove":
        if not name:
            console.print("[red]Error: --name required for 'remove'[/red]")
            raise typer.Exit(1)

        # Find and remove agent
        agents = [a for a in hub.registry.list_all() if a.name == name]
        if agents:
            hub.registry.unregister(agents[0].agent_id)
            console.print(f"[green]✓[/green] Removed agent: {name}")
        else:
            console.print(f"[yellow]Agent not found: {name}[/yellow]")


@app.command()
def task(
    instruction: str = typer.Argument(..., help="Task instruction"),
    workspace: str = typer.Option("default", help="Workspace name"),
    path: Path = typer.Option(Path.cwd() / "rostr-data", help="Storage path"),
    output: Path = typer.Option(None, "--output", help="Save result to file")
):
    """Execute a task"""

    hub = RostrHub(workspace=workspace, storage_path=path)

    console.print(f"\n[bold]Executing:[/bold] {instruction}\n")

    with console.status("[bold green]Processing..."):
        result = hub.execute(instruction)

    # Display result
    console.print("[bold]Result:[/bold]")
    console.print(f"  Phase: [cyan]{result['phase']}[/cyan]")
    console.print(f"  Agent Type: [magenta]{result['agent_type']}[/magenta]")
    console.print(f"\n[bold]Compiled Intent:[/bold]")
    console.print(f"  {result['compiled_intent']}")

    if result.get('research'):
        console.print(f"\n[bold]Research Results:[/bold]")
        console.print("[dim]" + result['research'][:500] + "...[/dim]")

    console.print(f"\n[bold]Enhanced Prompt:[/bold]")
    console.print(f"[dim]{result['enhanced_prompt'][:300]}...[/dim]")

    # Save if requested
    if output:
        output.write_text(json.dumps(result, indent=2))
        console.print(f"\n[green]✓[/green] Saved to: {output}")


@app.command()
def status(
    workspace: str = typer.Option("default", help="Workspace name"),
    path: Path = typer.Option(Path.cwd() / "rostr-data", help="Storage path")
):
    """Show workspace status"""

    hub = RostrHub(workspace=workspace, storage_path=path)

    console.print(f"\n[bold]Workspace:[/bold] {workspace}")
    console.print(f"[dim]Path: {path}[/dim]\n")

    # Show registered agents
    agents = hub.registry.list_all()
    console.print(f"[bold]Agents:[/bold] {len(agents)} registered")
    for agent in agents:
        console.print(f"  - {agent.name} ([cyan]{agent.type}[/cyan])")

    # Show recent activity
    timeline = hub.state.read_log("timeline", f"project/{workspace}", limit=5)
    console.print(f"\n[bold]Recent Activity:[/bold] {len(timeline)} events")
    for event in timeline[-3:]:
        console.print(f"  - {event.get('event')}: {event.get('intent', 'N/A')[:50]}")


@app.command()
def version():
    """Show version information"""
    from rostr import __version__
    console.print(f"Rostr Agent Framework v{__version__}")
    console.print("Open Source Agent Team Operating System")
    console.print("\nComponents:")
    console.print("  - PAL (Prompt Abstraction Layer)")
    console.print("  - RAG DAL (Dynamic Acquisition Layer)")
    console.print("  - NPAO (Navigate, Prioritize, Allocate, Orchestrate)")
    console.print("  - Rostr Hub (Central Platform)")


if __name__ == "__main__":
    app()
