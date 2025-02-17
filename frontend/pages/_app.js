import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';
import { motion } from 'framer-motion';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = getDefaultConfig({
  appName: 'Shipment Tracker',
  projectId: 'd1907ce9b4565853d18b3413ce5f7ad2', // From WalletConnect Cloud
  chains: [sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

function MyApp({ Component, pageProps, router }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#4f46e5',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
          coolMode
        >
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
            <Navbar />
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            <AnimatePresence mode='wait' initial={false}>
              <motion.div
                key={router.route}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Component {...pageProps} />
              </motion.div>
            </AnimatePresence>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;