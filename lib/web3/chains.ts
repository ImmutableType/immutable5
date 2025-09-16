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

export const flowEVMMainnet = defineChain({
  id: 747,
  name: 'Flow EVM Mainnet',
  nativeCurrency: { 
    name: 'Flow', 
    symbol: 'FLOW', 
    decimals: 18 
  },
  rpcUrls: {
    default: { 
      http: ['https://mainnet.evm.nodes.onflow.org'],
      webSocket: ['wss://mainnet.evm.nodes.onflow.org']
    }
  },
  blockExplorers: {
    default: { 
      name: 'FlowScan', 
      url: 'https://evm.flowscan.io' 
    }
  },
  testnet: false
})

// Network detection helper
export const getNetworkConfig = (chainId: number) => {
  switch (chainId) {
    case 747:
      return flowEVMMainnet;
    case 545:
      return flowEVMTestnet;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

// Current network based on environment
export const getCurrentNetwork = () => {
  const isMainnet = process.env.NEXT_PUBLIC_ENVIRONMENT === 'mainnet';
  return isMainnet ? flowEVMMainnet : flowEVMTestnet;
};