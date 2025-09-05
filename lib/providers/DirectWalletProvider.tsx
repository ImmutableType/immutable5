'use client'

import { createConfig, WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { injected, coinbaseWallet } from 'wagmi/connectors'
import { http } from 'viem'
import { flowEVMTestnet } from '../web3/chains'

const queryClient = new QueryClient()

// Direct wallet config - no WalletConnect middleman
const config = createConfig({
  chains: [flowEVMTestnet],
  connectors: [
    injected(), // MetaMask, etc.
    coinbaseWallet({
      appName: 'ImmutableType',
      appLogoUrl: 'https://immutabletype.com/logo.png'
    })
  ],
  transports: {
    [flowEVMTestnet.id]: http('https://testnet.evm.nodes.onflow.org')
  }
})

export function DirectWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}