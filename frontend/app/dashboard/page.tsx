"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Package, Truck, BarChart3, Clock, TrendingUp, AlertCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { getInventoryContract, getShipmentContract, type Product, type Shipment, ShipmentStatus } from "@/lib/contracts"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInventory: 0,
    totalShipments: 0,
    pendingShipments: 0,
    inTransitShipments: 0,
    deliveredShipments: 0,
  })
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

      // Calculate stats
      const totalProducts = productList.length
      const totalInventory = productList.reduce((sum, product) => sum + product.quantity, 0)
      const totalShipments = shipmentList.length
      const pendingShipments = shipmentList.filter((s) => s.status === ShipmentStatus.Pending).length
      const inTransitShipments = shipmentList.filter((s) => s.status === ShipmentStatus.InTransit).length
      const deliveredShipments = shipmentList.filter((s) => s.status === ShipmentStatus.Delivered).length

      setStats({
        totalProducts,
        totalInventory,
        totalShipments,
        pendingShipments,
        inTransitShipments,
        deliveredShipments,
      })
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp * 1000).toLocaleString()
  }

  // Get recent activities from products and shipments
  const getRecentActivities = () => {
    const activities = [
      ...shipments.map((shipment) => ({
        type: "shipment",
        id: shipment.shipmentId,
        status: shipment.status,
        timestamp: shipment.creationTime,
        title: `Shipment #${shipment.shipmentId} created`,
        description: `Status: ${getStatusText(shipment.status)}`,
      })),
      // Add more activities as needed
    ]

    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)
  }

  const getStatusText = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.Pending:
        return "Pending"
      case ShipmentStatus.InTransit:
        return "In Transit"
      case ShipmentStatus.Delivered:
        return "Delivered"
      default:
        return "Unknown"
    }
  }

  const getStatusIcon = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.Pending:
        return <Clock className="h-5 w-5" />
      case ShipmentStatus.InTransit:
        return <Truck className="h-5 w-5" />
      case ShipmentStatus.Delivered:
        return <Package className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pb-8">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold mb-2">Blockchain Supply Chain Dashboard</h1>
          <p className="text-muted-foreground mb-8">Manage your inventory and shipments on the blockchain</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Package className="mr-2 h-4 w-4" />
                  Total Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">Items in inventory</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Total Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalInventory}</div>
                <p className="text-xs text-muted-foreground mt-1">Units in stock</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Truck className="mr-2 h-4 w-4" />
                  Total Shipments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalShipments}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Pending Shipments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.pendingShipments}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-full shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Access key features of your supply chain</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      Inventory
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm mb-4">Manage your product inventory</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link href="/inventory" className="w-full">
                      <Button className="w-full group">
                        Go to Inventory
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Truck className="mr-2 h-5 w-5" />
                      Shipments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm mb-4">Track and manage shipments</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link href="/shipments" className="w-full">
                      <Button className="w-full group">
                        Go to Shipments
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm mb-4">View supply chain metrics</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link href="/analytics" className="w-full">
                      <Button className="w-full group">
                        View Analytics
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </CardContent>
            </Card>
          </motion.div>

          {/* Shipment Status */}
          <motion.div variants={itemVariants}>
            <Card className="h-full shadow-sm">
              <CardHeader>
                <CardTitle>Shipment Status</CardTitle>
                <CardDescription>Overview of all shipments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pending</span>
                    <span className="font-medium">{stats.pendingShipments}</span>
                  </div>
                  <Progress value={(stats.pendingShipments / stats.totalShipments) * 100 || 0} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>In Transit</span>
                    <span className="font-medium">{stats.inTransitShipments}</span>
                  </div>
                  <Progress value={(stats.inTransitShipments / stats.totalShipments) * 100 || 0} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Delivered</span>
                    <span className="font-medium">{stats.deliveredShipments}</span>
                  </div>
                  <Progress value={(stats.deliveredShipments / stats.totalShipments) * 100 || 0} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Link href="/shipments/create" className="w-full">
                  <Button className="w-full">
                    Create New Shipment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest supply chain activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getRecentActivities().length > 0 ? (
                  getRecentActivities().map((activity, index) => (
                    <Link href={`/shipments/${activity.id}`} key={index} className="block w-full">
                      <div className="flex items-center p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                          {getStatusIcon(activity.status)}
                        </div>
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                        <div className="ml-auto text-sm text-muted-foreground">{formatDate(activity.timestamp)}</div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No recent activities found</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <Button variant="outline" className="w-full sm:w-auto">
                View All Activities
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Low Stock Alert */}
        {products.some((p) => p.quantity < 10) && (
          <motion.div variants={itemVariants}>
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {products
                    .filter((p) => p.quantity < 10)
                    .map((product) => (
                      <div key={product.id} className="flex justify-between items-center">
                        <span>{product.name}</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          {product.quantity} units left
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/inventory" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Update Inventory
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
