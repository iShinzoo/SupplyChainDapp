"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getShipmentContract, type Shipment, type ShipmentStatus } from "@/lib/contracts"
import Link from "next/link"
import ShipmentList from "./shipment-list"
import { motion } from "framer-motion"
import { PageHeader } from "@/components/page-header"

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchShipments = async () => {
    setIsLoading(true)
    try {
      const contract = await getShipmentContract(false)
      const count = await contract.shipmentCount()

      const shipmentList: Shipment[] = []
      for (let i = 1; i <= count; i++) {
        try {
          const shipmentData = await contract.shipments(i)

          // Create a basic shipment object from the data
          const shipment: Shipment = {
            shipmentId: Number(shipmentData.shipmentId),
            sender: shipmentData.sender,
            receiver: shipmentData.receiver,
            status: Number(shipmentData.status),
            creationTime: Number(shipmentData.creationTime),
            deliveryTime: Number(shipmentData.deliveryTime),
            items: [],
            tracking: {
              currentLocation: "",
              locationHistory: [],
              locationTimestamps: [],
              notes: "",
              distance: 0,
              isPaid: false,
            },
          }

          shipmentList.push(shipment)
        } catch (error) {
          console.error(`Error fetching shipment ${i}:`, error)
        }
      }

      setShipments(shipmentList)
    } catch (error) {
      console.error("Error fetching shipments:", error)
      toast({
        title: "Error",
        description: "Failed to fetch shipments from the blockchain",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchShipments()
  }, [])

  const handleUpdateStatus = async (shipmentId: number, newStatus: ShipmentStatus) => {
    try {
      const contract = await getShipmentContract()
      const tx = await contract.updateShipmentStatus(shipmentId, newStatus)
      await tx.wait()

      toast({
        title: "Status updated",
        description: "Shipment status has been updated",
      })

      fetchShipments()
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update shipment status",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div
      className="container mx-auto px-4 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader
        title="Shipment Management"
        description="Track and manage your shipments"
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      >
        <Button onClick={() => fetchShipments()} variant="outline" disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Link href="/shipments/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Shipment
          </Button>
        </Link>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>All Shipments</CardTitle>
            <CardDescription>Manage and track your shipments</CardDescription>
          </CardHeader>
          <CardContent>
            <ShipmentList shipments={shipments} isLoading={isLoading} onUpdateStatus={handleUpdateStatus} />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
