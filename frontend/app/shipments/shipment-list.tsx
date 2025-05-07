"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Eye } from "lucide-react"
import { type Shipment, ShipmentStatus } from "@/lib/contracts"
import Link from "next/link"

interface ShipmentListProps {
  shipments: Shipment[]
  isLoading: boolean
  onUpdateStatus: (shipmentId: number, newStatus: ShipmentStatus) => void
}

export default function ShipmentList({ shipments, isLoading, onUpdateStatus }: ShipmentListProps) {
  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.Pending:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Pending
          </Badge>
        )
      case ShipmentStatus.InTransit:
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            In Transit
          </Badge>
        )
      case ShipmentStatus.Delivered:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Delivered
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp * 1000).toLocaleString()
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (shipments.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="text-lg font-medium">No shipments found</h3>
        <p className="text-muted-foreground">Create your first shipment to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead className="hidden md:table-cell">Sender</TableHead>
            <TableHead className="hidden md:table-cell">Receiver</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Created</TableHead>
            <TableHead className="hidden lg:table-cell">Delivered</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((shipment) => (
            <TableRow key={shipment.shipmentId}>
              <TableCell>{shipment.shipmentId}</TableCell>
              <TableCell className="hidden md:table-cell">{formatAddress(shipment.sender)}</TableCell>
              <TableCell className="hidden md:table-cell">{formatAddress(shipment.receiver)}</TableCell>
              <TableCell>{getStatusBadge(shipment.status)}</TableCell>
              <TableCell className="hidden sm:table-cell">{formatDate(shipment.creationTime)}</TableCell>
              <TableCell className="hidden lg:table-cell">{formatDate(shipment.deliveryTime)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/shipments/${shipment.shipmentId}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {shipment.status === ShipmentStatus.Pending && (
                        <DropdownMenuItem onClick={() => onUpdateStatus(shipment.shipmentId, ShipmentStatus.InTransit)}>
                          Mark as In Transit
                        </DropdownMenuItem>
                      )}
                      {shipment.status === ShipmentStatus.InTransit && (
                        <DropdownMenuItem onClick={() => onUpdateStatus(shipment.shipmentId, ShipmentStatus.Delivered)}>
                          Mark as Delivered
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
