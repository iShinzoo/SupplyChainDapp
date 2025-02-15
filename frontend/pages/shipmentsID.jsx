import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from '../utils/Tracking.json';
import toast from 'react-hot-toast';

export default function ShipmentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [shipment, setShipment] = useState(null);
  const [sender, setSender] = useState('');
  const CONTRACT_ADDRESS = "0x4EC17E231FEC4e133c3f58Ac94B549dD40Db0599";
  const CONTRACT_ABI = abi.abi;

  useEffect(() => {
    const loadData = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      setSender(await signer.getAddress());

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const data = await contract.typeShipments(id);
      setShipment(data);
    };
    
    if (id) loadData();
  }, [id]);

  const updateStatus = async (action) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      if (action === 'start') {
        await contract.StartShipment(shipment.sender, shipment.receiver, id);
        toast.success('Shipment started!');
      } else {
        await contract.CompleteShipment(shipment.sender, shipment.receiver, id);
        toast.success('Shipment delivered!');
      }
      
      router.reload();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!shipment) return <div className="text-center mt-8">Loading...</div>;

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
          <InfoCard label="Price" value={`${ethers.utils.formatEther(shipment.price)} ETH`} />
          <InfoCard label="Distance" value={`${shipment.distance} km`} />
        </div>

        {shipment.status === 0 && sender === shipment.sender && (
          <button
            onClick={() => updateStatus('start')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Start Shipment
          </button>
        )}

        {shipment.status === 1 && sender === shipment.receiver && (
          <button
            onClick={() => updateStatus('complete')}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Mark as Delivered
          </button>
        )}
      </div>
    </div>
  );
}

const InfoCard = ({ label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="font-medium text-gray-800">{value}</p>
  </div>
);

const statusColors = {
  0: 'bg-yellow-100 text-yellow-800',
  1: 'bg-blue-100 text-blue-800',
  2: 'bg-green-100 text-green-800'
};

const ShipmentStatus = ['Pending', 'In Transit', 'Delivered'];
const shortAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;