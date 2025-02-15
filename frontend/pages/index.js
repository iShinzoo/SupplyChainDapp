import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from '../utils/Tracking.json';
import Link from 'next/link';

export default function Home() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const CONTRACT_ADDRESS = "0x4EC17E231FEC4e133c3f58Ac94B549dD40Db0599";
  const CONTRACT_ABI = abi.abi;
  const URL = "https://eth-sepolia.g.alchemy.com/v2/6XQcBMl2mEp46Yh3_ncrSbNcHwJ2lG9j";

  useEffect(() => {
    const loadShipments = async () => {
      try {
        // Verify environment variables
        if (!CONTRACT_ADDRESS || !URL) {
          throw new Error("Missing environment variables");
        }

        const provider = new ethers.providers.JsonRpcProvider(URL);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          provider
        );
        
        const data = await contract.getAllTransaction();
        setShipments(data);
      } catch (error) {
        console.error("Error loading shipments:", error);
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
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Latest Shipments</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shipments.map((shipment, index) => (
            <ShipmentCard key={index} shipment={shipment} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

const ShipmentCard = ({ shipment, index }) => {
  const statusColors = {
    0: 'bg-yellow-100 text-yellow-800',
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-green-100 text-green-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-sm ${statusColors[shipment.status]}`}>
          {ShipmentStatus[shipment.status]}
        </span>
        <Link href={`/shipments/${index}`} className="text-indigo-600 hover:text-indigo-800">
          View Details →
        </Link>
      </div>
      <div className="space-y-2">
        <p className="text-gray-600">From: {shortAddress(shipment.sender)}</p>
        <p className="text-gray-600">To: {shortAddress(shipment.receiver)}</p>
        <p className="text-gray-600">Price: {ethers.utils.formatEther(shipment.price)} ETH</p>
      </div>
    </div>
  );
};

const shortAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
const ShipmentStatus = ['Pending', 'In Transit', 'Delivered'];