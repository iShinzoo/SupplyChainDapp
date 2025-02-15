import { useState } from 'react';
import { ethers } from 'ethers';
import abi from '../utils/Tracking.json';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function CreateShipment() {
  const [form, setForm] = useState({ receiver: '', distance: '', price: '' });
  const router = useRouter();
  const CONTRACT_ADDRESS = "0x4EC17E231FEC4e133c3f58Ac94B549dD40Db0599";
  const CONTRACT_ABI = abi.abi;

  const handleSubmit = async (e) => {
    e.preventDefault();
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
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Shipment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Receiver Address</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded"
              value={form.receiver}
              onChange={(e) => setForm({ ...form, receiver: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Distance (km)</label>
            <input
              type="number"
              required
              className="w-full p-2 border rounded"
              value={form.distance}
              onChange={(e) => setForm({ ...form, distance: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Price (ETH)</label>
            <input
              type="number"
              step="0.001"
              required
              className="w-full p-2 border rounded"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
          >
            Create Shipment
          </button>
        </form>
      </div>
    </div>
  );
}