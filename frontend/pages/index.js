import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from '../utils/Tracking.json';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';

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
  
  const CONTRACT_ADDRESS = "0x4EC17E231FEC4e133c3f58Ac94B549dD40Db0599";
  const CONTRACT_ABI = abi.abi;

  useEffect(() => {
    if (!isConnected) {
      router.push('/landing');
    }
  }, [isConnected, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if wallet is connected
        if (!window.ethereum || !window.ethereum.selectedAddress) {
          setLoading(false);
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const data = await contract.getAllTransaction();
        
        const formatted = data.map(s => ({
          ...s,
          pickupTime: s.pickupTime.toNumber(),
          deliveryTime: s.deliveryTime.toNumber(),
          price: ethers.utils.formatEther(s.price)
        }));
        
        setShipments(formatted);
        setLoading(false);

        // Load user profile
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const count = await contract.getShipmentCount(address);
        setUserProfile({ address, shipmentCount: count.toNumber() });
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
        setLoading(false);
      }
    };
    
    // Add event listener for account changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        loadData();
      } else {
        setShipments([]);
        setUserProfile(null);
        toast('Wallet disconnected');
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      loadData();
    }

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    try {
      const priceWei = ethers.utils.parseEther(formData.price);
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
      
      // Refresh data
      const data = await contract.getAllTransaction();
      const formatted = data.map(s => ({
        ...s,
        pickupTime: s.pickupTime.toNumber(),
        deliveryTime: s.deliveryTime.toNumber(),
        price: ethers.utils.formatEther(s.price)
      }));
      setShipments(formatted);
      
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error(error.message || 'Transaction failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-100">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative container mx-auto p-6"
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {userProfile && (
            <AnimatePresence>
              {[
                {
                  title: 'Your Address',
                  value: shortAddress(userProfile.address),
                  icon: '👤',
                  gradient: 'from-blue-500 to-blue-600'
                },
                {
                  title: 'Total Shipments',
                  value: userProfile.shipmentCount,
                  icon: '📦',
                  gradient: 'from-purple-500 to-purple-600'
                },
                {
                  title: 'Completed',
                  value: shipments.filter(s => s.status === 2).length,
                  icon: '✅',
                  gradient: 'from-green-500 to-green-600'
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-xl blur-lg opacity-25 group-hover:opacity-40 transition duration-300`} />
                  <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">{stat.title}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <div className="text-2xl">{stat.icon}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[
            {
              title: 'Create New Shipment',
              gradient: 'from-purple-500 to-pink-500',
              href: '/create',
              icon: '🚀'
            },
            {
              title: 'View All Shipments',
              gradient: 'from-blue-500 to-indigo-500',
              href: '/all-shipments',
              icon: '📊'
            }
          ].map((action, index) => (
            <Link key={action.title} href={action.href}>
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} rounded-xl blur-lg opacity-25 group-hover:opacity-40 transition duration-300`} />
                <div className="relative overflow-hidden rounded-xl bg-gray-800/50 backdrop-blur-xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{action.title}</span>
                    <span className="text-2xl">{action.icon}</span>
                  </div>
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                  />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Shipments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-25" />
          <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-gray-700/50">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Recent Shipments
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700/20">
                    <th className="px-6 py-4 text-left text-gray-400 font-medium">ID</th>
                    <th className="px-6 py-4 text-left text-gray-400 font-medium">Sender</th>
                    <th className="px-6 py-4 text-left text-gray-400 font-medium">Receiver</th>
                    <th className="px-6 py-4 text-left text-gray-400 font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-gray-400 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {shipments.map((shipment, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors"
                      >
                        <td className="px-6 py-4">#{index + 1}</td>
                        <td className="px-6 py-4">{shortAddress(shipment.sender)}</td>
                        <td className="px-6 py-4">{shortAddress(shipment.receiver)}</td>
                        <td className="px-6 py-4">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusStyles(shipment.status)}`}
                          >
                            {ShipmentStatus[shipment.status]}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {shipment.price} ETH
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Create Shipment Modal - styling updated for dark theme */}
        <Dialog 
          open={isOpen} 
          onClose={() => setIsOpen(false)} 
          className="fixed inset-0 z-10 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen px-4">
            <Dialog.Overlay className="fixed inset-0 bg-black/60" />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 border border-gray-700"
            >
              <h2 className="text-2xl font-bold mb-6 text-white">Create New Shipment</h2>
              
              <form onSubmit={handleCreateShipment} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Receiver Address</label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    placeholder="0x..."
                    value={formData.receiver}
                    onChange={e => setFormData({...formData, receiver: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Distance (km)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    placeholder="Enter distance in kilometers"
                    value={formData.distance}
                    onChange={e => setFormData({...formData, distance: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Shipping Price (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    placeholder="Enter price in ETH"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors"
                  >
                    Create Shipment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </Dialog>
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