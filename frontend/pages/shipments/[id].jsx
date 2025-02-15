import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from '/Users/krish/OneDrive/Documents/coding/web3/SupplyChainDApp/frontend/utils/Tracking.json';
import toast from 'react-hot-toast';

export default function ShipmentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [shipment, setShipment] = useState(null);
  const [sender, setSender] = useState('');
  const [loading, setLoading] = useState(true);
  const CONTRACT_ADDRESS = "0x4EC17E231FEC4e133c3f58Ac94B549dD40Db0599";
  const CONTRACT_ABI = abi.abi;

  useEffect(() => {
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

        // Get all shipments
        const allShipments = await contract.getAllTransaction();
        
        // Validate shipment exists
        if (!allShipments || shipmentId >= allShipments.length) {
          throw new Error("Shipment not found");
        }

        const shipmentData = allShipments[shipmentId];
        
        // Convert BigNumber values
        const formattedData = {
          sender: shipmentData.sender,
          receiver: shipmentData.receiver,
          pickupTime: shipmentData.pickupTime.toNumber(),
          deliveryTime: shipmentData.deliveryTime.toNumber(),
          distance: shipmentData.distance.toNumber(),
          price: ethers.utils.formatEther(shipmentData.price),
          status: shipmentData.status,
          ispaid: shipmentData.ispaid
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
  }, [id]);


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
      router.reload();
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error(error.message || "Transaction failed");
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (!shipment) return <div className="text-center mt-8">Shipment not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Shipment #{id}</h2>
          <span className={`px-3 py-1 rounded-full ${statusColors[shipment.status]}`}>
            {ShipmentStatus[shipment.status]}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <InfoCard label="Sender" value={shortAddress(shipment.sender)} />
          <InfoCard label="Receiver" value={shortAddress(shipment.receiver)} />
          <InfoCard label="Price" value={`${shipment.price} ETH`} />
          <InfoCard label="Distance" value={`${shipment.distance} km`} />
          <InfoCard label="Pickup Time" value={new Date(shipment.pickupTime * 1000).toLocaleString()} />
          {shipment.deliveryTime > 0 && (
            <InfoCard label="Delivery Time" value={new Date(shipment.deliveryTime * 1000).toLocaleString()} />
          )}
        </div>

        <div className="flex gap-4">
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
    </div>
  );
}

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