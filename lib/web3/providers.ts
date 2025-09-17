import { createConfig, http, cookieStorage, createStorage } from 'wagmi'
import { defineChain } from 'viem'
import { injected, metaMask } from 'wagmi/connectors'
import { CONFIG } from './contracts'

// Flow EVM Mainnet chain configuration (mobile-optimized)
const flowEvm = defineChain({
  id: 747, // Mainnet ID
  name: 'Flow EVM Mainnet',
  network: 'flow-evm',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.evm.nodes.onflow.org'],
    },
    public: {
      http: ['https://mainnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Flow EVM Explorer',
      url: 'https://evm.flowscan.io',
    },
  },
})

// Mobile-optimized Wagmi configuration
export const wagmiConfig = createConfig({
  chains: [flowEvm],
  ssr: true, // Critical for Next.js mobile compatibility
  storage: createStorage({
    storage: cookieStorage, // Use cookies instead of localStorage for mobile
  }),
  connectors: [
    injected(),
    metaMask({
      dappMetadata: {
        name: 'ImmutableType',
      },
    }),
  ],
  transports: {
    [flowEvm.id]: http('https://mainnet.evm.nodes.onflow.org'),
  },
})

// Legacy exports for compatibility
export const flowEvmTestnetChain = flowEvm // Renamed but same export
export type FlowEvmTestnetChain = typeof flowEvm
export type WagmiConfig = typeof wagmiConfig