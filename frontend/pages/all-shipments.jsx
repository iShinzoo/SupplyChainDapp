import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../utils/Tracking.json";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion } from 'framer-motion';

export default function AllShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const CONTRACT_ADDRESS = "0x4EC17E231FEC4e133c3f58Ac94B549dD40Db0599";
  const CONTRACT_ABI = abi.abi;
  const RPC_URL ="https://eth-sepolia.g.alchemy.com/v2/6XQcBMl2mEp46Yh3_ncrSbNcHwJ2lG9j";

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const data = await contract.getAllTransaction();
      
      const formattedData = data.map(shipment => ({
        sender: shipment.sender,
        receiver: shipment.receiver,
        pickupTime: shipment.pickupTime.toNumber(),
        deliveryTime: shipment.deliveryTime.toNumber(),
        distance: shipment.distance.toNumber(),
        price: ethers.utils.formatEther(shipment.price),
        status: shipment.status,
        ispaid: shipment.ispaid
      }));
      
      setShipments(formattedData);
    } catch (error) {
      toast.error("Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">All Shipments</h1>
          
          {shipments.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No shipments found. Create your first shipment!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shipments.map((shipment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/shipments/${index}`}>
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${statusColors[shipment.status]}`}>
                          {ShipmentStatus[shipment.status]}
                        </span>
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">From</p>
                          <p className="font-medium">{shortAddress(shipment.sender)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">To</p>
                          <p className="font-medium">{shortAddress(shipment.receiver)}</p>
                        </div>
                        <div className="flex justify-between pt-2">
                          <div>
                            <p className="text-sm text-gray-500">Distance</p>
                            <p className="font-medium">{shipment.distance} km</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Price</p>
                            <p className="font-medium">{shipment.price} ETH</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const statusColors = {
  0: 'bg-yellow-100 text-yellow-800',
  1: 'bg-blue-100 text-blue-800',
  2: 'bg-green-100 text-green-800'
};

const shortAddress = (addr) => `${addr?.slice(0, 6)}...${addr?.slice(-4)}`;
const ShipmentStatus = ["Pending", "In Transit", "Delivered"];