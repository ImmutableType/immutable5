# Smart Contracts Documentation

ImmutableType uses three main smart contracts deployed on Flow EVM Mainnet. This document describes each contract, its purpose, and how to interact with it.

## Contract Overview

### Production Addresses (Flow EVM Mainnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| **ProfileNFTFixed** | `0xDb742cD47D09Cf7e6f22F24289449C672Ef77934` | User profile NFTs |
| **TokenQualifierFixed** | `0xa27e2A0280127cf827876a4795d551865F930687` | Token qualification checks |
| **BookmarkNFT** | `0x6652801B89f9E3B4a8847Fd0C4F17e7dCd32dFF5` | Bookmark NFTs |

### External Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| **BUFFAFLOW** | `0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798` | BUFFAFLOW token (ERC20) |
| **Treasury** | `0x00000000000000000000228B74E66CBD624Fc` | Fee collection address |

## ProfileNFTFixed Contract

### Purpose
Manages user profile NFTs with tiered verification system.

### Key Features
- **Tiered Verification**: 0 (Basic) to 3+ (Enhanced)
- **Transferable**: Profiles can be transferred between addresses
- **Fee-Based Creation**: 3 FLOW creation fee (bypassable with BUFFAFLOW)
- **Admin Verification**: Admin can verify profiles to higher tiers

### Main Functions

#### `createBasicProfile(profileData, fee)`
Creates a new profile NFT.

**Parameters:**
- `profileData`: Struct containing:
  - `displayName`: string (1-100 chars)
  - `bio`: string (0-500 chars)
  - `location`: string (0-100 chars)
  - `avatarUrl`: string (valid URL)
- `fee`: uint256 (3 FLOW in wei, or 0 if qualified)

**Returns:** `uint256` - Profile ID (token ID)

**Events:**
- `ProfileCreated(uint256 indexed profileId, address indexed owner, string displayName)`

#### `updateProfile(profileId, profileData)`
Updates an existing profile.

**Parameters:**
- `profileId`: uint256 - Profile token ID
- `profileData`: Same struct as `createBasicProfile`

**Requirements:**
- Caller must own the profile
- Profile must be active

#### `adminVerifyProfile(profileId, tier)`
Admin function to verify a profile to a specific tier.

**Parameters:**
- `profileId`: uint256
- `tier`: uint256 (0-3+)

**Requirements:**
- Only callable by admin

#### `getProfile(profileId)`
Read-only function to get profile data.

**Returns:** Profile struct with all fields

### Service Integration

```typescript
import { ProfileNFTService } from '@/lib/services/profile/ProfileNFT'

const service = new ProfileNFTService()

// Initialize with provider
await service.initialize(provider)

// Create profile
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
```

## TokenQualifierFixed Contract

### Purpose
Checks if a user qualifies for fee bypass based on token holdings.

### Key Features
- **BUFFAFLOW Qualification**: 100+ BUFFAFLOW tokens = fee bypass
- **NFT Qualification**: 1+ BUFFAFLOW NFTs = fee bypass
- **Read-Only Checks**: No state changes, just qualification status

### Main Functions

#### `isQualified(address user)`
Checks if a user qualifies for fee bypass.

**Parameters:**
- `user`: address - User address to check

**Returns:** `bool` - True if qualified

**Logic:**
- Checks BUFFAFLOW token balance (100+ tokens)
- Checks BUFFAFLOW NFT balance (1+ NFTs)
- Returns true if either condition met

#### `getQualificationStatus(address user)`
Returns detailed qualification status.

**Returns:** Struct containing:
- `isQualified`: bool
- `tokenBalance`: uint256
- `nftCount`: uint256
- `canBypassFee`: bool

### Service Integration

```typescript
import { TokenQualifierService } from '@/lib/services/profile/TokenQualifier'

const service = new TokenQualifierService()

// Initialize with provider
await service.initialize(provider)

// Check qualification
const status = await service.checkQualification(address)

if (status.canBypassFee) {
  // User can create profile without paying fee
}
```

## BookmarkNFT Contract

### Purpose
Manages bookmark NFTs for source verification.

### Key Features
- **Daily Limits**: 20 bookmarks per address per day
- **On-Chain Storage**: All bookmark data stored on-chain
- **Creator Attribution**: Tracks creator address
- **Timestamp Tracking**: Records creation time

