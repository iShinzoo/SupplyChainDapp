import React, { useState } from 'react';
import { ethers } from 'ethers';
import abi from '../utils/ShipmentPart.json';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Truck, Package, CreditCard } from 'lucide-react';

export default function CreateShipment() {
  const [form, setForm] = useState({ receiver: '', distance: '', price: '' });
  const router = useRouter();
  const CONTRACT_ADDRESS = "0xCdd43724cb2502e8A704C488a00DFe2A92d5606A";
  const CONTRACT_ABI = abi.abi;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const priceWei = ethers.utils.parseEther(form.price);
      const tx = await contract.CreateShipment(
        form.receiver,
        Math.floor(Date.now() / 1000),
        form.distance,
        priceWei,
        { value: priceWei }
      );
      
      await tx.wait();
      toast.success('Shipment created successfully!');
      router.push('/');
    } catch (error) {
      toast.error(error.message || 'Failed to create shipment');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-100">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative container mx-auto p-6 max-w-2xl"
      >
        <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-25" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8">
            Create New Shipment
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">
                Receiver's Wallet Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-colors"
                  placeholder="0x..."
                  value={form.receiver}
                  onChange={(e) => setForm({ ...form, receiver: e.target.value })}
                />
                <Package className="absolute right-3 top-3 text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Distance (kilometers)
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-colors appearance-none"
                  placeholder="Enter distance"
                  value={form.distance}
                  onChange={(e) => setForm({ ...form, distance: e.target.value })}
                />
                <Truck className="absolute right-3 top-3 text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Price (ETH)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-colors appearance-none"
                  placeholder="Enter price in ETH"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                <CreditCard className="absolute right-3 top-3 text-gray-400" size={20} />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors font-medium"
            >
              Create Shipment
            </motion.button>
          </form>
        </div>
      </motion.div>

      <style jsx>{`
        /* Hide number input arrows */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};