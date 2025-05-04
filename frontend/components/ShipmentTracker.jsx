import { useState } from 'react';
import { ethers } from 'ethers';
import ShipmentABI from '../utils/ShipmentPart.json';
import toast from 'react-hot-toast';

const SHIPMENT_CONTRACT_ADDRESS = "0xCdd43724cb2502e8A704C488a00DFe2A92d5606A";

const ShipmentTracker = ({ shipmentId, onUpdate }) => {
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const updateLocation = async (e) => {
    e.preventDefault();
    if (!location || distance <= 0) {
      toast.error('Location and distance are required');
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(SHIPMENT_CONTRACT_ADDRESS, ShipmentABI.abi, signer);
      
      const tx = await contract.updateTrackingLocation(shipmentId, location, distance);
      await tx.wait();
      
      toast.success('Location updated successfully');
      setLocation('');
      setDistance(0);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message || 'Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  const updateNotes = async (e) => {
    e.preventDefault();
    if (!notes) {
      toast.error('Notes cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(SHIPMENT_CONTRACT_ADDRESS, ShipmentABI.abi, signer);
      
      const tx = await contract.updateTrackingNotes(shipmentId, notes);
      await tx.wait();
      
      toast.success('Notes updated successfully');
      setNotes('');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message || 'Failed to update notes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold mb-4 text-gray-900">Update Tracking Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-2">Update Location</h4>
          <form onSubmit={updateLocation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Location</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Distribution Center"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={distance}
                onChange={(e) => setDistance(parseInt(e.target.value))}
                min="0"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Location'}
            </button>
          </form>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-2">Update Notes</h4>
          <form onSubmit={updateNotes} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Shipment Notes</label>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="4"
                placeholder="Add notes about the shipment status..."
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Notes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShipmentTracker;