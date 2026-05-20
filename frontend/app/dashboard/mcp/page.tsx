"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { MCPIntegrationHub } from "@/components/mcp-hub/MCPIntegrationHub"

export default function MCPSettingsPage() {
  return (
    <DashboardLayout>
      <MCPIntegrationHub />
    </DashboardLayout>
  )
}
