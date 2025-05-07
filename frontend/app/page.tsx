"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Package2, Truck, BarChart3, ArrowRight, Wallet, ChevronDown } from "lucide-react"
import Image from "next/image"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function LandingPage() {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setAccount(accounts[0])
          }
        } catch (error) {
          console.error("Error checking connection:", error)
        }
      }
    }

    checkConnection()
  }, [])

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not detected",
        description: "Please install MetaMask to use this application",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      setAccount(accounts[0])
      toast({
        title: "Wallet connected",
        description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
      })

      // Redirect to dashboard after successful connection
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection failed",
        description: "Failed to connect to your wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black z-10"></div>
          <div className="absolute inset-0 bg-[url('/blockchain-bg.svg')] bg-cover opacity-20 z-0"></div>
        </div>

        <div className="container mx-auto px-4 py-6 relative z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Package2 className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl">BlockChain Supply Chain</span>
            </div>
            <ConnectButton showBalance={false} accountStatus="address" />
          </div>
        </div>

        <motion.div
          className="container mx-auto px-4 pt-20 pb-32 relative z-20"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 className="text-5xl md:text-7xl font-bold mb-6" variants={itemVariants}>
            Blockchain-Powered <br />
            Supply Chain Management
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl" variants={itemVariants}>
            Transparent, secure, and efficient inventory and shipment tracking on the blockchain.
          </motion.p>
          <motion.div variants={itemVariants}>
            <ConnectButton showBalance={false} chainStatus="icon" />
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 flex justify-center pb-8 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <ChevronDown className="h-8 w-8 animate-bounce" />
        </motion.div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white text-black">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides comprehensive tools for managing your supply chain on the blockchain.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div
              className="bg-gray-100 p-8 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -10, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <Package2 className="h-12 w-12 mb-6 text-black" />
              <h3 className="text-2xl font-bold mb-4">Inventory Management</h3>
              <p className="text-gray-600 mb-6">
                Create, track, and manage your product inventory with real-time updates on the blockchain.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-black rounded-full mr-2"></div>
                  Add new products
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-black rounded-full mr-2"></div>
                  Update quantities
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-black rounded-full mr-2"></div>
                  Track inventory changes
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-gray-100 p-8 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -10, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <Truck className="h-12 w-12 mb-6 text-black" />
              <h3 className="text-2xl font-bold mb-4">Shipment Tracking</h3>
              <p className="text-gray-600 mb-6">
                Create shipments, update status, and track deliveries with immutable blockchain records.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-black rounded-full mr-2"></div>
                  Create new shipments
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-black rounded-full mr-2"></div>
                  Update shipment status
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-black rounded-full mr-2"></div>
                  View shipment details
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-gray-100 p-8 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -10, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <BarChart3 className="h-12 w-12 mb-6 text-black" />
              <h3 className="text-2xl font-bold mb-4">Analytics Dashboard</h3>
              <p className="text-gray-600 mb-6">
                Gain insights into your supply chain with comprehensive analytics and visualizations.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-black rounded-full mr-2"></div>
                  Inventory metrics
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-black rounded-full mr-2"></div>
                  Shipment statistics
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-black rounded-full mr-2"></div>
                  Performance tracking
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Our blockchain-based supply chain management system provides transparency and security at every step.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative h-[400px] rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <Image
                  src="/blockchain-diagram.svg"
                  alt="Blockchain Supply Chain Diagram"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
                    <p className="text-gray-400">
                      Connect your Ethereum wallet to access the platform and interact with smart contracts.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Manage Inventory</h3>
                    <p className="text-gray-400">
                      Add products to your inventory and track quantities with blockchain-verified records.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Create Shipments</h3>
                    <p className="text-gray-400">
                      Create shipments from your inventory items and assign them to receivers.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Track & Update</h3>
                    <p className="text-gray-400">
                      Track shipment status and update it as it moves through the supply chain.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white text-black">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Supply Chain?</h2>
            <p className="text-xl text-gray-600 mb-10">
              Connect your wallet now to start managing your inventory and shipments on the blockchain.
            </p>
            {account ? (
              <Button
                onClick={() => router.push("/dashboard")}
                size="lg"
                className="bg-black text-white hover:bg-gray-800"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={connectWallet}
                size="lg"
                className="bg-black text-white hover:bg-gray-800"
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet to Start"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-black text-white border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Package2 className="h-6 w-6 mr-2" />
              <span className="font-bold">BlockChain Supply Chain</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Blockchain Supply Chain. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
