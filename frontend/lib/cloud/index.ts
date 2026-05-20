// 6thAgent Cloud Integration Wizard
// Deploy agents to Azure, Oracle Cloud, or AWS

export type CloudProvider = "azure" | "oracle" | "aws"

export interface CloudConfig {
  provider: CloudProvider
  name: string
  region: string
  credentials: Record<string, string>
  instanceType: string
  agentId?: string
}

export interface CloudInstance {
  id: string
  provider: CloudProvider
  name: string
  region: string
  status: "provisioning" | "running" | "stopped" | "error"
  endpoint?: string
  createdAt: string
  agentId?: string
}

export interface CloudPricing {
  provider: CloudProvider
  instanceType: string
  vCPU: number
  memory: string
  pricePerHour: number
  affiliateUrl?: string
}

export const CLOUD_PROVIDERS = [
  {
    id: "azure" as CloudProvider,
    name: "Azure",
    logo: "🟦",
    description: "Microsoft Azure cloud infrastructure",
    docsUrl: "https://learn.microsoft.com/en-us/azure/",
    affiliateUrl: "https://azure.microsoft.com/en-us/free/",
    affiliateCode: "6thagent-azure-20",
    regions: ["eastus", "westus", "westeurope", "southeastasia", "eastus2"],
    instances: [
      { provider: "azure" as CloudProvider, instanceType: "Standard_B2s", vCPU: 2, memory: "4GB", pricePerHour: 0.0416, affiliateUrl: "https://azure.microsoft.com/en-us/pricing/" },
      { provider: "azure" as CloudProvider, instanceType: "Standard_B4ms", vCPU: 4, memory: "16GB", pricePerHour: 0.166, affiliateUrl: "https://azure.microsoft.com/en-us/pricing/" },
      { provider: "azure" as CloudProvider, instanceType: "Standard_D2s_v5", vCPU: 2, memory: "8GB", pricePerHour: 0.096, affiliateUrl: "https://azure.microsoft.com/en-us/pricing/" },
    ],
  },
  {
    id: "oracle" as CloudProvider,
    name: "Oracle Cloud",
    logo: "🟠",
    description: "Oracle Cloud Infrastructure (OCI)",
    docsUrl: "https://docs.oracle.com/en-us/iaas/",
    affiliateUrl: "https://www.oracle.com/cloud/free/",
    affiliateCode: "6thagent-oci-20",
    regions: ["us-ashburn-1", "us-phoenix-1", "eu-frankfurt-1", "uk-london-1"],
    instances: [
      { provider: "oracle" as CloudProvider, instanceType: "VM.Standard.E2.1.Micro", vCPU: 1, memory: "1GB", pricePerHour: 0, affiliateUrl: "https://www.oracle.com/cloud/pricing/" },
      { provider: "oracle" as CloudProvider, instanceType: "VM.Standard.E4.Flex", vCPU: 4, memory: "32GB", pricePerHour: 0.128, affiliateUrl: "https://www.oracle.com/cloud/pricing/" },
      { provider: "oracle" as CloudProvider, instanceType: "VM.Standard3.Flex", vCPU: 8, memory: "64GB", pricePerHour: 0.512, affiliateUrl: "https://www.oracle.com/cloud/pricing/" },
    ],
  },
  {
    id: "aws" as CloudProvider,
    name: "AWS",
    logo: "🟡",
    description: "Amazon Web Services",
    docsUrl: "https://docs.aws.amazon.com/",
    affiliateUrl: "https://aws.amazon.com/free/",
    affiliateCode: "6thagent-aws-20",
    regions: ["us-east-1", "us-west-2", "eu-west-1", "eu-central-1", "ap-southeast-1"],
    instances: [
      { provider: "aws" as CloudProvider, instanceType: "t3.micro", vCPU: 2, memory: "1GB", pricePerHour: 0.0104, affiliateUrl: "https://aws.amazon.com/ec2/pricing/" },
      { provider: "aws" as CloudProvider, instanceType: "t3.medium", vCPU: 2, memory: "4GB", pricePerHour: 0.0416, affiliateUrl: "https://aws.amazon.com/ec2/pricing/" },
      { provider: "aws" as CloudProvider, instanceType: "t3.large", vCPU: 2, memory: "8GB", pricePerHour: 0.0832, affiliateUrl: "https://aws.amazon.com/ec2/pricing/" },
    ],
  },
]

export function getAffiliateUrl(provider: CloudProvider): string {
  const p = CLOUD_PROVIDERS.find((c) => c.id === provider)
  return p?.affiliateUrl || ""
}

export function getAffiliateCode(provider: CloudProvider): string {
  const p = CLOUD_PROVIDERS.find((c) => c.id === provider)
  return p?.affiliateCode || ""
}