### Main Functions

#### `mintBookmark(title, url, description)`
Mints a new bookmark NFT.

**Parameters:**
- `title`: string (1-100 chars)
- `url`: string (valid HTTP/HTTPS URL)
- `description`: string (0-300 chars)

**Returns:** `uint256` - Bookmark token ID

**Requirements:**
- Must not exceed daily limit (20 per day)
- URL must be valid HTTP/HTTPS
- Title must be 1-100 characters

**Events:**
- `BookmarkMinted(uint256 indexed tokenId, address indexed creator, string title, string url)`

#### `getBookmark(tokenId)`
Gets bookmark data.

**Returns:** Struct containing:
- `title`: string
- `url`: string
- `description`: string
- `creator`: address
- `createdAt`: uint256 (timestamp)

#### `getUserBookmarks(address user)`
Gets all bookmarks for a user.

**Returns:** `uint256[]` - Array of token IDs

### Service Integration

```typescript
import { BookmarkNFTService } from '@/lib/services/bookmark/BookmarkNFTService'

const service = new BookmarkNFTService()

// Initialize with provider
await service.initialize(provider)

// Mint bookmark
const tokenId = await service.mintBookmark(
  {
    title: 'Article Title',
    url: 'https://example.com/article',
    description: 'Article description'
  },
  address,
  provider
)
```

## Contract ABIs

ABIs are defined in `lib/web3/contracts.ts`:

```typescript
export const PROFILE_NFT_ABI = [/* ... */]
export const TOKEN_QUALIFIER_ABI = [/* ... */]
export const BOOKMARK_NFT_ABI = [/* ... */]
```

## Interacting with Contracts

### Using ethers.js

```typescript
import { ethers } from 'ethers'
import { CONTRACTS, PROFILE_NFT_ABI } from '@/lib/web3/contracts'

// Create provider
const provider = new ethers.BrowserProvider(window.ethereum)
const signer = await provider.getSigner()

// Create contract instance
const contract = new ethers.Contract(
  CONTRACTS.PROFILE_NFT,
  PROFILE_NFT_ABI,
  signer
)

// Call contract function
const profileId = await contract.createBasicProfile(
  profileData,
  { value: fee }
)
```

### Using Service Layer (Recommended)

The service layer abstracts contract interactions:

```typescript
import { ProfileNFTService } from '@/lib/services/profile/ProfileNFT'

const service = new ProfileNFTService()
await service.initialize(provider)

// Service handles all contract details
const result = await service.createBasicProfile(profileData, address, provider)
```

## Contract Deployment

### Deployment Scripts

Scripts are in `/scripts`:
- `deploy-profile.js` - Deploy ProfileNFTFixed
- `deploy-fixed-contracts.js` - Deploy all fixed contracts
- `deploy-bookmark.js` - Deploy BookmarkNFT

### Local Deployment

```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy-profile.js --network localhost
```

### Mainnet Deployment

```bash
# Set up .env with private key
PRIVATE_KEY=your_private_key

# Deploy to mainnet
npx hardhat run scripts/deploy-profile.js --network flowEVM
```

## Gas Costs

Approximate gas costs (Flow EVM):

| Operation | Gas Cost | FLOW Cost (approx) |
|-----------|----------|-------------------|
| Create Profile | ~200,000 | ~0.002 FLOW |
| Update Profile | ~100,000 | ~0.001 FLOW |
| Mint Bookmark | ~150,000 | ~0.0015 FLOW |

*Note: Gas costs vary with network conditions*

## Security Considerations

1. **Input Validation**: All contracts validate inputs
2. **Access Control**: Admin functions are protected
3. **Reentrancy**: Contracts use checks-effects-interactions pattern
4. **Overflow Protection**: Solidity 0.8+ has built-in overflow protection

## Contract Upgrades

ProfileNFTFixed and TokenQualifierFixed use OpenZeppelin's upgradeable pattern:

```solidity
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
```

Upgrades require:
- Admin access
- Proper initialization
- Compatibility checks

## Further Reading

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Flow EVM Documentation](https://docs.onflow.org/evm/)
- [Solidity Documentation](https://docs.soliditylang.org/)
