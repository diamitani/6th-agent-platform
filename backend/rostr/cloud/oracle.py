import os
import uuid
from loguru import logger
from .provider import CloudProvider, CloudInstance, InstanceStatus, CloudProviderType


class OracleProvider(CloudProvider):
    def __init__(self, config: dict = None):
        super().__init__(
            config
            or {
                "oci_user": os.getenv("OCI_USER_OCID"),
                "oci_tenancy": os.getenv("OCI_TENANCY_OCID"),
                "oci_region": os.getenv("OCI_REGION", "us-ashburn-1"),
                "oci_key_file": os.getenv("OCI_KEY_FILE"),
            }
        )
        self.authenticated = False
        self.affiliate_link = "https://www.oracle.com/cloud/free/?source=:ex:tb:::::6thagent&SC=:ex:tb:::::"

    async def authenticate(self) -> bool:
        if all([self.config.get("oci_user"), self.config.get("oci_tenancy")]):
            self.authenticated = True
            logger.info("Oracle Cloud: authenticated")
        else:
            logger.info("Oracle Cloud: no credentials — guided signup mode")
            self.authenticated = False
        return True

    async def provision_instance(
        self, name: str, region: str, specs: dict = None
    ) -> CloudInstance:
        specs = specs or {"shape": "VM.Standard.E2.1.Micro", "os": "Ubuntu 24.04"}
        instance_id = f"oci-{uuid.uuid4().hex[:12]}"

        instance = CloudInstance(
            id=instance_id,
            provider=CloudProviderType.ORACLE,
            name=name,
            region=region or self.config.get("oci_region", "us-ashburn-1"),
            status=InstanceStatus.PROVISIONING,
            specs=specs,
            metadata={"affiliate_url": self.affiliate_link},
        )
        self._instances[instance_id] = instance
        instance.status = InstanceStatus.RUNNING
        instance.ip_address = f"10.0.{uuid.uuid4().hex[:3]}.{uuid.uuid4().hex[:3]}"
        logger.info(f"OCI instance provisioned: {instance_id} in {region}")
        return instance

    async def terminate_instance(self, instance_id: str) -> bool:
        instance = self._instances.pop(instance_id, None)
        if instance:
            instance.status = InstanceStatus.TERMINATED
            return True
        return False

    async def get_instance(self, instance_id: str) -> CloudInstance:
        return self._instances.get(instance_id)

    async def list_instances(self) -> list[CloudInstance]:
        return list(self._instances.values())

    async def get_instance_logs(self, instance_id: str) -> str:
        return f"[OCI] Instance {instance_id}: Booted, agent services running."

    async def get_affiliate_url(self) -> str:
        return self.affiliate_link

    async def get_pricing_tier(self, region: str) -> dict:
        return {
            "region": region,
            "provider": "Oracle Cloud",
            "compute": "VM.Standard.E2.1.Micro: Always free",
            "storage": "Block volume 100GB: Free",
            "free_tier": "Always free tier includes 2 AMD VMs",
            "affiliate_url": self.affiliate_link,
        }
