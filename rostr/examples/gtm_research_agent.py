"""
GTM Account Research Agent Example

Demonstrates ROSTR framework for automating account research and call prep.
Synthesizes HubSpot data, intent signals, and web research.
"""

from rostr import Hub, Agent, PAL, NPAO, RAGDAL


def main():
    print("ROSTR GTM Research Agent Example")
    print("=" * 50)

    # 1. Initialize Hub
    hub = Hub.initialize(
        storage_backend="local",  # Use 'supabase' for production
        vector_db="chroma"
    )
    project = hub.create_project(
        name="gtm-operations",
        description="GTM automation and research"
    )
    print(f"✓ Initialized project: {project.name}")

    # 2. Register GTM Research Agent
    gtm_agent = Agent.register(
        name="account-researcher",
        type="researcher",
        capabilities=[
            "hubspot_api",
            "web_search",
            "data_synthesis",
            "report_generation"
        ],
        phases=["PreD"],  # Research is PreD phase
        model="claude-sonnet-4-6"
    )
    print(f"✓ Registered agent: {gtm_agent.name}")

    # 3. Define research task
    task_intent = """
    Generate comprehensive account brief for Acme Corp sales call tomorrow.

    Include:
    - Company overview (size, industry, funding)
    - Recent news and announcements
    - Competitive positioning
    - Intent signals from Factors
    - Key decision makers and roles
    - Identified pain points

    Output: Structured markdown brief (2-3 pages)
    """

    # 4. Compile with PAL
    print("\nCompiling intent with PAL...")
    manifest = PAL.compile(
        intent=task_intent,
        project_id=project.id,
        context={
            "account_name": "Acme Corp",
            "call_date": "2026-04-13",
            "sales_rep": "Jane Smith"
        }
    )
    print("✓ Manifest compiled")

    # 5. Execute with NPAO
    print("\nExecuting with NPAO orchestration...")
    result = NPAO.execute(manifest)

    print("\nResults:")
    print(f"  Task ID: {result.task_id}")
    print(f"  Confidence: {result.confidence:.1%}")
    print(f"  Sources consulted: {len(result.sources)}")

    # 6. Access persisted knowledge
    knowledge = hub.query(
        project_id=project.id,
        query="Acme Corp research",
        limit=10
    )
    print(f"  Knowledge entries saved: {len(knowledge)}")

    print("\n" + "=" * 50)
    print("Account brief generated successfully!")
    print("Next call will reuse this knowledge automatically.")


def advanced_example_ragdal():
    """Advanced example using RAG DAL directly."""

    # Configure RAG DAL for competitive intelligence
    ragdal = RAGDAL(
        confidence_threshold=0.8,
        max_passes=4,
        tier_weights={
            "tier1": 1.0,   # Official docs, press releases
            "tier2": 0.75,  # Industry publications
            "tier3": 0.40   # User reviews, forums
        }
    )

    # Research competitor
    query = "Latest features and pricing for CompetitorX enterprise tier"
    report = ragdal.retrieve(query)

    print(f"\nRAG DAL Results:")
    print(f"  Query: {query}")
    print(f"  Passes run: {report.passes_run}")
    print(f"  Confidence: {report.confidence:.1%}")
    print(f"  Tier 1 sources: {report.tier1_count}")
    print(f"  Tier 2 sources: {report.tier2_count}")
    print(f"  Tier 3 sources: {report.tier3_count}")


if __name__ == "__main__":
    main()
    advanced_example_ragdal()
