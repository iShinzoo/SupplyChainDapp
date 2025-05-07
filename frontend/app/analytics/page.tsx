"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getInventoryContract, getShipmentContract, type Product, type Shipment, ShipmentStatus } from "@/lib/contracts"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Package, Truck, CheckCircle } from "lucide-react"
import { PageHeader } from "@/components/page-header"

export default function AnalyticsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch products
      const inventoryContract = await getInventoryContract(false)
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

      // Fetch shipments
      const shipmentContract = await getShipmentContract(false)
      const shipmentCount = await shipmentContract.shipmentCount()

      const shipmentList: Shipment[] = []
      for (let i = 1; i <= shipmentCount; i++) {
        try {
          const shipmentData = await shipmentContract.shipments(i)

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
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch data from the blockchain",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Prepare data for charts
  const inventoryData = products.map((product) => ({
    name: product.name,
    quantity: product.quantity,
  }))

  const statusCounts = {
    [ShipmentStatus.Pending]: 0,
    [ShipmentStatus.InTransit]: 0,
    [ShipmentStatus.Delivered]: 0,
  }

  shipments.forEach((shipment) => {
    statusCounts[shipment.status]++
  })

  const shipmentStatusData = [
    { name: "Pending", value: statusCounts[ShipmentStatus.Pending] },
    { name: "In Transit", value: statusCounts[ShipmentStatus.InTransit] },
    { name: "Delivered", value: statusCounts[ShipmentStatus.Delivered] },
  ]

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"]

  // Summary metrics
  const totalProducts = products.length
  const totalInventory = products.reduce((sum, product) => sum + product.quantity, 0)
  const totalShipments = shipments.length
  const completedShipments = statusCounts[ShipmentStatus.Delivered]

  if (isLoading) {
    return (
      <div className="container mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pb-8">
      <PageHeader
        title="Supply Chain Analytics"
        description="View metrics and insights about your supply chain"
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Package className="mr-2 h-4 w-4" />
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Package className="mr-2 h-4 w-4" />
              Total Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInventory}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Truck className="mr-2 h-4 w-4" />
              Total Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShipments}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              Completed Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedShipments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Inventory Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#8884d8" name="Quantity" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Shipment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={shipmentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {shipmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
