"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { WorkflowGuide } from "@/components/workflow/WorkflowGuide"

export default function GuidePage() {
  return (
    <DashboardLayout>
      <WorkflowGuide />
    </DashboardLayout>
  )
}
