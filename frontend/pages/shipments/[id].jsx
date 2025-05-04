import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import ShipmentABI from '../../utils/ShipmentPart.json';
import ShipmentTracker from '../../components/ShipmentTracker';
import TrackingHistory from '../../components/TrackingHistory';
import toast from 'react-hot-toast';

export default function ShipmentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [shipment, setShipment] = useState(null);
  const [sender, setSender] = useState('');
  const [loading, setLoading] = useState(true);
  const CONTRACT_ADDRESS = "0xCdd43724cb2502e8A704C488a00DFe2A92d5606A"; // Replace with deployed ShipmentPart contract address
  const CONTRACT_ABI = ShipmentABI.abi;



  const loadData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Get sender address first
      const address = await signer.getAddress();
      setSender(address);

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // Convert id to number and validate
      const shipmentId = parseInt(id);
      if (isNaN(shipmentId)) throw new Error("Invalid shipment ID");

      // Get shipment details
      const shipmentData = await contract.getShipment(shipmentId);
      
      // Format the data
      const formattedData = {
        shipmentId: shipmentData[0].toNumber(),
        sender: shipmentData[1],
        receiver: shipmentData[2],
        status: shipmentData[3],
        creationTime: shipmentData[4].toNumber(),
        deliveryTime: shipmentData[5].toNumber(),
        items: shipmentData[6].map(item => ({
          productId: item.productId.toNumber(),
          quantity: item.quantity.toNumber()
        })),
        tracking: {
          currentLocation: shipmentData[7].currentLocation,
          locationHistory: shipmentData[7].locationHistory,
          locationTimestamps: shipmentData[7].locationTimestamps.map(ts => ts.toNumber()),
          notes: shipmentData[7].notes,
          distance: shipmentData[7].distance.toNumber(),
          isPaid: shipmentData[7].isPaid
        },
          isPaid: shipmentData.isPaid
        };

        setShipment(formattedData);
      } catch (error) {
        console.error("Error loading shipment:", error);
        toast.error(error.message || "Failed to load shipment details");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }; [id];


  const updateStatus = async (action) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      let tx;
      if (action === 'start') {
        tx = await contract.StartShipment(shipment.sender, shipment.receiver, id);
      } else {
        tx = await contract.CompleteShipment(shipment.sender, shipment.receiver, id);
      }
      
      await tx.wait();
      toast.success(`Shipment ${action === 'start' ? 'started' : 'delivered'}!`);
      loadData(); // Reload data after status update
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error(error.message || "Transaction failed");
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (!shipment) return <div className="text-center mt-8">Shipment not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Shipment #{id}</h2>
            <span className={`px-3 py-1 rounded-full ${statusColors[shipment.status]}`}>
              {ShipmentStatus[shipment.status]}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <InfoCard label="Sender" value={shortAddress(shipment.sender)} />
            <InfoCard label="Receiver" value={shortAddress(shipment.receiver)} />
            <InfoCard label="Current Location" value={shipment.tracking.currentLocation} />
            <InfoCard label="Distance" value={`${shipment.tracking.distance} km`} />
            <InfoCard label="Creation Time" value={new Date(shipment.creationTime * 1000).toLocaleString()} />
            {shipment.deliveryTime > 0 && (
              <InfoCard label="Delivery Time" value={new Date(shipment.deliveryTime * 1000).toLocaleString()} />
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">Shipment Items</h3>
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Product ID</th>
                  <th className="border px-4 py-2">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {shipment.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{item.productId}</td>
                    <td className="border px-4 py-2">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4 mb-8">
            {shipment.status === 0 && sender === shipment.sender && (
              <button
                onClick={() => updateStatus('start')}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Start Shipment
              </button>
            )}

            {shipment.status === 1 && sender === shipment.receiver && (
              <button
                onClick={() => updateStatus('complete')}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Mark as Delivered
              </button>
            )}
          </div>
        </div>

        {/* Tracking History Component */}
        <TrackingHistory shipmentId={id} />

        {/* Show Tracking Update Form for In-Transit Shipments */}
        {shipment.status === 1 && (sender === shipment.sender || sender === shipment.receiver) && (
          <ShipmentTracker shipmentId={id} onUpdate={loadData} />
        )}
      </div>
    </div>
  );


const statusColors = {
    0: 'bg-yellow-100 text-yellow-800',
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-green-100 text-green-800'
  };
  
  const ShipmentStatus = ['Pending', 'In Transit', 'Delivered'];
  const shortAddress = (addr) => `${addr?.slice(0, 6)}...${addr?.slice(-4)}`;
  
  const InfoCard = ({ label, value }) => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );