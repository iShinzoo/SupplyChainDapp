"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getInventoryContract, getShipmentContract, type Shipment, ShipmentStatus, type Product } from "@/lib/contracts"
import { Truck, Package, Calendar, User, CheckCircle, Clock, MapPin, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/page-header"

export default function ShipmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [shipmentItems, setShipmentItems] = useState<{ productId: number; quantity: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const shipmentId = Number(params.id)

  const fetchShipmentData = async () => {
    setIsLoading(true)
    try {
      const contract = await getShipmentContract(false)
      const inventoryContract = await getInventoryContract(false)

      // Get basic shipment data
      const shipmentData = await contract.shipments(shipmentId)

      // Get shipment items
      const [id, sender, receiver, status, creationTime, deliveryTime, items] = await contract.getShipment(shipmentId)

      // Create shipment object
      const shipmentObj: Shipment = {
        shipmentId: Number(shipmentData.shipmentId),
        sender: shipmentData.sender,
        receiver: shipmentData.receiver,
        status: Number(shipmentData.status),
        creationTime: Number(shipmentData.creationTime),
        deliveryTime: Number(shipmentData.deliveryTime),
        items: items.map((item: any) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
        })),
        tracking: {
          currentLocation: "Warehouse #5",
          locationHistory: ["Origin Warehouse", "Distribution Center", "Warehouse #5"],
          locationTimestamps: [
            Number(shipmentData.creationTime),
            Number(shipmentData.creationTime) + 86400,
            Number(shipmentData.creationTime) + 172800,
          ],
          notes: "On schedule for delivery",
          distance: 150,
          isPaid: true,
        },
      }

      setShipment(shipmentObj)

      // Fetch product details for each item in the shipment
      const productCount = await inventoryContract.productCount()
      const productList: Product[] = []

      for (let i = 1; i <= productCount; i++) {
        const [name, description, quantity] = await inventoryContract.getProduct(i)
        productList.push({
          id: i,
          name,
          description,
          quantity: Number(quantity),
        })
      }

      setProducts(productList)

      // Match products with shipment items
      if (shipmentObj.items && shipmentObj.items.length > 0) {
        const itemsWithNames = shipmentObj.items.map((item) => {
          const product = productList.find((p) => p.id === item.productId)
          return {
            productId: item.productId,
            quantity: item.quantity,
            name: product ? product.name : `Product #${item.productId}`,
          }
        })
        setShipmentItems(itemsWithNames)
      }
    } catch (error) {
      console.error("Error fetching shipment:", error)
      toast({
        title: "Error",
        description: "Failed to fetch shipment details from the blockchain",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (shipmentId) {
      fetchShipmentData()
    }
  }, [shipmentId])

  const updateStatus = async (newStatus: ShipmentStatus) => {
    setIsUpdating(true)
    try {
      const contract = await getShipmentContract()
      const tx = await contract.updateShipmentStatus(shipmentId, newStatus)
      await tx.wait()

      toast({
        title: "Status updated",
        description: "Shipment status has been updated successfully",
      })

      fetchShipmentData()
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update shipment status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.Pending:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-300">
            Pending
          </Badge>
        )
      case ShipmentStatus.InTransit:
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-300">
            In Transit
          </Badge>
        )
      case ShipmentStatus.Delivered:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">
            Delivered
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.Pending:
        return <Clock className="h-5 w-5 text-yellow-500" />
      case ShipmentStatus.InTransit:
        return <Truck className="h-5 w-5 text-blue-500" />
      case ShipmentStatus.Delivered:
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp * 1000).toLocaleString()
  }

  const getProgressValue = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.Pending:
        return 33
      case ShipmentStatus.InTransit:
        return 66
      case ShipmentStatus.Delivered:
        return 100
      default:
        return 0
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="container mx-auto px-4 text-center p-8">
        <h3 className="text-lg font-medium">Shipment not found</h3>
        <p className="text-muted-foreground">The requested shipment could not be found.</p>
        <Link href="/shipments">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shipments
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      className="container mx-auto px-4 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader title={`Shipment #${shipmentId}`} backHref="/shipments" backLabel="Back to Shipments">
        <div className="flex items-center gap-2">
          {getStatusBadge(shipment.status)}
          {shipment.status === ShipmentStatus.Pending && (
            <Button size="sm" onClick={() => updateStatus(ShipmentStatus.InTransit)} disabled={isUpdating}>
              Mark as In Transit
            </Button>
          )}
          {shipment.status === ShipmentStatus.InTransit && (
            <Button size="sm" onClick={() => updateStatus(ShipmentStatus.Delivered)} disabled={isUpdating}>
              Mark as Delivered
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Shipment Progress */}
      <Card className="mb-6 shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between mb-2 text-sm">
              <span>Created</span>
              <span>In Transit</span>
              <span>Delivered</span>
            </div>
            <Progress value={getProgressValue(shipment.status)} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatDate(shipment.creationTime)}</span>
              <span>
                {shipment.status >= ShipmentStatus.InTransit ? formatDate(shipment.creationTime + 86400) : "Pending"}
              </span>
              <span>
                {shipment.status === ShipmentStatus.Delivered ? formatDate(shipment.deliveryTime) : "Pending"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 w-full">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Shipment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Shipment ID</p>
                      <p>{shipment.shipmentId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(shipment.status)}
                        <span>{getStatusBadge(shipment.status)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created</p>
                      <p>{formatDate(shipment.creationTime)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                      <p>
                        {shipment.status === ShipmentStatus.Delivered ? formatDate(shipment.deliveryTime) : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Parties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sender</p>
                    <p className="font-mono text-sm break-all">{shipment.sender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Receiver</p>
                    <p className="font-mono text-sm break-all">{shipment.receiver}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Shipment Items
              </CardTitle>
              <CardDescription>Products included in this shipment</CardDescription>
            </CardHeader>
            <CardContent>
              {shipmentItems && shipmentItems.length > 0 ? (
                <div className="space-y-4">
                  {shipmentItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="mb-2 sm:mb-0">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <Package className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Product ID: {item.productId}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="ml-auto">
                          Quantity: {item.quantity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-muted-foreground">No items available for this shipment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Tracking Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Current Location</p>
                  <div className="flex items-center p-3 border rounded-lg">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    <span>{shipment.tracking.currentLocation || "Unknown"}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Location History</p>
                  <div className="space-y-4">
                    {shipment.tracking.locationHistory && shipment.tracking.locationHistory.length > 0 ? (
                      shipment.tracking.locationHistory.map((location, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex flex-col items-center mr-4">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {index === 0 ? (
                                <Package className="h-4 w-4" />
                              ) : index === shipment.tracking.locationHistory.length - 1 ? (
                                <MapPin className="h-4 w-4" />
                              ) : (
                                <Truck className="h-4 w-4" />
                              )}
                            </div>
                            {index < shipment.tracking.locationHistory.length - 1 && (
                              <div className="h-10 w-0.5 bg-border mt-1"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{location}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(shipment.tracking.locationTimestamps[index])}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-muted-foreground">No tracking history available</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                  <div className="p-3 border rounded-lg">
                    <p>{shipment.tracking.notes || "No notes available"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
