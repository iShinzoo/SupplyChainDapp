import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../utils/Tracking.json";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function AllShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const CONTRACT_ADDRESS = "0x4EC17E231FEC4e133c3f58Ac94B549dD40Db0599";
  const CONTRACT_ABI = abi.abi;
  const RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/6XQcBMl2mEp46Yh3_ncrSbNcHwJ2lG9j";

  useEffect(() => {
    const loadShipments = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          provider
        );

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
        console.error("Error loading shipments:", error);
        toast.error("Failed to load shipments");
      } finally {
        setLoading(false);
      }
    };
    
    loadShipments();
  }, []);

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">All Shipments</h1>
        {shipments.length === 0 ? (
          <div className="text-center text-gray-500">
            No shipments found. Create one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shipments.map((shipment, index) => (
              <ShipmentCard key={index} shipment={shipment} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ShipmentCard = ({ shipment, index }) => {
  const statusColors = {
    0: "bg-yellow-100 text-yellow-800",
    1: "bg-blue-100 text-blue-800",
    2: "bg-green-100 text-green-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            statusColors[shipment.status]
          }`}
        >
          {ShipmentStatus[shipment.status]}
        </span>
        <Link 
          href={`/shipments/${index}`}
          className="text-indigo-600 hover:text-indigo-800"
        >
          View Details →
        </Link>
      </div>
      <div className="space-y-2">
        <p className="text-gray-600">From: {shortAddress(shipment.sender)}</p>
        <p className="text-gray-600">To: {shortAddress(shipment.receiver)}</p>
        <p className="text-gray-600">Price: {shipment.price} ETH</p>
        <p className="text-gray-600">Distance: {shipment.distance} km</p>
        <p className="text-gray-600">
          Status: {ShipmentStatus[shipment.status]}
        </p>
      </div>
    </div>
  );
};

const shortAddress = (addr) => `${addr?.slice(0, 6)}...${addr?.slice(-4)}`;
const ShipmentStatus = ["Pending", "In Transit", "Delivered"];