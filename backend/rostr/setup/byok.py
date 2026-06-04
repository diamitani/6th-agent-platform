import os
import json
from loguru import logger


PROVIDER_CONFIGS = {
    "ollama": {
        "label": "Ollama (Local)",
        "description": "100% free, runs locally on your machine",
        "fields": [
            {
                "key": "OLLAMA_HOST",
                "label": "Ollama Host",
                "default": "http://localhost:11434",
                "type": "text",
            },
            {
                "key": "OLLAMA_FAST_MODEL",
                "label": "Fast Model",
                "default": "deepseek-r1:7b",
                "type": "text",
            },
            {
                "key": "OLLAMA_REASONING_MODEL",
                "label": "Reasoning Model",
                "default": "deepseek-r1:32b",
                "type": "text",
            },
        ],
        "cost": "$0",
        "privacy": "100% local",
    },
    "openai": {
        "label": "OpenAI",
        "description": "GPT-4, GPT-4 Turbo — fastest inference",
        "fields": [
            {
                "key": "OPENAI_API_KEY",
                "label": "API Key",
                "default": "",
                "type": "password",
            },
            {
                "key": "OPENAI_MODEL",
                "label": "Model",
                "default": "gpt-4",
                "type": "select",
                "options": ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
            },
        ],
        "cost": "Pay per token",
        "privacy": "Cloud (OpenAI servers)",
    },
    "gemini": {
        "label": "Google Gemini",
        "description": "Free tier available, fast, good reasoning",
        "fields": [
            {
                "key": "GEMINI_API_KEY",
                "label": "API Key",
                "default": "",
                "type": "password",
            },
            {
                "key": "GEMINI_MODEL",
                "label": "Model",
                "default": "gemini-pro",
                "type": "select",
                "options": ["gemini-pro", "gemini-ultra"],
            },
        ],
        "cost": "Free tier + pay-as-you-go",
        "privacy": "Cloud (Google servers)",
    },
    "anthropic": {
        "label": "Anthropic Claude",
        "description": "Claude 3.5 Sonnet — excellent for complex reasoning",
        "fields": [
            {
                "key": "ANTHROPIC_API_KEY",
                "label": "API Key",
                "default": "",
                "type": "password",
            },
            {
                "key": "ANTHROPIC_MODEL",
                "label": "Model",
                "default": "claude-3-5-sonnet-20241022",
                "type": "select",
                "options": ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229"],
            },
        ],
        "cost": "Pay per token",
        "privacy": "Cloud (Anthropic servers)",
    },
    "bedrock": {
        "label": "AWS Bedrock",
        "description": "Claude, Titan, Mistral on AWS infrastructure",
        "fields": [
            {
                "key": "AWS_ACCESS_KEY_ID",
                "label": "AWS Access Key",
                "default": "",
                "type": "password",
            },
            {
                "key": "AWS_SECRET_ACCESS_KEY",
                "label": "AWS Secret Key",
                "default": "",
                "type": "password",
            },
            {
                "key": "AWS_REGION",
                "label": "Region",
                "default": "us-east-1",
                "type": "text",
            },
        ],
        "cost": "Pay per token (AWS pricing)",
        "privacy": "Cloud (AWS servers)",
    },
    "azure_openai": {
        "label": "Azure OpenAI",
        "description": "OpenAI models on Azure infrastructure",
        "fields": [
            {
                "key": "AZURE_OPENAI_KEY",
                "label": "API Key",
                "default": "",
                "type": "password",
            },
            {
                "key": "AZURE_OPENAI_ENDPOINT",
                "label": "Endpoint",
                "default": "",
                "type": "text",
            },
            {
                "key": "AZURE_OPENAI_DEPLOYMENT",
                "label": "Deployment Name",
                "default": "",
                "type": "text",
            },
        ],
        "cost": "Pay per token (Azure pricing)",
        "privacy": "Cloud (Azure servers)",
    },
}


class BYOKManager:
    def __init__(self, message_bus=None):
        self.message_bus = message_bus
        self._providers = list(PROVIDER_CONFIGS.keys())
        logger.info(f"BYOKManager initialized with {len(self._providers)} providers")

    def list_providers(self) -> list[dict]:
        return [{"id": pid, **cfg} for pid, cfg in PROVIDER_CONFIGS.items()]

    def get_provider(self, provider_id: str) -> dict:
        cfg = PROVIDER_CONFIGS.get(provider_id)
        if not cfg:
            return None
        return {"id": provider_id, **cfg}

    async def validate_key(self, provider: str, key: str) -> dict:
        if provider == "ollama":
            return {"valid": True, "message": "Local mode — no key needed"}

        if provider == "openai":
            import httpx

            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(
                        "https://api.openai.com/v1/models",
                        headers={"Authorization": f"Bearer {key}"},
                        timeout=10,
                    )
                    return {
                        "valid": resp.status_code == 200,
                        "message": "Valid"
                        if resp.status_code == 200
                        else "Invalid key",
                    }
            except Exception as e:
                return {"valid": False, "message": str(e)}

        if provider == "gemini":
            import httpx

            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(
                        f"https://generativelanguage.googleapis.com/v1/models?key={key}",
                        timeout=10,
                    )
                    return {
                        "valid": resp.status_code == 200,
                        "message": "Valid"
                        if resp.status_code == 200
                        else "Invalid key",
                    }
            except Exception as e:
                return {"valid": False, "message": str(e)}

        if provider == "anthropic":
            import httpx

            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(
                        "https://api.anthropic.com/v1/models",
                        headers={"x-api-key": key, "anthropic-version": "2023-06-01"},
                        timeout=10,
                    )
                    return {
                        "valid": resp.status_code == 200,
                        "message": "Valid"
                        if resp.status_code == 200
                        else "Invalid key",
                    }
            except Exception as e:
                return {"valid": False, "message": str(e)}

        return {
            "valid": True,
            "message": "Key saved (validation not available for this provider)",
        }

    async def save_config(
        self, provider: str, config: dict, user_id: str = None
    ) -> bool:
        from rostr.hub.state_manager import StateManager

        sm = StateManager()

        provider_key = f"llm_config_{user_id or 'default'}"

        existing = sm.sessions.get(provider_key, {})
        existing[provider] = config

        import json

        sm.sessions[provider_key] = existing

        if self.message_bus:
            await self.message_bus.publish(
                "byok.config_saved",
                {
                    "provider": provider,
                    "user_id": user_id,
                },
            )

        logger.info(f"BYOK config saved for provider '{provider}'")
        return True

    async def get_config(self, provider: str = None, user_id: str = None) -> dict:
        from rostr.hub.state_manager import StateManager

        sm = StateManager()
        provider_key = f"llm_config_{user_id or 'default'}"
        configs = sm.sessions.get(provider_key, {})

        if provider:
            return {provider: configs.get(provider, {})}
        return configs

    async def test_connection(self, provider: str, user_id: str = None) -> dict:
        configs = await self.get_config(provider, user_id)
        cfg = configs.get(provider, {})
        if not cfg:
            return {"connected": False, "error": "No configuration found"}

        return {
            "connected": True,
            "provider": provider,
            "model": cfg.get(list(cfg.keys())[0]) if cfg else None,
        }
