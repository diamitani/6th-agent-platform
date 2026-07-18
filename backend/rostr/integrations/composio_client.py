"""
Composio integration client for the 6th Agent platform.

Composio (composio.dev) provides managed auth + 300s of tool integrations
(Gmail, HubSpot, Slack, Notion, GitHub, ...) behind one API. Agents built in
the platform get their tool arsenal through this client:

    toolkits  -> what apps exist (Gmail, HubSpot, ...)
    tools     -> the individual actions inside a toolkit (GMAIL_SEND_EMAIL)
    connect   -> initiate an OAuth/API-key connection for a user/workspace
    execute   -> run a tool call on behalf of a connected account

When COMPOSIO_API_KEY is not configured the client degrades gracefully to a
curated offline catalog so the product surface (builder, arsenal UI) still
works in demo mode.
"""

from __future__ import annotations

import os
from typing import Any, Optional

import httpx
from loguru import logger

COMPOSIO_BASE_URL = os.getenv("COMPOSIO_BASE_URL", "https://backend.composio.dev/api/v3")

# Offline catalog used when no API key is configured. Slugs match Composio's
# real toolkit slugs so a key can be dropped in without data migration.
CURATED_TOOLKITS: list[dict[str, Any]] = [
    {"slug": "gmail", "name": "Gmail", "category": "communication", "description": "Send, read, and manage email"},
    {"slug": "googlecalendar", "name": "Google Calendar", "category": "productivity", "description": "Schedule and manage events"},
    {"slug": "slack", "name": "Slack", "category": "communication", "description": "Post messages, manage channels"},
    {"slug": "hubspot", "name": "HubSpot", "category": "crm", "description": "CRM contacts, deals, pipelines"},
    {"slug": "salesforce", "name": "Salesforce", "category": "crm", "description": "Enterprise CRM operations"},
    {"slug": "notion", "name": "Notion", "category": "productivity", "description": "Pages, databases, and docs"},
    {"slug": "github", "name": "GitHub", "category": "developer", "description": "Repos, issues, pull requests"},
    {"slug": "linear", "name": "Linear", "category": "developer", "description": "Issue tracking and projects"},
    {"slug": "googlesheets", "name": "Google Sheets", "category": "productivity", "description": "Read and write spreadsheets"},
    {"slug": "googledrive", "name": "Google Drive", "category": "storage", "description": "Files and folders"},
    {"slug": "linkedin", "name": "LinkedIn", "category": "marketing", "description": "Posts and company pages"},
    {"slug": "twitter", "name": "X (Twitter)", "category": "marketing", "description": "Post and engage"},
    {"slug": "stripe", "name": "Stripe", "category": "finance", "description": "Payments, customers, invoices"},
    {"slug": "shopify", "name": "Shopify", "category": "commerce", "description": "Products, orders, customers"},
    {"slug": "airtable", "name": "Airtable", "category": "productivity", "description": "Bases, tables, records"},
    {"slug": "discord", "name": "Discord", "category": "communication", "description": "Servers and messages"},
    {"slug": "jira", "name": "Jira", "category": "developer", "description": "Issues and sprints"},
    {"slug": "zendesk", "name": "Zendesk", "category": "support", "description": "Tickets and customers"},
    {"slug": "apollo", "name": "Apollo", "category": "sales", "description": "Prospecting and enrichment"},
    {"slug": "calendly", "name": "Calendly", "category": "productivity", "description": "Scheduling links and bookings"},
]


