# Contract Integration Guide

Guide for integrating with ImmutableType smart contracts from external applications.

## Overview

ImmutableType contracts are deployed on Flow EVM Mainnet and can be integrated into any EVM-compatible application.

## Contract Addresses

### Mainnet (Flow EVM)

```typescript
const CONTRACTS = {
  PROFILE_NFT: '0xDb742cD47D09Cf7e6f22F24289449C672Ef77934',
  TOKEN_QUALIFIER: '0xa27e2A0280127cf827876a4795d551865F930687',
  BOOKMARK_NFT: '0x6652801B89f9E3B4a8847Fd0C4F17e7dCd32dFF5',
  BUFFAFLOW: '0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798'
}
```

## Network Configuration

```typescript
const FLOW_EVM_MAINNET = {
  chainId: 747,
  chainIdHex: '0x2eb',
  name: 'Flow EVM Mainnet',
  rpcUrl: 'https://mainnet.evm.nodes.onflow.org',
  blockExplorer: 'https://evm.flowscan.io',
  currency: {
    name: 'Flow',
    symbol: 'FLOW',
    decimals: 18
  }
}
```

## Integration Examples

### Using ethers.js

```typescript
import { ethers } from 'ethers'

// Connect to Flow EVM
const provider = new ethers.JsonRpcProvider('https://mainnet.evm.nodes.onflow.org')

// Or use browser provider
const browserProvider = new ethers.BrowserProvider(window.ethereum)

// Create contract instance
const profileNFT = new ethers.Contract(
  '0xDb742cD47D09Cf7e6f22F24289449C672Ef77934',
  PROFILE_NFT_ABI,
  provider
)

// Read operations
const profile = await profileNFT.getProfile(profileId)

// Write operations (requires signer)
const signer = await browserProvider.getSigner()
const profileNFTWithSigner = profileNFT.connect(signer)
const tx = await profileNFTWithSigner.createBasicProfile(profileData, { value: fee })
```

### Using viem

```typescript
import { createPublicClient, createWalletClient, http } from 'viem'
import { flowEVMMainnet } from 'viem/chains'

// Public client for reads
const publicClient = createPublicClient({
  chain: flowEVMMainnet,
  transport: http('https://mainnet.evm.nodes.onflow.org')
})

// Read operations
const profile = await publicClient.readContract({
  address: '0xDb742cD47D09Cf7e6f22F24289449C672Ef77934',
  abi: PROFILE_NFT_ABI,
  functionName: 'getProfile',
  args: [profileId]
})

// Wallet client for writes
const walletClient = createWalletClient({
  chain: flowEVMMainnet,
  transport: custom(window.ethereum)
})

// Write operations
const hash = await walletClient.writeContract({
  address: '0xDb742cD47D09Cf7e6f22F24289449C672Ef77934',
  abi: PROFILE_NFT_ABI,
  functionName: 'createBasicProfile',
  args: [profileData],
  value: BigInt(fee)
})
```

## Contract ABIs

ABIs are available in the codebase:
- `lib/web3/contracts.ts` - Contains all ABIs

### ProfileNFT ABI

Key functions:
- `createBasicProfile(profileData, fee)` - Create profile
- `getProfile(profileId)` - Get profile data
- `getProfileByAddress(address)` - Get profile by address
- `hasProfile(address)` - Check if address has profile

### BookmarkNFT ABI

Key functions:
- `mintBookmark(title, url, description)` - Mint bookmark
- `getBookmark(tokenId)` - Get bookmark data
- `getUserBookmarks(address)` - Get user's bookmarks

### TokenQualifier ABI

Key functions:
- `isQualified(address)` - Check qualification
- `getQualificationStatus(address)` - Get detailed status

## Integration Patterns

### Check if User Has Profile

```typescript
const hasProfile = await profileNFT.hasProfile(userAddress)
if (hasProfile) {
  const profile = await profileNFT.getProfileByAddress(userAddress)
  // Use profile data
}
```

### Create Profile

```typescript
const profileData = {
  displayName: 'John Doe',
  bio: 'Journalist',
  location: 'New York',
  avatarUrl: 'https://example.com/avatar.jpg'
}

const fee = ethers.parseEther('3') // 3 FLOW

const tx = await profileNFT.createBasicProfile(profileData, { value: fee })
await tx.wait()

// Get profile ID from transaction receipt
const receipt = await tx.wait()
const profileId = extractProfileIdFromReceipt(receipt)
```

### Mint Bookmark

```typescript
const bookmarkData = {
  title: 'Article Title',
  url: 'https://example.com/article',
  description: 'Article description'
}

const tx = await bookmarkNFT.mintBookmark(
  bookmarkData.title,
  bookmarkData.url,
  bookmarkData.description
)
await tx.wait()
```

## Event Listening

### Listen for Profile Creation

```typescript
profileNFT.on('ProfileCreated', (profileId, owner, displayName) => {
  console.log('Profile created:', { profileId, owner, displayName })
})
```

### Listen for Bookmark Minting

```typescript
bookmarkNFT.on('BookmarkMinted', (tokenId, creator, title, url) => {
  console.log('Bookmark minted:', { tokenId, creator, title, url })
})
```

## Error Handling

### Common Errors

```typescript
try {
  await contract.method()
} catch (error) {
  if (error.code === 4001) {
    // User rejected transaction
  } else if (error.code === -32603) {
    // Internal JSON-RPC error
  } else {
    // Other error
  }
}
```

## Gas Estimation

```typescript
// Estimate gas before sending
const gasEstimate = await contract.createBasicProfile.estimateGas(
  profileData,
  { value: fee }
)

// Send with gas limit
const tx = await contract.createBasicProfile(profileData, {
  value: fee,
  gasLimit: gasEstimate * BigInt(120) / BigInt(100) // 20% buffer
})
```

## Best Practices

1. **Always check network**: Verify you're on Flow EVM Mainnet
2. **Handle errors**: Wrap contract calls in try-catch
3. **Estimate gas**: Estimate before sending transactions
4. **Verify transactions**: Wait for confirmations
5. **Use events**: Listen for events instead of polling

## Further Reading

- [Smart Contracts Documentation](./smart-contracts.md)
- [Service Layer Documentation](./services.md)
- [Flow EVM Documentation](https://docs.onflow.org/evm/)
