import "@/styles/globals.css";

import { WagmiConfig } from "wagmi";
import { config } from '../Context/Tracking';
import { Navbar , Footer } from "@/Components";

export default function App({ Component, pageProps }) {
  return(
    <>
    <WagmiConfig config={config}>
    <Navbar />
      <Component {...pageProps} />
    <Footer />    
    </WagmiConfig>
    </>
  );
}
