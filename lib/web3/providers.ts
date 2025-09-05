import { createConfig, http } from 'wagmi'
import { injected, metaMask } from 'wagmi/connectors'
import { CONFIG } from './contracts'

// Flow EVM Testnet chain configuration (custom definition)
export const flowEvmTestnetChain = {
  id: CONFIG.CHAIN_ID,
  name: 'Flow EVM Testnet',
  network: 'flow-evm-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'FLOW',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: { http: [CONFIG.RPC_URL] },
    public: { http: [CONFIG.RPC_URL] },
  },
  blockExplorers: {
    default: { 
      name: 'FlowScan',
      url: 'https://evm-testnet.flowscan.io',
    },
  },
  testnet: true,
} as const

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: [flowEvmTestnetChain],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [CONFIG.CHAIN_ID]: http(CONFIG.RPC_URL),
  },
})

// Type exports
export type FlowEvmTestnetChain = typeof flowEvmTestnetChain
export type WagmiConfig = typeof wagmiConfig