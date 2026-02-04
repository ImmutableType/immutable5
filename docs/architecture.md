# System Architecture

**Last Updated:** January 6, 2026  
**Status:** Production - Flow EVM Mainnet

## Overview

ImmutableType is a decentralized journalism platform built on Flow EVM Mainnet. The platform enables immutable, transferable identity verification for journalists and readers through on-chain NFTs and smart contracts.

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.9 (App Router)
- **UI Library**: React 19.1.0
- **Styling**: CSS Modules + Global CSS
- **Language**: TypeScript 5+

### Blockchain
- **Network**: Flow EVM Mainnet (Chain ID: 747)
- **Smart Contracts**: Solidity 0.8+
- **Web3 Library**: ethers.js 6.15.0
- **Wallet Integration**: MetaMask SDK + EIP-6963

### Infrastructure
- **Hosting**: Railway
- **Domain**: app.immutabletype.com
- **Build**: Next.js production build
- **Deployment**: Automated via GitHub

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  MetaMask    │  │ Flow Wallet  │  │  Other...    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                        │
                        │ EIP-6963 / EIP-1193
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Frontend (Railway)                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React Components (App Router)                    │   │
│  │  - Navigation                                     │   │
│  │  - Profile Pages                                  │   │
│  │  - Bookmark Components                            │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Service Layer                                    │   │
│  │  - ProfileNFTService                             │   │
│  │  - BookmarkNFTService                            │   │
│  │  - TokenQualifierService                         │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Web3 Layer                                       │   │
│  │  - useUnifiedWallet                              │   │
│  │  - EIP-6963 Discovery                           │   │
│  │  - Contract ABIs                                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        │
                        │ RPC Calls
                        ▼
┌─────────────────────────────────────────────────────────┐
│            Flow EVM Mainnet (Chain ID: 747)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ ProfileNFT   │  │ BookmarkNFT  │  │TokenQualifier│  │
│  │ 0xDb74...    │  │ 0x6652...    │  │ 0xa27e...    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Wallet Integration Layer

**Purpose**: Unified wallet connection supporting multiple wallet types

**Components**:
- `lib/web3/eip6963.ts` - EIP-6963 wallet discovery
- `lib/hooks/useUnifiedWallet.ts` - Unified wallet hook
- `app/components/ui/WalletSelector.tsx` - Wallet selection UI

**Features**:
- Multi-wallet support (MetaMask, Flow EVM Wallet)
- Automatic network switching
- Connection state management
- Event listener management

### 2. Service Layer

**Purpose**: Abstraction over smart contract interactions

**Services**:
- `ProfileNFTService` - Profile operations
- `BookmarkNFTService` - Bookmark operations
- `TokenQualifierService` - Qualification checks
- `MintedBookmarkService` - Bookmark queries

**Pattern**:
```typescript
Service → Contract → Blockchain
```

### 3. Smart Contract Layer

**Contracts**:
- **ProfileNFTFixed** - ERC721 for user profiles
- **BookmarkNFT** - ERC721 for bookmarks
- **TokenQualifierFixed** - Qualification checks

**Features**:
- On-chain data storage
- Transferable NFTs
- Fee-based operations
- Token-gated features

## Data Flow

### Profile Creation Flow

```
User → Wallet Connection → ProfileNFTService → Contract → Blockchain
                                                      ↓
User ← Profile ID ← Transaction Receipt ← Event ← Blockchain
```

### Bookmark Minting Flow

```
User → BookmarkNFTService → Contract → Blockchain
                                    ↓
User ← Token ID ← Transaction Receipt ← Event ← Blockchain
```

## State Management

### Client-Side State

- **React State**: Component-level state
- **Hooks**: Custom hooks for shared state
- **No Global State**: No Redux/Zustand (by design)

### On-Chain State

- **Profile Data**: Stored in ProfileNFT contract
- **Bookmark Data**: Stored in BookmarkNFT contract
- **Qualification**: Calculated from token balances

## Network Architecture

### Flow EVM Mainnet

- **Chain ID**: 747 (0x2eb)
- **RPC**: https://mainnet.evm.nodes.onflow.org
- **Explorer**: https://evm.flowscan.io
- **Currency**: FLOW

### Network Switching

Automatic network switching implemented:
1. Check current network on connection
2. If wrong network, prompt switch
3. Add network if not present
4. Verify switch success

## Security Architecture

### Smart Contracts

- **Immutable**: Contracts cannot be changed after deployment
- **Access Control**: Admin functions protected
- **Input Validation**: All inputs validated
- **Reentrancy Protection**: Checks-effects-interactions pattern

### Frontend

- **No Secrets**: No sensitive data in client code
- **Input Validation**: Client and server validation
- **Error Handling**: Comprehensive error handling
- **Type Safety**: TypeScript for type safety

## Performance Considerations

### Optimization Strategies

1. **Code Splitting**: Next.js automatic code splitting
2. **Image Optimization**: Next.js Image component
3. **RPC Optimization**: Read-only providers for queries
4. **Caching**: Browser caching for static assets

### RPC Rate Limiting

- Use read-only providers for queries
- Batch requests when possible
- Implement request throttling if needed

## Deployment Architecture

### Railway Deployment

```
GitHub → Railway → Build → Deploy → Production
```

### Build Process

1. Install dependencies (`npm install`)
2. Build Next.js app (`npm run build`)
3. Start production server (`npm start`)

### Environment Management

- Development: `.env.local`
- Production: Railway environment variables
- All `NEXT_PUBLIC_*` variables exposed to client

## Extension Points

### Adding New Wallets

1. Update EIP-6963 discovery
2. Add to unified wallet hook
3. Update WalletSelector UI

### Adding New Services

1. Create service class
2. Implement initialize methods
3. Add to service exports
4. Document in API reference

### Adding New Contracts

1. Deploy contract
2. Add address to contracts.ts
3. Add ABI to contracts.ts
4. Create service class
5. Update documentation

## Further Reading

- [Wallet Integration Guide](./wallet-integration.md)
- [Smart Contracts Documentation](./smart-contracts.md)
- [Service Layer Documentation](./services.md)
- [EIP-6963 Implementation](./eip6963.md)
