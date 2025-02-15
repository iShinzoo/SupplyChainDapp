import { useEffect } from 'react';
import { ethers } from 'ethers';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const checkWallet = async () => {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    };
    checkWallet();
  }, []);

  return (
    <div>
      <Navbar />
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;