import type React from "react"
import Navbar from "@/components/navbar"
import Sidebar from "@/components/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <ScrollArea className="flex-1">
          <main className="flex-1 p-6 pt-6">{children}</main>
        </ScrollArea>
      </div>
    </div>
  )
}
