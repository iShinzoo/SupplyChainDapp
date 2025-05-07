"use client"

import { ReactNode } from "react"
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit"
import { sepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "d1907ce9b4565853d18b3413ce5f7ad2",
  chains: [sepolia],
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={darkTheme({
            accentColor: "#4f46e5",
            accentColorForeground: "white",
            borderRadius: "medium",
          })}
          coolMode
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}