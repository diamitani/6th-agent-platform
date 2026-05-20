"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { CloudDeployWizard } from "@/components/cloud/CloudDeployWizard"

export default function DeployPage() {
  return (
    <DashboardLayout>
      <CloudDeployWizard />
    </DashboardLayout>
  )
}
