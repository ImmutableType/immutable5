# Service Layer Documentation

The service layer provides a clean abstraction over smart contract interactions. All contract operations should go through services, not direct contract calls.

## Architecture

### Service Pattern

```
Component → Service → Contract → Blockchain
```

Services:
- Abstract contract complexity
- Handle provider management
- Provide type-safe interfaces
- Handle errors consistently
- Support both read-only and write operations

## Core Services

### ProfileNFTService

**Location:** `lib/services/profile/ProfileNFT.ts`

Manages profile NFT operations.

#### Initialization

```typescript
import { ProfileNFTService } from '@/lib/services/profile/ProfileNFT'

const service = new ProfileNFTService()

// Initialize with provider (for write operations)
await service.initialize(provider)

// Or initialize read-only (for queries)
await service.initializeReadOnly()
```

#### Methods

**`createBasicProfile(profileData, address, provider?)`**
Creates a new profile NFT.

```typescript
const result = await service.createBasicProfile(
  {
    displayName: 'John Doe',
    bio: 'Journalist',
    location: 'New York',
    avatarUrl: 'https://example.com/avatar.jpg'
  },
  address,
  provider
)

if (result.success) {
  console.log('Profile ID:', result.profileId)
} else {
  console.error('Error:', result.error)
}
```

**`getProfile(profileId)`**
Gets profile data by ID.

```typescript
const profile = await service.getProfile(profileId)
// Returns: { tier, did, displayName, bio, location, avatarUrl, createdAt, isActive }
```

**`getProfileByAddress(address)`**
Gets profile for an address.

```typescript
const profile = await service.getProfileByAddress(address)
```

**`hasProfile(address)`**
Checks if address has a profile.

```typescript
const hasProfile = await service.hasProfile(address)
```

**`isProfileOwner(profileId)`**
Checks if connected address owns profile.

```typescript
const isOwner = await service.isProfileOwner(profileId)
```

### TokenQualifierService

**Location:** `lib/services/profile/TokenQualifier.ts`

Checks token qualification status.

#### Initialization

```typescript
import { TokenQualifierService } from '@/lib/services/profile/TokenQualifier'

const service = new TokenQualifierService()
await service.initialize(provider)
```

#### Methods

**`checkQualification(address)`**
Checks if address qualifies for fee bypass.

```typescript
const status = await service.checkQualification(address)
// Returns: { isQualified, tokenBalance, nftCount, canBypassFee }
```

### BookmarkNFTService

**Location:** `lib/services/bookmark/BookmarkNFTService.ts`

Manages bookmark NFT operations.

#### Initialization

```typescript
import { BookmarkNFTService } from '@/lib/services/bookmark/BookmarkNFTService'

const service = new BookmarkNFTService()
await service.initialize(provider)
```

#### Methods

**`mintBookmark(bookmarkData, address, provider?)`**
Mints a new bookmark NFT.

```typescript
const tokenId = await service.mintBookmark(
  {
    title: 'Article Title',
    url: 'https://example.com/article',
    description: 'Description'
  },
  address,
  provider
)
```

**`getBookmark(tokenId)`**
Gets bookmark data.

```typescript
const bookmark = await service.getBookmark(tokenId)
// Returns: { title, url, description, creator, createdAt }
```

**`getUserBookmarks(address)`**
Gets all bookmarks for an address.

```typescript
const bookmarks = await service.getUserBookmarks(address)
// Returns: Bookmark[]
```

### MintedBookmarkService

**Location:** `lib/services/blockchain/MintedBookmarkService.ts`

High-level bookmark querying service.

#### Initialization

```typescript
import { MintedBookmarkService } from '@/lib/services/blockchain/MintedBookmarkService'

const service = new MintedBookmarkService()
await service.initialize(provider)
```

#### Methods

**`getUserMintedBookmarks(address)`**
Gets all minted bookmarks for a user.

```typescript
const bookmarks = await service.getUserMintedBookmarks(address)
// Returns: MintedBookmark[]
```

**`getTotalBookmarkCount()`**
Gets total number of bookmarks minted.

```typescript
const count = await service.getTotalBookmarkCount()
```

## Service Patterns

