"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getInventoryContract, type Product } from "@/lib/contracts"
import AddProductForm from "./add-product-form"
import ProductList from "./product-list"
import { motion } from "framer-motion"
import { PageHeader } from "@/components/page-header"

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
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

  const handleAddProduct = async (name: string, description: string, quantity: number) => {
    try {
      const contract = await getInventoryContract()
      const tx = await contract.addProduct(name, description, quantity)
      await tx.wait()

      toast({
        title: "Product added",
        description: "Your product has been added to the inventory",
      })

      setShowAddForm(false)
      fetchProducts()
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "Failed to add product to the blockchain",
        variant: "destructive",
      })
    }
  }

  const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
    try {
      const contract = await getInventoryContract()
      const tx = await contract.updateProductQuantity(productId, newQuantity)
      await tx.wait()

      toast({
        title: "Quantity updated",
        description: "Product quantity has been updated",
      })

      fetchProducts()
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast({
        title: "Error",
        description: "Failed to update product quantity",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div
      className="container mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader title="Inventory Management" backHref="/dashboard" backLabel="Back to Dashboard">
        <Button onClick={() => fetchProducts()} variant="outline" disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </PageHeader>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="mb-6 border-2 border-primary shadow-sm">
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
            </CardHeader>
            <CardContent>
              <AddProductForm onSubmit={handleAddProduct} onCancel={() => setShowAddForm(false)} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductList products={products} isLoading={isLoading} onUpdateQuantity={handleUpdateQuantity} />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
