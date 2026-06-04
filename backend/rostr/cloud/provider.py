from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
from typing import Optional


class InstanceStatus(Enum):
    PROVISIONING = "provisioning"
    RUNNING = "running"
    STOPPED = "stopped"
    TERMINATED = "terminated"
    FAILED = "failed"


class CloudProviderType(Enum):
    AZURE = "azure"
    ORACLE = "oracle"
    AWS = "aws"
    SELF_HOSTED = "self_hosted"


@dataclass
class CloudInstance:
    id: str
    provider: CloudProviderType
    name: str
    region: str
    status: InstanceStatus
    ip_address: Optional[str] = None
    specs: dict = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)
    metadata: dict = field(default_factory=dict)


class CloudProvider(ABC):
    def __init__(self, config: dict = None):
        self.config = config or {}
        self._instances: dict[str, CloudInstance] = {}

    @abstractmethod
    async def authenticate(self) -> bool: ...

    @abstractmethod
    async def provision_instance(
        self, name: str, region: str, specs: dict = None
    ) -> CloudInstance: ...

    @abstractmethod
    async def terminate_instance(self, instance_id: str) -> bool: ...

    @abstractmethod
    async def get_instance(self, instance_id: str) -> Optional[CloudInstance]: ...

    @abstractmethod
    async def list_instances(self) -> list[CloudInstance]: ...

    @abstractmethod
    async def get_instance_logs(self, instance_id: str) -> str: ...

    async def restart_instance(self, instance_id: str) -> bool:
        instance = self._instances.get(instance_id)
        if not instance:
            return False
        instance.status = InstanceStatus.RUNNING
        return True

    async def get_affiliate_url(self) -> str:
        return ""

    async def get_pricing_tier(self, region: str) -> dict:
        return {"region": region, "compute": "N/A", "storage": "N/A"}
