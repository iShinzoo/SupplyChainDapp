import type React from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  backLabel?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, backHref, backLabel = "Back", children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b pb-4 pt-2">
      <div>
        {backHref && (
          <Link href={backHref}>
            <Button variant="outline" size="sm" className="mb-2 mt-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Button>
          </Link>
        )}
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">{children}</div>}
    </div>
  )
}
