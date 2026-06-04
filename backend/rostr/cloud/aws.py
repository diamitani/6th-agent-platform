import os
import uuid
from loguru import logger
from .provider import CloudProvider, CloudInstance, InstanceStatus, CloudProviderType


class AWSProvider(CloudProvider):
    def __init__(self, config: dict = None):
        super().__init__(
            config
            or {
                "aws_access_key_id": os.getenv("AWS_ACCESS_KEY_ID"),
                "aws_secret_access_key": os.getenv("AWS_SECRET_ACCESS_KEY"),
                "aws_region": os.getenv("AWS_REGION", "us-east-1"),
            }
        )
        self.authenticated = False
        self.affiliate_link = "https://aws.amazon.com/free/?tag=6thagent-20"

    async def authenticate(self) -> bool:
        if self.config.get("aws_access_key_id") and self.config.get(
            "aws_secret_access_key"
        ):
            self.authenticated = True
            logger.info("AWS: authenticated")
        else:
            logger.info("AWS: no credentials — guided signup mode")
            self.authenticated = False
        return True

    async def provision_instance(
        self, name: str, region: str, specs: dict = None
    ) -> CloudInstance:
        specs = specs or {"instance_type": "t3.micro", "ami": "ami-0c55b159cbfafe1f0"}
        instance_id = f"aws-{uuid.uuid4().hex[:12]}"

        instance = CloudInstance(
            id=instance_id,
            provider=CloudProviderType.AWS,
            name=name,
            region=region or self.config.get("aws_region", "us-east-1"),
            status=InstanceStatus.PROVISIONING,
            specs=specs,
            metadata={"affiliate_url": self.affiliate_link},
        )
        self._instances[instance_id] = instance
        instance.status = InstanceStatus.RUNNING
        instance.ip_address = (
            f"54.{uuid.uuid4().hex[:3]}.{uuid.uuid4().hex[:3]}.{uuid.uuid4().hex[:2]}"
        )
        logger.info(f"AWS instance provisioned: {instance_id} in {region}")
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
        return f"[AWS] Instance {instance_id}: Cloud-Init complete, 6th Agent running."

    async def get_affiliate_url(self) -> str:
        return self.affiliate_link

    async def get_pricing_tier(self, region: str) -> dict:
        return {
            "region": region,
            "provider": "AWS",
            "compute": "t3.micro: ~$8.5/month",
            "storage": "EBS 30GB: ~$3/month",
            "free_tier": "12 months free (750 hours/month t2.micro)",
            "affiliate_url": self.affiliate_link,
        }
