// Flow EVM Mainnet Contract Configuration
import { Address } from 'viem'

export const CONTRACTS = {
  PROFILE_NFT: (process.env.NEXT_PUBLIC_PROFILE_NFT_ADDRESS as Address) || 
              ('0x35A314B550959B5Cd8821727bAC11C0c5D9c880F' as Address),
  TOKEN_QUALIFIER: (process.env.NEXT_PUBLIC_TOKEN_QUALIFIER_ADDRESS as Address) || 
                   ('0xf034a7802427695acCE47878Da898bff1D09f06B' as Address),
  
  // Treasury - your controlled wallet
  TREASURY: (process.env.NEXT_PUBLIC_TREASURY_ADDRESS as Address) || 
           ('0x00000000000000000000000228B74E66CBD624Fc' as Address),
  
  // BUFFAFLOW - mainnet address
  BUFFAFLOW: (process.env.NEXT_PUBLIC_BUFFAFLOW_ADDRESS as Address) || 
            ('0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798' as Address),

            // BookmarkNFT - newly deployed contract
BOOKMARK_NFT: (process.env.NEXT_PUBLIC_BOOKMARK_NFT_ADDRESS as Address) || 
('0x6652801B89f9E3B4a8847Fd0C4F17e7dCd32dFF5' as Address),

} as const

export const CONFIG = {
  CREATION_FEE: '3000000000000000000', // 3 FLOW in wei
  BUFFAFLOW_THRESHOLD: '100000000000000000000', // 100 tokens in wei
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_FLOW_EVM_CHAIN_ID || '747'),
  RPC_URL: process.env.NEXT_PUBLIC_FLOW_EVM_RPC_URL || 'https://mainnet.evm.nodes.onflow.org',
  EXPLORER_URL: 'https://evm.flowscan.io',
  
  // Mainnet configuration
  ENABLE_BUFFAFLOW_BYPASS: true,
  ENABLE_TREASURY_FEES: true,
} as const

// Updated ABIs with mainnet contract functions
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
  // Profile creation - 4 parameters and payable
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
  // ERC404 contract - ERC721 balance
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "erc721BalanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // ERC404 contract - check if token ID exists as NFT
  {
    "inputs": [{"name": "id", "type": "uint256"}],
    "name": "erc721TokensBankedInQueue",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Helper functions for configuration
export const getNetworkConfig = () => {
  return {
    chainId: CONFIG.CHAIN_ID,
    isMainnet: process.env.NEXT_PUBLIC_ENVIRONMENT === 'mainnet',
    rpcUrl: CONFIG.RPC_URL,
    explorerUrl: CONFIG.EXPLORER_URL,
    networkName: 'Flow EVM Mainnet',
    hasBuffaflow: true
  }
}

// Get current network configuration
export const CURRENT_NETWORK = getNetworkConfig()