"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { CanvasBuilder } from "@/components/canvas/CanvasBuilder"

export default function CanvasPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-10rem)]">
        <CanvasBuilder />
      </div>
    </DashboardLayout>
  )
}
