# Service API Reference

Complete API reference for all services in the ImmutableType codebase.

## ProfileNFTService

**Location:** `lib/services/profile/ProfileNFT.ts`

### Methods

#### `initialize(provider?: BrowserProvider): Promise<void>`

Initializes service with a provider for write operations.

```typescript
await service.initialize(provider)
```

#### `initializeReadOnly(): Promise<void>`

Initializes service in read-only mode (uses public RPC).

```typescript
await service.initializeReadOnly()
```

#### `createBasicProfile(profileData, address, provider?): Promise<ProfileCreationResult>`

Creates a new profile NFT.

**Parameters:**
- `profileData`: `ProfileData` - Profile information
- `address`: `string` - User address
- `provider?`: `BrowserProvider` - Optional provider

**Returns:**
```typescript
{
  success: boolean
  profileId?: string
  transactionHash?: string
  error?: string
}
```

#### `getProfile(profileId): Promise<ProfileDisplayData>`

Gets profile data by ID.

**Returns:**
```typescript
{
  tier: number
  did: string
  displayName: string
  bio: string
  location: string
  avatarUrl: string
  createdAt: number
  isActive: boolean
}
```

#### `getProfileByAddress(address): Promise<ProfileDisplayData | null>`

Gets profile for an address.

#### `hasProfile(address): Promise<boolean>`

Checks if address has a profile.

#### `isProfileOwner(profileId): Promise<boolean>`

Checks if connected address owns profile.

## TokenQualifierService

**Location:** `lib/services/profile/TokenQualifier.ts`

### Methods

#### `initialize(provider?: BrowserProvider): Promise<void>`

Initializes service with provider.

#### `checkQualification(address): Promise<QualificationStatus>`

Checks if address qualifies for fee bypass.

**Returns:**
```typescript
{
  isQualified: boolean
  tokenBalance: string
  nftCount: number
  canBypassFee: boolean
}
```

## BookmarkNFTService

**Location:** `lib/services/bookmark/BookmarkNFTService.ts`

### Methods

#### `initialize(provider?: BrowserProvider): Promise<void>`

Initializes service with provider.

#### `mintBookmark(bookmarkData, address, provider?): Promise<string>`

Mints a new bookmark NFT.

**Parameters:**
- `bookmarkData`: `{ title: string, url: string, description: string }`
- `address`: `string`
- `provider?`: `BrowserProvider`

**Returns:** `string` - Token ID

#### `getBookmark(tokenId): Promise<Bookmark>`

Gets bookmark data.

**Returns:**
```typescript
{
  title: string
  url: string
  description: string
  creator: string
  createdAt: number
}
```

#### `getUserBookmarks(address): Promise<Bookmark[]>`

Gets all bookmarks for an address.

## MintedBookmarkService

**Location:** `lib/services/blockchain/MintedBookmarkService.ts`

### Methods

#### `initialize(provider?: BrowserProvider): Promise<void>`

Initializes service with provider.

#### `getUserMintedBookmarks(address): Promise<MintedBookmark[]>`

Gets all minted bookmarks for a user.

**Returns:**
```typescript
MintedBookmark[] // Array of bookmark objects
```

#### `getTotalBookmarkCount(): Promise<number>`

Gets total number of bookmarks minted.

## Type Definitions

### ProfileData

```typescript
interface ProfileData {
  displayName: string  // 1-100 characters
  bio: string          // 0-500 characters
  location: string     // 0-100 characters
  avatarUrl: string    // Valid URL
}
```

### QualificationStatus

```typescript
interface QualificationStatus {
  isQualified: boolean
  tokenBalance: string
  nftCount: number
  canBypassFee: boolean
}
```

### Bookmark

```typescript
interface Bookmark {
  title: string
  url: string
  description: string
  creator: string
  createdAt: number
}
```

## Error Handling

All services throw errors that should be caught:

```typescript
try {
  const result = await service.createBasicProfile(data, address, provider)
} catch (error) {
  console.error('Service error:', error)
  // Handle error
}
```

## Service Lifecycle

1. **Create instance**: `new ServiceName()`
2. **Initialize**: `await service.initialize(provider)`
3. **Use methods**: `await service.method()`
4. **Service persists**: Can be reused across component renders

## Best Practices

1. **Initialize before use**: Always call `initialize()` first
2. **Pass providers**: Use providers from `useUnifiedWallet`
3. **Handle errors**: Wrap service calls in try-catch
4. **Check connection**: Verify wallet is connected before write operations
5. **Use read-only**: Use `initializeReadOnly()` for queries

## Further Reading

- [Service Layer Documentation](../services.md)
- [Smart Contracts Documentation](../smart-contracts.md)
- [Wallet Integration Guide](../wallet-integration.md)
