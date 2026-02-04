# Quick Reference Guide

Quick reference for common tasks and code snippets.

## Wallet Connection

```typescript
import { useUnifiedWallet } from '@/lib/hooks/useUnifiedWallet'

const { address, isConnected, connectWallet } = useUnifiedWallet()

// Connect
await connectWallet('metamask') // or 'flow-wallet'
```

## Profile Operations

```typescript
import { ProfileNFTService } from '@/lib/services/profile/ProfileNFT'

const service = new ProfileNFTService()
await service.initialize(provider)

// Create profile
const result = await service.createBasicProfile(profileData, address, provider)

// Get profile
const profile = await service.getProfile(profileId)

// Check if has profile
const hasProfile = await service.hasProfile(address)
```

## Bookmark Operations

```typescript
import { BookmarkNFTService } from '@/lib/services/bookmark/BookmarkNFTService'

const service = new BookmarkNFTService()
await service.initialize(provider)

// Mint bookmark
const tokenId = await service.mintBookmark(bookmarkData, address, provider)

// Get bookmarks
const bookmarks = await service.getUserBookmarks(address)
```

## Qualification Check

```typescript
import { TokenQualifierService } from '@/lib/services/profile/TokenQualifier'

const service = new TokenQualifierService()
await service.initialize(provider)

// Check qualification
const status = await service.checkQualification(address)
// Returns: { isQualified, tokenBalance, nftCount, canBypassFee }
```

## EIP-6963 Wallet Discovery

```typescript
import { 
  initEIP6963Discovery,
  isFlowWalletAvailable,
  getFlowWalletProvider 
} from '@/lib/web3/eip6963'

// Initialize
initEIP6963Discovery()

// Check availability
if (isFlowWalletAvailable()) {
  const provider = getFlowWalletProvider()
}
```

## Contract Addresses

```typescript
import { CONTRACTS } from '@/lib/web3/contracts'

const addresses = {
  profile: CONTRACTS.PROFILE_NFT,
  bookmark: CONTRACTS.BOOKMARK_NFT,
  qualifier: CONTRACTS.TOKEN_QUALIFIER
}
```

## Network Configuration

```typescript
const FLOW_EVM_MAINNET = {
  chainId: 747,
  chainIdHex: '0x2eb',
  rpcUrl: 'https://mainnet.evm.nodes.onflow.org',
  blockExplorer: 'https://evm.flowscan.io'
}
```

## Common Patterns

### Initialize Service with Provider

```typescript
const { provider } = useUnifiedWallet()
await service.initialize(provider)
```

### Handle Transaction Result

```typescript
const result = await service.createBasicProfile(data, address, provider)
if (result.success) {
  console.log('Success:', result.profileId)
} else {
  console.error('Error:', result.error)
}
```

### Check Connection Before Operation

```typescript
const { isConnected, address, provider } = useUnifiedWallet()

if (!isConnected || !address || !provider) {
  alert('Please connect your wallet')
  return
}

// Proceed with operation
```

## Error Handling

```typescript
try {
  await service.method()
} catch (error) {
  if (error.code === 4001) {
    // User rejected
  } else {
    // Other error
  }
}
```

## Further Reading

- [Wallet Integration Guide](./wallet-integration.md)
- [Service Layer Documentation](./services.md)
- [Smart Contracts Documentation](./smart-contracts.md)
- [API Reference](./api/)
