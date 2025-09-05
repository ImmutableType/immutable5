// Test Flow EVM Testnet Connection
import { createPublicClient, http } from 'viem'

const flowEvmTestnet = {
  id: 545,
  name: 'Flow EVM Testnet',
  network: 'flow-evm-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'FLOW',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: { http: ['https://testnet.evm.nodes.onflow.org'] },
  },
  blockExplorers: {
    default: { name: 'FlowScan', url: 'https://evm-testnet.flowscan.io' },
  },
}

// Create client
const client = createPublicClient({
  chain: flowEvmTestnet,
  transport: http('https://testnet.evm.nodes.onflow.org')
})

async function testConnection() {
  try {
    console.log('🧪 Testing Flow EVM Testnet connection...')
    
    // Test 1: Get latest block number
    const blockNumber = await client.getBlockNumber()
    console.log('✅ Latest block:', blockNumber.toString())
    
    // Test 2: Check if our contracts exist
    const contracts = {
      'ProfileNFT': '0x09512878ac5662aFDE0bE6046d12B2eEa30A00Fe',
      'TokenQualifier': '0x78b9240F3EF69cc517A66564fBC488C5E5309DF7',
      'BUFFAFLOW': '0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798',
      'Treasury': '0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2'
    }
    
    for (const [name, address] of Object.entries(contracts)) {
      try {
        const code = await client.getBytecode({ address })
        const exists = code && code !== '0x'
        console.log(`${exists ? '✅' : '❌'} ${name}: ${address} ${exists ? 'EXISTS' : 'NOT FOUND'}`)
        
        if (exists) {
          console.log(`   📝 Bytecode length: ${code.length} characters`)
        }
      } catch (error) {
        console.log(`❌ ${name}: ${address} ERROR - ${error.message}`)
      }
    }
    
    console.log('🎉 Connection test complete!')
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
  }
}

testConnection()