import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from '../utils/ShipmentPart.json';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import InventoryManager from '../components/InventoryManager';
import ShipmentCreator from '../components/ShipmentCreator';
import { ConnectButton } from "@rainbow-me/rainbowkit";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-gray-900">
    <div className="relative w-24 h-24">
      <div className="absolute w-full h-full border-4 border-gray-700 rounded-full" />
      <motion.div
        className="absolute w-full h-full border-4 border-t-blue-500 border-r-purple-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-gray-400 text-sm">Loading</div>
      </motion.div>
    </div>
  </div>
);

export default function Home() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    receiver: '',
    distance: '',
    price: ''
  });
  const [userProfile, setUserProfile] = useState(null);
  const [showInventory, setShowInventory] = useState(true);
  const [showShipment, setShowShipment] = useState(false);
  
  const CONTRACT_ADDRESS = "0xCdd43724cb2502e8A704C488a00DFe2A92d5606A";
  const CONTRACT_ABI = abi.abi;

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if wallet is connected and has accounts
        if (!window.ethereum) {
          setLoading(false);
          return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (!accounts || accounts.length === 0) {
          setLoading(false);
          return;
        }
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        setLoading(false);

        // Load user profile
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setUserProfile({ address });
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
        setLoading(false);
      }
    };
    
    if (window.ethereum) {
      loadData();
    }

    return () => {};
  }, []);

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    try {
      const priceWei = ethers.utils.parseEther(formData.price);
      // Remove getAllTransaction logic
      const tx = await contract.CreateShipment(
        formData.receiver,
        Date.now(),
        formData.distance,
        priceWei,
        { value: priceWei }
      );
      
      await tx.wait();
      toast.success('Shipment created successfully!');
      setIsOpen(false);
      setFormData({ receiver: '', distance: '', price: '' });
      
      // Refresh data (no getAllTransaction)
      setShipments([]);
      
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error(error.message || 'Transaction failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-100">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative container mx-auto p-6">
        <div className="flex justify-end mb-4">
          <ConnectButton />
        </div>
        <div className="flex gap-4 mb-8">
          <button
            className={`px-4 py-2 rounded ${showInventory ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => { setShowInventory(true); setShowShipment(false); }}
          >
            Inventory Management
          </button>
          <button
            className={`px-4 py-2 rounded ${showShipment ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => { setShowInventory(false); setShowShipment(true); }}
          >
            Create Shipment
          </button>
        </div>
        {showInventory && <InventoryManager />}
        {showShipment && <ShipmentCreator />}
      </motion.div>
    </div>
  );
}

// Updated helper functions
const getStatusStyles = (status) => {
  const styles = {
    0: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    1: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    2: 'bg-green-500/20 text-green-300 border border-green-500/30'
  };
  return styles[status];
};

const ShipmentStatus = ['Pending', 'In Transit', 'Delivered'];

const shortAddress = (addr) => {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};