import { ethers } from "ethers"
import InventoryABI from "@/lib/abis/Inventory.json"
import ShipmentABI from "@/lib/abis/ShipmentPart.json"

// Contract addresses
export const INVENTORY_ADDRESS = "0x9c0c101d811379Dd8d66D4E88531a218Fb13FCEC"
export const SHIPMENT_ADDRESS = "0xCdd43724cb2502e8A704C488a00DFe2A92d5606A"

// Get provider
export const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum)
  }
  throw new Error("Ethereum provider not found")
}

// Get signer
export const getSigner = async () => {
  const provider = getProvider()
  return await provider.getSigner()
}

// Get Inventory contract
export const getInventoryContract = async (withSigner = true) => {
  if (withSigner) {
    const signer = await getSigner()
    return new ethers.Contract(INVENTORY_ADDRESS, InventoryABI.abi, signer)
  } else {
    const provider = getProvider()
    return new ethers.Contract(INVENTORY_ADDRESS, InventoryABI.abi, provider)
  }
}

// Get Shipment contract
export const getShipmentContract = async (withSigner = true) => {
  if (withSigner) {
    const signer = await getSigner()
    return new ethers.Contract(SHIPMENT_ADDRESS, ShipmentABI.abi, signer)
  } else {
    const provider = getProvider()
    return new ethers.Contract(SHIPMENT_ADDRESS, ShipmentABI.abi, provider)
  }
}

// Inventory types
export interface Product {
  id: number
  name: string
  description: string
  quantity: number
}

// Shipment types
export enum ShipmentStatus {
  Pending = 0,
  InTransit = 1,
  Delivered = 2,
}

export interface ShipmentItem {
  productId: number
  quantity: number
}

export interface TrackingInfo {
  currentLocation: string
  locationHistory: string[]
  locationTimestamps: number[]
  notes: string
  distance: number
  isPaid: boolean
}

export interface Shipment {
  shipmentId: number
  sender: string
  receiver: string
  items: ShipmentItem[]
  status: ShipmentStatus
  creationTime: number
  deliveryTime: number
  tracking: TrackingInfo
}
