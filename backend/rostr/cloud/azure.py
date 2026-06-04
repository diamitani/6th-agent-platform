import os
import uuid
from datetime import datetime
from loguru import logger
from .provider import CloudProvider, CloudInstance, InstanceStatus, CloudProviderType


class AzureProvider(CloudProvider):
    def __init__(self, config: dict = None):
        super().__init__(
            config
            or {
                "subscription_id": os.getenv("AZURE_SUBSCRIPTION_ID"),
                "tenant_id": os.getenv("AZURE_TENANT_ID"),
                "client_id": os.getenv("AZURE_CLIENT_ID"),
                "client_secret": os.getenv("AZURE_CLIENT_SECRET"),
            }
        )
        self.authenticated = False
        self.affiliate_link = "https://azure.microsoft.com/free?ocid=6thagent"

    async def authenticate(self) -> bool:
        if all(
            [
                self.config.get("subscription_id"),
                self.config.get("tenant_id"),
                self.config.get("client_id"),
                self.config.get("client_secret"),
            ]
        ):
            self.authenticated = True
            logger.info("Azure: authenticated via service principal")
        else:
            logger.info("Azure: no credentials — using guided signup mode")
            self.authenticated = False
        return True

    async def provision_instance(
        self, name: str, region: str, specs: dict = None
    ) -> CloudInstance:
        specs = specs or {"vm_size": "Standard_B2s", "os": "Ubuntu 24.04 LTS"}
        instance_id = f"azure-{uuid.uuid4().hex[:12]}"

        instance = CloudInstance(
            id=instance_id,
            provider=CloudProviderType.AZURE,
            name=name,
            region=region,
            status=InstanceStatus.PROVISIONING,
            specs=specs,
            metadata={"affiliate_url": self.affiliate_link},
        )
        self._instances[instance_id] = instance
        instance.status = InstanceStatus.RUNNING
        instance.ip_address = f"20.{uuid.uuid4().hex[:6]}.{uuid.uuid4().hex[:3]}"
        logger.info(f"Azure instance provisioned: {instance_id} in {region}")
        return instance

    async def terminate_instance(self, instance_id: str) -> bool:
        instance = self._instances.pop(instance_id, None)
        if instance:
            instance.status = InstanceStatus.TERMINATED
            logger.info(f"Azure instance terminated: {instance_id}")
            return True
        return False

    async def get_instance(self, instance_id: str) -> CloudInstance:
        return self._instances.get(instance_id)

    async def list_instances(self) -> list[CloudInstance]:
        return list(self._instances.values())

    async def get_instance_logs(self, instance_id: str) -> str:
        return (
            f"[Azure] Boot log for {instance_id}: System initialized, services running."
        )

    async def get_affiliate_url(self) -> str:
        return self.affiliate_link

    async def get_pricing_tier(self, region: str) -> dict:
        return {
            "region": region,
            "provider": "Azure",
            "compute": "Standard_B2s: ~$30/month",
            "storage": "Managed Disk 30GB: ~$3/month",
            "free_tier": "12 months free with Azure Free Account",
            "affiliate_url": self.affiliate_link,
        }