### Provider Management

Services accept optional providers for flexibility:

```typescript
// Use provided provider
await service.initialize(provider)

// Or fall back to default (MetaMask)
await service.initialize()
```

### Error Handling

Services return structured results:

```typescript
// For write operations
const result = await service.createBasicProfile(data, address, provider)
if (result.success) {
  // Success
} else {
  // Handle error
  console.error(result.error)
}

// For read operations
try {
  const profile = await service.getProfile(profileId)
} catch (error) {
  // Handle error
}
```

### Read-Only vs Write Operations

```typescript
// Read-only (no provider needed, uses public RPC)
await service.initializeReadOnly()
const profile = await service.getProfile(profileId)

// Write operations (provider required)
await service.initialize(provider)
const result = await service.createBasicProfile(data, address, provider)
```

## Creating a New Service

### Service Template

```typescript
import { ethers, Contract, BrowserProvider } from 'ethers'
import { CONTRACTS, CONTRACT_ABI } from '../../web3/contracts'

export class MyService {
  private provider: BrowserProvider | null = null
  private contract: Contract | null = null

  async initialize(provider?: BrowserProvider): Promise<void> {
    if (provider) {
      this.provider = provider
    } else {
      // Fallback to default provider
      this.provider = new ethers.BrowserProvider(window.ethereum)
    }

    const signer = await this.provider.getSigner()
    this.contract = new ethers.Contract(
      CONTRACTS.MY_CONTRACT,
      CONTRACT_ABI,
      signer
    )
  }

  async initializeReadOnly(): Promise<void> {
    const readOnlyProvider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_FLOW_EVM_RPC_URL
    )
    this.contract = new ethers.Contract(
      CONTRACTS.MY_CONTRACT,
      CONTRACT_ABI,
      readOnlyProvider
    )
  }

  async myMethod(params: MyParams): Promise<MyResult> {
    if (!this.contract) {
      throw new Error('Service not initialized')
    }

    try {
      const result = await this.contract.myMethod(params)
      return result
    } catch (error) {
      console.error('Error calling myMethod:', error)
      throw error
    }
  }
}
```

### Best Practices

1. **Accept Optional Providers**: Allow services to work with any provider
2. **Separate Read/Write**: Provide `initializeReadOnly()` for queries
3. **Type Safety**: Use TypeScript types for all parameters and returns
4. **Error Handling**: Provide clear error messages
5. **Logging**: Log important operations for debugging

## Service Usage in Components

### Example: Profile Creation

```typescript
'use client'

import { useState } from 'react'
import { useUnifiedWallet } from '@/lib/hooks/useUnifiedWallet'
import { ProfileNFTService } from '@/lib/services/profile/ProfileNFT'

export function CreateProfileForm() {
  const { address, provider, isConnected } = useUnifiedWallet()
  const [loading, setLoading] = useState(false)
  const service = new ProfileNFTService()

  const handleSubmit = async (data: ProfileData) => {
    if (!isConnected || !address || !provider) {
      alert('Please connect your wallet')
      return
    }

    setLoading(true)
    try {
      await service.initialize(provider)
      const result = await service.createBasicProfile(data, address, provider)
      
      if (result.success) {
        console.log('Profile created:', result.profileId)
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Failed to create profile:', error)
      alert('Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Form JSX...
  )
}
```

## Testing Services

### Mock Providers

```typescript
import { ethers } from 'ethers'

// Create mock provider for testing
const mockProvider = {
  getSigner: async () => ({
    getAddress: async () => '0x123...',
    sendTransaction: async () => ({ hash: '0xabc...' })
  })
} as any
```

### Service Testing

```typescript
import { ProfileNFTService } from '@/lib/services/profile/ProfileNFT'

describe('ProfileNFTService', () => {
  let service: ProfileNFTService

  beforeEach(() => {
    service = new ProfileNFTService()
  })

  it('should initialize with provider', async () => {
    await service.initialize(mockProvider)
    // Test service state
  })
})
```

## Further Reading

- [Contract Documentation](./smart-contracts.md)
- [Wallet Integration](./wallet-integration.md)
- [Type Definitions](../lib/types/)
