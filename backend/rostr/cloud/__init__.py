from .provider import CloudProvider, CloudInstance, InstanceStatus, CloudProviderType
from .azure import AzureProvider
from .oracle import OracleProvider
from .aws import AWSProvider

PROVIDERS = {
    "azure": AzureProvider,
    "oracle": OracleProvider,
    "aws": AWSProvider,
}

__all__ = [
    "CloudProvider",
    "CloudInstance",
    "InstanceStatus",
    "CloudProviderType",
    "AzureProvider",
    "OracleProvider",
    "AWSProvider",
    "PROVIDERS",
]
