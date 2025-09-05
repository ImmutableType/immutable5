import { defineChain } from 'viem'

export const flowEVMTestnet = defineChain({
  id: 545,
  name: 'Flow EVM Testnet',
  nativeCurrency: { 
    name: 'Flow', 
    symbol: 'FLOW', 
    decimals: 18 
  },
  rpcUrls: {
    default: { 
      http: ['https://testnet.evm.nodes.onflow.org'] 
    }
  },
  blockExplorers: {
    default: { 
      name: 'Flow EVM Explorer', 
      url: 'https://evm-testnet.flowscan.org' 
    }
  },
  testnet: true
})