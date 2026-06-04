import uuid
from datetime import datetime
from loguru import logger
from . import PROVIDERS, CloudProvider, CloudInstance, InstanceStatus, CloudProviderType


class CloudInstanceManager:
    def __init__(self, message_bus=None):
        self.providers: dict[str, CloudProvider] = {}
        self.instances: dict[str, CloudInstance] = {}
        self.signup_links = {
            "azure": "https://azure.microsoft.com/free?ocid=6thagent",
            "oracle": "https://www.oracle.com/cloud/free/?source=:ex:tb:::::6thagent",
            "aws": "https://aws.amazon.com/free/?tag=6thagent-20",
        }
        self.deployment_script = """#!/bin/bash
# 6th Agent - One-Click Deploy
curl -fsSL https://get.docker.com | bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
git clone https://github.com/diamitani/6th-agent-platform.git
cd 6th-agent-platform
docker-compose up -d
echo "✅ 6th Agent deployed! Access at http://localhost:3000"
"""
        self.message_bus = message_bus
        logger.info("CloudInstanceManager initialized")

    async def connect_provider(
        self, provider_type: str, credentials: dict = None
    ) -> bool:
        cls = PROVIDERS.get(provider_type.lower())
        if not cls:
            logger.error(f"Unknown provider: {provider_type}")
            return False

        provider = cls(credentials or {})
        ok = await provider.authenticate()
        if ok:
            self.providers[provider_type] = provider
            logger.info(f"Provider connected: {provider_type}")
        return ok

    async def provision(
        self,
        provider_type: str,
        name: str,
        region: str = "us-east-1",
        specs: dict = None,
        use_existing: bool = False,
    ) -> dict:
        provider = self.providers.get(provider_type.lower())
        if not provider:
            provider_cls = PROVIDERS[provider_type.lower()]
            provider = provider_cls()
            await provider.authenticate()
            self.providers[provider_type] = provider

        instance = await provider.provision_instance(name, region, specs)
        self.instances[instance.id] = instance

        result = {
            "instance_id": instance.id,
            "name": instance.name,
            "provider": provider_type,
            "region": region,
            "status": instance.status.value,
            "ip_address": instance.ip_address,
            "deployment_script": self.deployment_script if use_existing else None,
            "affiliate_url": await provider.get_affiliate_url(),
        }

        if self.message_bus:
            await self.message_bus.publish("cloud.instance.provisioned", result)

        return result

    async def terminate(self, instance_id: str) -> bool:
        instance = self.instances.get(instance_id)
        if not instance:
            return False
        provider = self.providers.get(instance.provider.value)
        if provider:
            ok = await provider.terminate_instance(instance_id)
            if ok:
                self.instances.pop(instance_id, None)
            if self.message_bus:
                await self.message_bus.publish(
                    "cloud.instance.terminated", {"instance_id": instance_id}
                )
            return ok
        return False

    async def get_instance(self, instance_id: str) -> dict:
        instance = self.instances.get(instance_id)
        if not instance:
            return None
        return {
            "id": instance.id,
            "name": instance.name,
            "provider": instance.provider.value,
            "region": instance.region,
            "status": instance.status.value,
            "ip_address": instance.ip_address,
            "specs": instance.specs,
            "created_at": instance.created_at.isoformat(),
        }

    async def list_instances(self) -> list[dict]:
        return [await self.get_instance(i.id) for i in self.instances.values()]

    async def get_pricing(
        self, provider_type: str = None, region: str = "us-east-1"
    ) -> list[dict]:
        if provider_type:
            provider = self.providers.get(provider_type)
            if provider:
                return [await provider.get_pricing_tier(region)]
            return [{"error": f"Provider {provider_type} not connected"}]

        results = []
        for pt, cls in PROVIDERS.items():
            p = cls()
            await p.authenticate()
            tier = await p.get_pricing_tier(region)
            tier["signup_url"] = self.signup_links.get(pt, "")
            results.append(tier)
        return results

    async def get_affiliate_links(self) -> dict:
        links = {}
        for pt, cls in PROVIDERS.items():
            p = cls()
            url = await p.get_affiliate_url()
            links[pt] = url
        return {**links, **self.signup_links}

    async def get_guided_signup_url(self, provider_type: str) -> str:
        return self.signup_links.get(provider_type.lower(), "")

    def get_deployment_script(self) -> str:
        return self.deployment_script
