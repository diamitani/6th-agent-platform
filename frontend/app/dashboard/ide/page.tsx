"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { MiniIDE } from "@/components/ide/MiniIDE"

export default function IDEPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-10rem)]">
        <MiniIDE />
      </div>
    </DashboardLayout>
  )
}
