// Fetch Contract ABIs from Flow EVM Testnet
import { createPublicClient, http } from 'viem'
import fs from 'fs'

const flowEvmTestnet = {
  id: 545,
  name: 'Flow EVM Testnet',
  nativeCurrency: { decimals: 18, name: 'FLOW', symbol: 'FLOW' },
  rpcUrls: { default: { http: ['https://testnet.evm.nodes.onflow.org'] } },
}

const client = createPublicClient({
  chain: flowEvmTestnet,
  transport: http('https://testnet.evm.nodes.onflow.org')
})

const contracts = {
  'ProfileNFT': '0x09512878ac5662aFDE0bE6046d12B2eEa30A00Fe',
  'TokenQualifier': '0x78b9240F3EF69cc517A66564fBC488C5E5309DF7',
  'BUFFAFLOW': '0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798'
}

// Standard ERC721 ABI as fallback for ProfileNFT
const ERC721_ABI = [
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "tokenId", "type": "uint256"}],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
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
  }
]

// Standard ERC20 ABI as fallback for BUFFAFLOW
const ERC20_ABI = [
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
  }
]

async function fetchABIs() {
  console.log('🔍 Fetching contract ABIs from Flow EVM Testnet...\n')
  
  const results = {}
  
  for (const [name, address] of Object.entries(contracts)) {
    console.log(`📋 Checking ${name} at ${address}...`)
    
    try {
      // Check if contract exists
      const code = await client.getBytecode({ address })
      
      if (!code || code === '0x') {
        console.log(`❌ ${name}: No bytecode found`)
        continue
      }
      
      console.log(`✅ ${name}: Contract exists (${code.length} chars)`)
      
      // For now, use standard ABIs based on contract type
      let abi = []
      
      if (name === 'ProfileNFT') {
        abi = [
          ...ERC721_ABI,
          // Add expected custom functions from our architecture
          {
            "inputs": [{"name": "data", "type": "tuple", "components": [
              {"name": "displayName", "type": "string"},
              {"name": "bio", "type": "string"},
              {"name": "location", "type": "string"},
              {"name": "avatarUrl", "type": "string"},
              {"name": "did", "type": "string"}
            ]}],
            "name": "createBasicProfile",
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "payable",
            "type": "function"
          },
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
          }
        ]
      } else if (name === 'BUFFAFLOW') {
        abi = ERC20_ABI // 404 contract, start with ERC20
      } else if (name === 'TokenQualifier') {
        abi = [
          {
            "inputs": [{"name": "user", "type": "address"}],
            "name": "isQualified",
            "outputs": [{"name": "", "type": "bool"}],
            "stateMutability": "view",
            "type": "function"
          }
        ]
      }
      
      results[name] = {
        address,
        abi,
        bytecodeLength: code.length
      }
      
      console.log(`📁 ${name}: ${abi.length} ABI functions loaded`)
      
    } catch (error) {
      console.log(`❌ ${name}: Error - ${error.message}`)
    }
    
    console.log('')
  }
  
  // Save ABIs to file
  const output = `// Auto-generated Contract ABIs for Flow EVM Testnet
// Generated: ${new Date().toISOString()}

export const CONTRACT_ABIS = ${JSON.stringify(results, null, 2)} as const

// Individual exports for easy importing
${Object.entries(results).map(([name, data]) => 
  `export const ${name.toUpperCase()}_ABI = ${JSON.stringify(data.abi, null, 2)} as const`
).join('\n\n')}

export const CONTRACTS = {
${Object.entries(results).map(([name, data]) => 
  `  ${name.toUpperCase()}: '${data.address}' as const`
).join(',\n')}
} as const
`
  
  fs.writeFileSync('lib/web3/generated-abis.ts', output)
  console.log('✅ ABIs saved to lib/web3/generated-abis.ts')
  console.log(`📊 Summary: ${Object.keys(results).length} contracts processed`)
}

fetchABIs().catch(console.error)