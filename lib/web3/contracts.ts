// Flow EVM Mainnet Contract Configuration
import { Address } from 'viem'

export const CONTRACTS = {
  PROFILE_NFT: '0x35A314B550959B5Cd8821727bAC11C0c5D9c880F' as Address,
  TOKEN_QUALIFIER: '0xf034a7802427695acCE47878Da898bff1D09f06B' as Address,
  
  // Treasury - mainnet address
  TREASURY: (process.env.NEXT_PUBLIC_TREASURY_ADDRESS as Address) || 
           ('0x00000000000000000000000228B74E66CBD624Fc' as Address),
  
  // BUFFAFLOW - mainnet address
  BUFFAFLOW: (process.env.NEXT_PUBLIC_BUFFAFLOW_ADDRESS as Address) || 
            ('0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798' as Address),
} as const

export const CONFIG = {
  CREATION_FEE: '3000000000000000000', // 3 FLOW in wei
  BUFFAFLOW_THRESHOLD: '100000000000000000000', // 100 tokens in wei
  CHAIN_ID: 747, // Mainnet: 747
  RPC_URL: 'https://mainnet.evm.nodes.onflow.org', // Mainnet RPC
  
  // Feature flags for real deployment
  ENABLE_BUFFAFLOW_BYPASS: true, // Always enabled, but checks network availability
  ENABLE_TREASURY_FEES: true, // Always enabled for real deployment
  
  // Mainnet configuration
  MAINNET_BUFFAFLOW: '0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798',
  MAINNET_CHAIN_ID: 747,
  TESTNET_CHAIN_ID: 545,
  MAINNET_RPC_URL: 'https://mainnet.evm.nodes.onflow.org',
  TESTNET_RPC_URL: 'https://testnet.evm.nodes.onflow.org',
} as const

// Updated ABIs with new contract addresses and functions
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
  // Profile creation - Updated with 4 parameters and payable
  {
    "inputs": [
      {"name": "displayName", "type": "string"},
      {"name": "bio", "type": "string"},
      {"name": "location", "type": "string"},
      {"name": "avatarUrl", "type": "string"}
    ],
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
      {"name": "createdAt", "type": "uint256"},
      {"name": "lastTierUpgrade", "type": "uint256"},
      {"name": "isActive", "type": "bool"},
      {"name": "socialGraphHash", "type": "bytes32"},
      {"name": "connectionCount", "type": "uint256"},
      {"name": "lastSocialUpdate", "type": "uint256"}
    ]}],
    "stateMutability": "view",
    "type": "function"
  },
  // Update profile
  {
    "inputs": [
      {"name": "profileId", "type": "uint256"},
      {"name": "displayName", "type": "string"},
      {"name": "bio", "type": "string"},
      {"name": "location", "type": "string"},
      {"name": "avatarUrl", "type": "string"}
    ],
    "name": "updateProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Profile by address
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "getProfileByAddress",
    "outputs": [{"name": "", "type": "tuple", "components": [
      {"name": "tier", "type": "uint256"},
      {"name": "did", "type": "string"},
      {"name": "displayName", "type": "string"},
      {"name": "bio", "type": "string"},
      {"name": "location", "type": "string"},
      {"name": "avatarUrl", "type": "string"},
      {"name": "createdAt", "type": "uint256"},
      {"name": "lastTierUpgrade", "type": "uint256"},
      {"name": "isActive", "type": "bool"},
      {"name": "socialGraphHash", "type": "bytes32"},
      {"name": "connectionCount", "type": "uint256"},
      {"name": "lastSocialUpdate", "type": "uint256"}
    ]}],
    "stateMutability": "view",
    "type": "function"
  },
  // Check if address has profile
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "hasProfile",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Get total profiles count
  {
    "inputs": [],
    "name": "totalProfiles",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Get basic profile fee
  {
    "inputs": [],
    "name": "getBasicProfileFee",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  // Tier advancement functions
  {
    "inputs": [
      {"name": "profileId", "type": "uint256"},
      {"name": "fid", "type": "uint256"},
      {"name": "proof", "type": "bytes"}
    ],
    "name": "stepUpWithFarcaster",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "profileId", "type": "uint256"},
      {"name": "kycId", "type": "string"},
      {"name": "proof", "type": "bytes"}
    ],
    "name": "stepUpWithCrossmint",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  // Admin functions
  {
    "inputs": [
      {"name": "profileId", "type": "uint256"},
      {"name": "targetTier", "type": "uint256"},
      {"name": "method", "type": "string"}
    ],
    "name": "adminVerifyProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // TokenQualifier reference
  {
    "inputs": [],
    "name": "tokenQualifier",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
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
      {"name": "tierLevel", "type": "uint256"}
    ],
    "name": "hasQualifyingTokens",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tierLevel", "type": "uint256"}],
    "name": "getRequiredFee",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tierLevel", "type": "uint256"}],
    "name": "getQualifyingTokens",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "tierLevel", "type": "uint256"},
      {"name": "tokenAddress", "type": "address"}
    ],
    "name": "getMinimumBalance",
    "outputs": [{"name": "", "type": "uint256"}],
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
  'hasQualifyingTokens',
  'getRequiredFee',
  'getQualifyingTokens'
] as const

// Helper functions for mainnet-only configuration
export const getNetworkConfig = (chainId: number = CONFIG.CHAIN_ID) => {
  // Always return mainnet configuration
  return {
    chainId: CONFIG.MAINNET_CHAIN_ID,
    isMainnet: true,
    isTestnet: false,
    rpcUrl: CONFIG.MAINNET_RPC_URL,
    explorerUrl: 'https://evm.flowscan.io',
    networkName: 'Flow EVM Mainnet',
    buffaflowAddress: CONFIG.MAINNET_BUFFAFLOW,
    hasBuffaflow: true
  }
}

// Get current network configuration (always mainnet)
export const CURRENT_NETWORK = getNetworkConfig()