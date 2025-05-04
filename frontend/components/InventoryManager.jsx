import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import InventoryABI from '../utils/Inventory.json';
import toast from 'react-hot-toast';

const CONTRACT_ADDRESS = "0x9c0c101d811379Dd8d66D4E88531a218Fb13FCEC";
const CONTRACT_ABI = InventoryABI.abi;

const InventoryManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', quantity: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const count = await contract.productCount();
      const items = [];
      for (let i = 1; i <= count; i++) {
        const [name, description, quantity] = await contract.getProduct(i);
        items.push({ id: i, name, description, quantity: quantity.toString() });
      }
      setProducts(items);
    } catch (err) {
      toast.error('Failed to fetch products');
    }
    setLoading(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.addProduct(form.name, form.description, form.quantity);
      await tx.wait();
      toast.success('Product added!');
      setForm({ name: '', description: '', quantity: '' });
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to add product');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Inventory Management</h2>
      <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Name"
          required
          className="border rounded px-3 py-2"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          required
          className="border rounded px-3 py-2"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="Quantity"
          required
          className="border rounded px-3 py-2"
          value={form.quantity}
          onChange={e => setForm({ ...form, quantity: e.target.value })}
        />
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">Add Product</button>
      </form>
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Current Inventory</h3>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Description</th>
                <th className="border px-4 py-2">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td className="border px-4 py-2">{p.id}</td>
                  <td className="border px-4 py-2">{p.name}</td>
                  <td className="border px-4 py-2">{p.description}</td>
                  <td className="border px-4 py-2">{p.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InventoryManager;