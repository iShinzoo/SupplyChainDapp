import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import InventoryABI from '../utils/Inventory.json';
import ShipmentABI from '../utils/ShipmentPart.json';
import toast from 'react-hot-toast';

const INVENTORY_CONTRACT_ADDRESS = "0x9c0c101d811379Dd8d66D4E88531a218Fb13FCEC"; 
const SHIPMENT_CONTRACT_ADDRESS = "0xCdd43724cb2502e8A704C488a00DFe2A92d5606A";

const ShipmentCreator = () => {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]); // [{productId, quantity}]
  const [receiver, setReceiver] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(INVENTORY_CONTRACT_ADDRESS, InventoryABI.abi, provider);
      const count = await contract.productCount();
      const items = [];
      for (let i = 1; i <= count; i++) {
        const [name, description, quantity] = await contract.getProduct(i);
        items.push({ id: i, name, description, quantity: quantity.toString() });
      }
      setProducts(items);
    } catch (err) {
      toast.error('Failed to fetch inventory');
    }
    setLoading(false);
  };

  const handleSelect = (productId, quantity) => {
    setSelected(prev => {
      const exists = prev.find(item => item.productId === productId);
      if (exists) {
        return prev.map(item => item.productId === productId ? { ...item, quantity } : item);
      } else {
        return [...prev, { productId, quantity }];
      }
    });
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    if (!receiver || selected.length === 0) {
      toast.error('Receiver and at least one product required');
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(SHIPMENT_CONTRACT_ADDRESS, ShipmentABI.abi, signer);
      const productIds = selected.map(item => item.productId);
      const quantities = selected.map(item => item.quantity);
      const tx = await contract.createShipment(receiver, productIds, quantities);
      await tx.wait();
      toast.success('Shipment created!');
      setReceiver('');
      setSelected([]);
    } catch (err) {
      toast.error(err.message || 'Failed to create shipment');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Create Shipment</h2>
      <form onSubmit={handleCreateShipment} className="space-y-4">
        <input
          type="text"
          placeholder="Receiver Address"
          required
          className="border rounded px-3 py-2 w-full"
          value={receiver}
          onChange={e => setReceiver(e.target.value)}
        />
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Select Products</h3>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">ID</th>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Available</th>
                  <th className="border px-4 py-2">Quantity to Ship</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="border px-4 py-2">{p.id}</td>
                    <td className="border px-4 py-2">{p.name}</td>
                    <td className="border px-4 py-2">{p.quantity}</td>
                    <td className="border px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        max={p.quantity}
                        className="border rounded px-2 py-1 w-24"
                        value={selected.find(item => item.productId === p.id)?.quantity || ''}
                        onChange={e => handleSelect(p.id, e.target.value)}
                        disabled={p.quantity === '0'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <button type="submit" className="bg-purple-600 text-white rounded px-4 py-2 hover:bg-purple-700">Create Shipment</button>
      </form>
    </div>
  );
};

export default ShipmentCreator;