class ComposioClient:
    """Thin async wrapper over the Composio v3 REST API."""

    def __init__(self, api_key: Optional[str] = None, base_url: str = COMPOSIO_BASE_URL):
        self.api_key = api_key or os.getenv("COMPOSIO_API_KEY")
        self.base_url = base_url.rstrip("/")

    @property
    def enabled(self) -> bool:
        return bool(self.api_key)

    def _headers(self) -> dict[str, str]:
        return {"x-api-key": self.api_key or "", "Content-Type": "application/json"}

    async def _get(self, path: str, params: Optional[dict] = None) -> dict:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"{self.base_url}{path}", headers=self._headers(), params=params
            )
            resp.raise_for_status()
            return resp.json()

    async def _post(self, path: str, payload: dict) -> dict:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{self.base_url}{path}", headers=self._headers(), json=payload
            )
            resp.raise_for_status()
            return resp.json()

    # ------------------------------------------------------------- Toolkits

    async def list_toolkits(self, limit: int = 100) -> list[dict]:
        """List available toolkits (apps). Falls back to curated catalog."""
        if not self.enabled:
            return [{**t, "source": "curated"} for t in CURATED_TOOLKITS]
        try:
            data = await self._get("/toolkits", params={"limit": limit})
            items = data.get("items", data if isinstance(data, list) else [])
            result = []
            for t in items:
                meta = t.get("meta") or {}
                categories = meta.get("categories") or []
                category = (
                    categories[0].get("name")
                    if categories and isinstance(categories[0], dict)
                    else t.get("category", "other")
                )
                result.append(
                    {
                        "slug": t.get("slug"),
                        "name": t.get("name"),
                        "category": category,
                        "description": meta.get("description") or t.get("description", ""),
                        "logo": meta.get("logo"),
                        "tools_count": meta.get("tools_count"),
                        "auth_schemes": t.get("auth_schemes", []),
                        "source": "composio",
                    }
                )
            return result
        except Exception as e:  # network/auth failure -> demo catalog
            logger.warning(f"Composio toolkits fetch failed, using curated: {e}")
            return [{**t, "source": "curated"} for t in CURATED_TOOLKITS]

    async def list_tools(self, toolkit_slug: str, limit: int = 50) -> list[dict]:
        """List individual tools (actions) for a toolkit."""
        if not self.enabled:
            return []
        data = await self._get(
            "/tools", params={"toolkit_slug": toolkit_slug, "limit": limit}
        )
        items = data.get("items", data if isinstance(data, list) else [])
        return [
            {
                "slug": t.get("slug"),
                "name": t.get("name"),
                "description": t.get("description", ""),
                "toolkit": toolkit_slug,
                "input_parameters": t.get("input_parameters"),
            }
            for t in items
        ]

    # ---------------------------------------------------------- Connections

    async def initiate_connection(
        self,
        toolkit_slug: str,
        user_id: str,
        auth_config_id: Optional[str] = None,
        callback_url: Optional[str] = None,
    ) -> dict:
        """Start an OAuth/API-key connection flow for a workspace user.

        Returns a redirect URL the frontend sends the user to.
        """
        if not self.enabled:
            return {
                "status": "demo",
                "message": "Set COMPOSIO_API_KEY to enable live connections",
                "toolkit": toolkit_slug,
            }
        payload: dict[str, Any] = {
            "toolkit_slug": toolkit_slug,
            "user_id": user_id,
        }
        if auth_config_id:
            payload["auth_config_id"] = auth_config_id
        if callback_url:
            payload["callback_url"] = callback_url
        return await self._post("/connected_accounts", payload)

    async def list_connections(self, user_id: Optional[str] = None) -> list[dict]:
        if not self.enabled:
            return []
        params = {"user_id": user_id} if user_id else None
        data = await self._get("/connected_accounts", params=params)
        return data.get("items", data if isinstance(data, list) else [])

    # ------------------------------------------------------------ Execution

    async def execute_tool(
        self,
        tool_slug: str,
        arguments: dict,
        user_id: str,
        connected_account_id: Optional[str] = None,
    ) -> dict:
        """Execute a Composio tool on behalf of a connected account."""
        if not self.enabled:
            return {
                "successful": False,
                "error": "COMPOSIO_API_KEY not configured",
                "tool": tool_slug,
            }
        payload: dict[str, Any] = {"arguments": arguments, "user_id": user_id}
        if connected_account_id:
            payload["connected_account_id"] = connected_account_id
        return await self._post(f"/tools/execute/{tool_slug}", payload)
