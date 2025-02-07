import "@/styles/globals.css";
import { WagmiConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from '../Context/Tracking';
import { TrackingProvider } from '../Context/Tracking';
import { Navbar, Footer } from "../Components";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <TrackingProvider>
          <Navbar />
          <Component {...pageProps} />
          <Footer />
        </TrackingProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}