import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">Shipment Tracker</Link>
        <div className="space-x-4">
          <Link href="/create" className="text-gray-300 hover:text-white">Create Shipment</Link>
          <Link href="/shipmentsID" className="text-gray-300 hover:text-white">All Shipments</Link>
        </div>
      </div>
    </nav>
  );
}