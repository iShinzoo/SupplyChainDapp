import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ShipmentABI from '../utils/ShipmentPart.json';

const SHIPMENT_CONTRACT_ADDRESS = "0xCdd43724cb2502e8A704C488a00DFe2A92d5606A";

const TrackingHistory = ({ shipmentId }) => {
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shipmentId) {
      fetchTrackingInfo();
    }
  }, [shipmentId]);

  const fetchTrackingInfo = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(SHIPMENT_CONTRACT_ADDRESS, ShipmentABI.abi, provider);
      
      const info = await contract.getTrackingInfo(shipmentId);
      
      // Format the tracking info for display
      const formattedInfo = {
        currentLocation: info.currentLocation,
        locationHistory: info.locationHistory,
        locationTimestamps: info.locationTimestamps.map(ts => new Date(ts.toNumber() * 1000)),
        notes: info.notes,
        distance: info.distance.toNumber(),
        isPaid: info.isPaid
      };
      
      setTrackingInfo(formattedInfo);
    } catch (error) {
      console.error("Error fetching tracking info:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4">Loading tracking information...</div>;
  if (!trackingInfo) return <div className="text-center py-4">No tracking information available</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold mb-4 text-gray-900">Tracking History</h3>
      
      <div className="mb-4">
        <h4 className="text-lg font-semibold mb-2">Current Status</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><span className="font-medium">Current Location:</span> {trackingInfo.currentLocation}</p>
          <p><span className="font-medium">Total Distance:</span> {trackingInfo.distance} km</p>
          <p><span className="font-medium">Notes:</span> {trackingInfo.notes}</p>
          <p><span className="font-medium">Payment Status:</span> {trackingInfo.isPaid ? 'Paid' : 'Unpaid'}</p>
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-semibold mb-2">Location History</h4>
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trackingInfo.locationHistory.map((location, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trackingInfo.locationTimestamps[index]?.toLocaleString() || 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrackingHistory;