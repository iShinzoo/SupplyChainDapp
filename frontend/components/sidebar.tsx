"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Package, Truck, BarChart3, Home } from "lucide-react"
import { motion } from "framer-motion"

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    color: "text-black dark:text-white",
  },
  {
    label: "Inventory",
    icon: Package,
    href: "/inventory",
    color: "text-black dark:text-white",
  },
  {
    label: "Shipments",
    icon: Truck,
    href: "/shipments",
    color: "text-black dark:text-white",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    color: "text-black dark:text-white",
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  const sidebarVariants = {
    hidden: { x: -40, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 100,
      },
    }),
  }

  return (
    <motion.div
      className="hidden md:flex h-full w-[240px] flex-col border-r bg-background p-3"
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
    >
      <div className="space-y-1 py-4">
        {routes.map((route, i) => (
          <motion.div key={route.href} custom={i} variants={itemVariants} initial="hidden" animate="visible">
            <Link
              href={route.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                pathname === route.href ? "bg-black text-white dark:bg-white dark:text-black" : "transparent",
              )}
            >
              <route.icon className={cn("mr-3 h-5 w-5", route.color)} />
              {route.label}
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
