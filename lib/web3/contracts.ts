// Flow EVM Testnet Contract Configuration
import { Address } from 'viem'

export const CONTRACTS = {
  PROFILE_NFT: '0x09512878ac5662aFDE0bE6046d12B2eEa30A00Fe' as Address,
  TOKEN_QUALIFIER: '0x78b9240F3EF69cc517A66564fBC488C5E5309DF7' as Address,
  
  // Treasury - configurable for future implementation
  TREASURY: (process.env.NEXT_PUBLIC_TREASURY_ADDRESS as Address) || 
           ('0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2' as Address),
  
  // BUFFAFLOW - mainnet address, configurable via env
  BUFFAFLOW: (process.env.NEXT_PUBLIC_BUFFAFLOW_ADDRESS as Address) || 
            ('0x0000000000000000000000000000000000000000' as Address), // Placeholder for testnet
} as const

export const CONFIG = {
  CREATION_FEE: '3000000000000000000', // 3 FLOW in wei
  BUFFAFLOW_THRESHOLD: '100000000000000000000', // 100 tokens in wei
  CHAIN_ID: 545, // Testnet: 545, Mainnet: 747
  RPC_URL: 'https://testnet.evm.nodes.onflow.org', // Will switch to mainnet when ready
  
  // Feature flags for real deployment
  ENABLE_BUFFAFLOW_BYPASS: true, // Always enabled, but checks network availability
  ENABLE_TREASURY_FEES: true, // Always enabled for real deployment
  
  // Real addresses per network
  MAINNET_BUFFAFLOW: '0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798',
  MAINNET_CHAIN_ID: 747,
  TESTNET_CHAIN_ID: 545,
  MAINNET_RPC_URL: 'https://mainnet.evm.nodes.onflow.org',
  TESTNET_RPC_URL: 'https://testnet.evm.nodes.onflow.org',
} as const

// Basic ABIs - will be replaced by generated ones
export const PROFILE_NFT_ABI = [
  // ERC721 basics
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Profile creation - placeholder structure
  {
    "inputs": [{"name": "data", "type": "tuple", "components": [
      {"name": "displayName", "type": "string"},
      {"name": "bio", "type": "string"},
      {"name": "location", "type": "string"},
      {"name": "avatarUrl", "type": "string"}
    ]}],
    "name": "createBasicProfile",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  // Profile reading
  {
    "inputs": [{"name": "profileId", "type": "uint256"}],
    "name": "getProfile",
    "outputs": [{"name": "", "type": "tuple", "components": [
      {"name": "tier", "type": "uint256"},
      {"name": "did", "type": "string"},
      {"name": "displayName", "type": "string"},
      {"name": "bio", "type": "string"},
      {"name": "location", "type": "string"},
      {"name": "avatarUrl", "type": "string"},
      {"name": "createdAt", "type": "uint256"}
    ]}],
    "stateMutability": "view",
    "type": "function"
  },
  // Update profile
  {
    "inputs": [
      {"name": "profileId", "type": "uint256"},
      {"name": "data", "type": "tuple", "components": [
        {"name": "displayName", "type": "string"},
        {"name": "bio", "type": "string"},
        {"name": "location", "type": "string"},
        {"name": "avatarUrl", "type": "string"}
      ]}
    ],
    "name": "updateProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export const TOKEN_QUALIFIER_ABI = [
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "isQualified",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "user", "type": "address"},
      {"name": "token", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "checkTokenBalance",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getQualificationStatus",
    "outputs": [
      {"name": "qualified", "type": "bool"},
      {"name": "reason", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const BUFFAFLOW_ABI = [
  // ERC20 basics for BUFFAFLOW tokens
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // 404 contract specific - ERC721 balance
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "erc721BalanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // 404 contract - check if token ID exists as NFT
  {
    "inputs": [{"name": "id", "type": "uint256"}],
    "name": "erc721TokensBankedInQueue",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Expected function signatures from architecture
export const EXPECTED_PROFILE_FUNCTIONS = [
  'createBasicProfile',
  'stepUpWithFarcaster', 
  'stepUpWithCrossmint',
  'updateProfile',
  'getProfile',
  'tokenURI',
  'ownerOf',
  'balanceOf'
] as const

export const EXPECTED_QUALIFIER_FUNCTIONS = [
  'isQualified',
  'checkTokenBalance',
  'getQualificationStatus'
] as const

// Helper functions for network switching
export const getNetworkConfig = (chainId: number = CONFIG.CHAIN_ID) => {
  const isMainnet = chainId === CONFIG.MAINNET_CHAIN_ID
  
  return {
    chainId,
    isMainnet,
    isTestnet: !isMainnet,
    rpcUrl: isMainnet ? CONFIG.MAINNET_RPC_URL : CONFIG.TESTNET_RPC_URL,
    explorerUrl: isMainnet ? 'https://evm.flowscan.io' : 'https://evm-testnet.flowscan.io',
    networkName: isMainnet ? 'Flow EVM Mainnet' : 'Flow EVM Testnet',
    buffaflowAddress: isMainnet ? CONFIG.MAINNET_BUFFAFLOW : null,
    hasBuffaflow: isMainnet
  }
}

// Get current network configuration
export const CURRENT_NETWORK = getNetworkConfig()