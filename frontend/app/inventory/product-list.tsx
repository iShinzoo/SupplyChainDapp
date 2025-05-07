"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Save, X } from "lucide-react"
import type { Product } from "@/lib/contracts"

interface ProductListProps {
  products: Product[]
  isLoading: boolean
  onUpdateQuantity: (productId: number, newQuantity: number) => void
}

export default function ProductList({ products, isLoading, onUpdateQuantity }: ProductListProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editQuantity, setEditQuantity] = useState<number>(0)

  const startEditing = (product: Product) => {
    setEditingId(product.id)
    setEditQuantity(product.quantity)
  }

  const cancelEditing = () => {
    setEditingId(null)
  }

  const saveQuantity = (productId: number) => {
    onUpdateQuantity(productId, editQuantity)
    setEditingId(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="text-lg font-medium">No products found</h3>
        <p className="text-muted-foreground">Add your first product to get started.</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.id}</TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.description}</TableCell>
              <TableCell>
                {editingId === product.id ? (
                  <Input
                    type="number"
                    min="0"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(Number.parseInt(e.target.value))}
                    className="w-24"
                  />
                ) : (
                  product.quantity
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingId === product.id ? (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={cancelEditing}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => saveQuantity(product.id)}>
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => startEditing(product)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
