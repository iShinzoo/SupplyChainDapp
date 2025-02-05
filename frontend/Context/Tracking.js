import React, { useState, useEffect, createContext } from 'react';
import { createConfig, WagmiConfig, useAccount, useConnect, useDisconnect, useContractWrite, useContractRead } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { http, parseEther } from 'viem';
import tracking from '../Context/Tracking.json';

const ContractAddress = process.env.YOUR_SEPOLIA_CONTRACT_ADDRESS;
const ContractABI = tracking.abi;

// Configure Wagmi
const config = createConfig({
  autoConnect: true,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(process.env.YOUR_SEPOLIA_RPC_URL),
  },
  connectors: [injected()],
});

export const TrackingContext = createContext();

export const TrackingProvider = ({ children }) => {
  const DappName = "Tracking Dapp";
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [currentUser, setCurrentUser] = useState('');

  // Wallet connection handler
  const walletConnect = async () => {
    try {
      if (!isConnected) {
        connect({ connector: injected() });
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  // Update current user when connection changes
  useEffect(() => {
    setCurrentUser(isConnected ? address : '');
  }, [isConnected, address]);

  // Create Shipment
  const { writeAsync: createShipment } = useContractWrite({
    address: ContractAddress,
    abi: ContractABI,
    functionName: 'createShipment',
  });

  // Get All Shipments
  const { data: allShipments, refetch: refetchShipments } = useContractRead({
    address: ContractAddress,
    abi: ContractABI,
    functionName: 'getAllShipments',
  });

  // Get Shipment Count
  const { data: shipmentsCount } = useContractRead({
    address: ContractAddress,
    abi: ContractABI,
    functionName: 'getShipmentsCount',
    args: [currentUser],
    enabled: !!currentUser,
  });

  // Complete Shipment
  const { writeAsync: completeShipment } = useContractWrite({
    address: ContractAddress,
    abi: ContractABI,
    functionName: 'completeShipment',
  });

  // Start Shipment
  const { writeAsync: startShipment } = useContractWrite({
    address: ContractAddress,
    abi: ContractABI,
    functionName: 'startShipment',
  });

  // Get Single Shipment
  const getShipment = async (index) => {
    try {
      const { data } = await useContractRead({
        address: ContractAddress,
        abi: ContractABI,
        functionName: 'getShipment',
        args: [currentUser, index],
        enabled: !!currentUser,
      });

      return {
        sender: data[0],
        receiver: data[1],
        pickupTime: Number(data[2]),
        deliveryTime: Number(data[3]),
        distance: Number(data[4]),
        price: parseEther(data[5].toString()),
        isPaid: data[6],
        status: data[7],
      };
    } catch (error) {
      console.error("Error fetching shipment:", error);
      return null;
    }
  };

  // Format shipments data
  const formattedShipments = allShipments?.map(shipment => ({
    sender: shipment[0],
    receiver: shipment[1],
    pickupTime: Number(shipment[2]),
    deliveryTime: Number(shipment[3]),
    distance: Number(shipment[4]),
    price: parseEther(shipment[5].toString()),
    isPaid: shipment[6],
    status: shipment[7],
  })) || [];

  return (
    <WagmiConfig config={config}>
      <TrackingContext.Provider
        value={{
          DappName,
          currentUser,
          walletConnect,
          disconnect,
          isConnected,
          createShipment: async (items) => {
            const { receiver, pickupTime, distance, price } = items;
            return createShipment({
              args: [
                receiver,
                Math.floor(new Date(pickupTime).getTime() / 1000), // UNIX timestamp
                distance,
                parseEther(price.toString()),
              ],
              value: parseEther(price.toString()),
            });
          },
          getAllShipments: () => formattedShipments,
          getShipmentsCount: () => shipmentsCount ? Number(shipmentsCount) : 0,
          CompleteShipment: (completeData) => completeShipment({
            args: [completeData.receiver, completeData.index]
          }),
          startShipment: (startData) => startShipment({
            args: [startData.receiver, startData.index]
          }),
          getShipment,
          refetchShipments,
        }}
      >
        {children}
      </TrackingContext.Provider>
    </WagmiConfig>
  );
};