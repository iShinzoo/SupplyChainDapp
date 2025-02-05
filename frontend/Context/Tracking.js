import React, { useState, useEffect } from "react";
import web3Modal from "web3modal";
import { ethers } from "ethers";

import tracking from "../Context/Tracking.json";
const ContractAddress = "//contract address";
const ContractABI = tracking.abi;

// Fetching Smart Contract
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(ContractAddress, ContractABI, signerOrProvider);

export const TrackingContext = React.createContext();

export const TrackingProvider = ({ children }) => {
  const DappName = "Tracking Dapp";
  const [currentUser, setCurrentUser] = useState("");

  const createShipment = async (items) => {
    console.log(items);
    const { receiver, pickupTime, distance, price } = items;

    try {
      const web3Modal = new web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);
      const createItem = await contract.createShipment(
        receiver,
        new Date(pickupTime).getTime(),
        distance,
        ethers.utils.parseUnits(price, 18),
        {
          value: ethers.utils.parseUnits(price, 18),
        }
      );
      await createItem.wait();
      console.log(createItem);
    } catch (error) {
      console.log("Something want wrong", error);
    }
  };

  const getAllShipments = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = fetchContract(provider);
      const shipments = await contract.getAllShipments();
      const allShipments = shipments.map((shipment) => ({
        sender: shipment.sender,
        receiver: shipment.receiver,
        price: ethers.utils.formatEther(shipments.price.toString()),
        pickupTime: shipment.pickupTime.toNumber(),
        deliveryTime: shipment.deliveryTime.toNumber(),
        distance: shipment.distance.toNumber(),
        isPaid: shipment.isPaid,
        status: shipment.status,
      }));
      return allShipments;
    } catch (error) {
      console.log("Something want wrong", error);
    }
  };

  const getShipmentsCount = async () => {
    try {
      if (!window.ethereum) {
        return "Install Metamask";
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
      }
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = fetchContract(provider);
      const shipmentsCount = await contract.getShipmentsCount(accounts[0]);
      return shipmentsCount.toNumber();
    } catch (error) {
      console.log("error want, getting Shipment");
    }
  };

  const CompleteShipment = async (CompleteShip) => {
    console.log(CompleteShip);

    const { receiver, index } = CompleteShip;
    try {
      if (!window.ethereum) return "Install Metamask";
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const web3Modal = new web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);
      const transaction = await contract.completeShipment(
        accounts[0],
        receiver,
        index,
        {
          gaslimit: 300000,
        }
      );
      transaction.wait();
      console.log(transaction);
    } catch (error) {
      console.log("Wrong Complete Shipment", error);
    }
  };

  const getShipment = async (index) => {
    console.log(index * 1);
    try {
      if (!window.ethereum) return "Install Metamask";
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const provider = new ethers.providers.JsonRpcProvider();
      const contract = fetchContract(provider);
      const shipment = await contract.getShipment(accounts[0], index * 1);

      const SingleShipment = {
        sender: shipment[0],
        receiver: shipment[1],
        pickupTime: shipment[2].toNumber(),
        deliveryTime: shipment[3].toNumber(),
        distance: shipment[4].toNumber(),
        price: ethers.utils.formatEther(shipment[5].toString()),
        isPaid: shipment[6],
        status: shipment[7],
      };

      return SingleShipment;
    } catch (error) {
      console.log("Sorry No Shipment Found", error);
    }
  };

  const startShipment = async (getProduct) => {
    const { receiver, index } = getProduct;
    try {
      if (!window.ethereum) return "Install Metamask";
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const web3Modal = new web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);
      const shipment = await contract.startShipment(
        accounts[0],
        receiver,
        index * 1
      );
      shipment.wait();
      console.log(shipment);
    } catch (error) {
      console.log("Sorry No shipment", error);
    }
  };

  // check wallet connected or not
  const checkIfwalletConnected = async () => {
    try {
      if (!window.ethereum) return "Install Metamask";
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length) {
        setCurrentUser(accounts[0]);
      } else {
        return "No account";
      }
    } catch (error) {
      return "Not Connected";
    }
  };

  const walletConnect = async () => {
    try {
      if (!window.ethereum) return "Install Metamask";
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentUser(accounts[0]);
    } catch (error) {
      return "Something want wrong";
    }
  };

  useEffect(() => {
    checkIfwalletConnected();
  }, []);

  return (
    <TrackingContext.Provider
      value={{
        DappName,
        currentUser,
        createShipment,
        getAllShipments,
        getShipmentsCount,
        CompleteShipment,
        getShipment,
        startShipment,
        walletConnect,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
};
