import { defineChain } from 'viem'

export const flowEVMMainnet = defineChain({
  id: parseInt(process.env.NEXT_PUBLIC_FLOW_EVM_CHAIN_ID || '747'),
  name: 'Flow EVM Mainnet',
  nativeCurrency: { 
    name: 'Flow', 
    symbol: 'FLOW', 
    decimals: 18 
  },
  rpcUrls: {
    default: { 
      http: [process.env.NEXT_PUBLIC_FLOW_EVM_RPC_URL || 'https://mainnet.evm.nodes.onflow.org'] 
    }
  },
  blockExplorers: {
    default: { 
      name: 'FlowScan', 
      url: 'https://evm.flowscan.io' 
    }
  },
  testnet: process.env.NEXT_PUBLIC_ENVIRONMENT !== 'mainnet'
})

// Current network - always mainnet based on environment
export const getCurrentNetwork = () => flowEVMMainnet

// Network detection helper
export const getNetworkConfig = (chainId?: number) => {
  const currentChainId = chainId || parseInt(process.env.NEXT_PUBLIC_FLOW_EVM_CHAIN_ID || '747')
  
  switch (currentChainId) {
    case 747:
      return flowEVMMainnet
    default:
      return flowEVMMainnet // Default to mainnet
  }
}