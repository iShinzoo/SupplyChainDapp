"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getInventoryContract, getShipmentContract, type Product } from "@/lib/contracts"
import { ethers } from "ethers"
import { Plus, Trash, Package, Truck } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PageHeader } from "@/components/page-header"

export default function CreateShipmentPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [receiverAddress, setReceiverAddress] = useState("")
  const [selectedItems, setSelectedItems] = useState<{ productId: number; quantity: number }[]>([])
  \
  const [isSubmitting, setIsSubmitting(false
  )

  const router = useRouter()
  const { toast } = useToast()

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const contract = await getInventoryContract(false)
      const count = await contract.productCount()

      const productList: Product[] = []
      for (let i = 1; i <= count; i++) {
        const [name, description, quantity] = await contract.getProduct(i)
        productList.push({
          id: i,
          name,
          description,
          quantity: Number(quantity),
        })
      }

      setProducts(productList)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to fetch products from the blockchain",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const addItem = () => {
    setSelectedItems([...selectedItems, { productId: 0, quantity: 1 }])
  }

  const removeItem = (index: number) => {
    const newItems = [...selectedItems]
    newItems.splice(index, 1)
    setSelectedItems(newItems)
  }

  const updateItem = (index: number, field: "productId" | "quantity", value: number) => {
    const newItems = [...selectedItems]
    newItems[index][field] = value
    setSelectedItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!ethers.isAddress(receiverAddress)) {
      toast({
        title: "Invalid address",
        description: "Please enter a valid Ethereum address",
        variant: "destructive",
      })
      return
    }

    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please add at least one item to the shipment",
        variant: "destructive",
      })
      return
    }

    // Check if all items have valid product IDs and quantities
    const invalidItem = selectedItems.find((item) => item.productId === 0 || item.quantity <= 0)
    if (invalidItem) {
      toast({
        title: "Invalid item",
        description: "Please select a product and enter a valid quantity for all items",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const contract = await getShipmentContract()

      // Prepare arrays for contract call
      const productIds = selectedItems.map((item) => item.productId)
      const quantities = selectedItems.map((item) => item.quantity)

      const tx = await contract.createShipment(receiverAddress, productIds, quantities)
      await tx.wait()

      toast({
        title: "Shipment created",
        description: "Your shipment has been created successfully",
      })

      router.push("/shipments")
    } catch (error) {
      console.error("Error creating shipment:", error)
      toast({
        title: "Error",
        description: "Failed to create shipment on the blockchain",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getProductName = (productId: number) => {
    const product = products.find((p) => p.id === productId)
    return product ? product.name : "Select a product"
  }

  return (
    <motion.div
      className="container mx-auto px-4 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader title="Create New Shipment" backHref="/shipments" backLabel="Back to Shipments" />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="mr-2 h-5 w-5" />
            Shipment Details
          </CardTitle>
          <CardDescription>Create a new shipment by selecting products from your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="create-shipment-form" className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="receiver">Receiver Address</Label>
              <Input
                id="receiver"
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
                placeholder="0x..."
                required
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Enter the Ethereum address of the shipment receiver</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Shipment Items</Label>
                <Button type="button" variant="outline" onClick={addItem} size="sm" className="h-8">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {selectedItems.length === 0 ? (
                <div className="text-center p-8 border rounded-lg mt-2 bg-muted/50">
                  <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No items added yet. Add an item to continue.</p>
                </div>
              ) : (
                <div className="space-y-4 mt-2">
                  {selectedItems.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-end gap-4 p-4 border rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex-1">
                        <Label htmlFor={`product-${index}`} className="mb-2 block">
                          Product
                        </Label>
                        <Select
                          value={item.productId.toString()}
                          onValueChange={(value) => updateItem(index, "productId", Number.parseInt(value))}
                        >
                          <SelectTrigger id={`product-${index}`}>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name} ({product.quantity} available)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-full sm:w-24">
                        <Label htmlFor={`quantity-${index}`} className="mb-2 block">
                          Quantity
                        </Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value))}
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="mt-2 sm:mt-0 flex-shrink-0"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {selectedItems.length > 0 && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-medium mb-2">Shipment Summary</h3>
                <ul className="space-y-1 text-sm">
                  {selectedItems.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.productId > 0 ? getProductName(item.productId) : "Unselected product"}</span>
                      <span className="font-medium">{item.quantity} units</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end border-t pt-4">
          <Link href="/shipments" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading || selectedItems.length === 0}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Creating..." : "Create Shipment"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
