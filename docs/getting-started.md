# Getting Started with ImmutableType

This guide will help you get started with the ImmutableType codebase, whether you're contributing, integrating, or just exploring.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm
- **Git** installed
- A code editor (VS Code recommended)
- Basic knowledge of:
  - TypeScript/JavaScript
  - React/Next.js
  - Web3/Ethereum concepts
  - Solidity (for smart contract work)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ImmutableType/immutable5.git
cd immutable5
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Contract Addresses (Mainnet)
NEXT_PUBLIC_PROFILE_NFT_ADDRESS=0xDb742cD47D09Cf7e6f22F24289449C672Ef77934
NEXT_PUBLIC_TOKEN_QUALIFIER_ADDRESS=0xa27e2A0280127cf827876a4795d551865F930687
NEXT_PUBLIC_BOOKMARK_NFT_ADDRESS=0x6652801B89f9E3B4a8847Fd0C4F17e7dCd32dFF5
NEXT_PUBLIC_BUFFAFLOW_ADDRESS=0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798
NEXT_PUBLIC_TREASURY_ADDRESS=0x00000000000000000000228B74E66CBD624Fc

# Network Configuration
NEXT_PUBLIC_FLOW_EVM_CHAIN_ID=747
NEXT_PUBLIC_FLOW_EVM_RPC_URL=https://mainnet.evm.nodes.onflow.org
NEXT_PUBLIC_ENVIRONMENT=mainnet
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### 5. Connect Your Wallet

1. Install [MetaMask](https://metamask.io) or [Flow EVM Wallet](https://flow.com/wallet)
2. Configure Flow EVM Mainnet in your wallet:
   - Network Name: Flow EVM Mainnet
   - RPC URL: `https://mainnet.evm.nodes.onflow.org`
   - Chain ID: `747`
   - Currency Symbol: FLOW
   - Block Explorer: `https://evm.flowscan.io`
3. Click "Connect Wallet" in the app

## Project Structure Overview

```
immutable5/
├── app/                    # Next.js 15 App Router
│   ├── (client)/          # Client-side routes
│   ├── components/        # React components
│   └── layout.tsx         # Root layout
├── contracts/             # Solidity smart contracts
├── lib/                   # Core library code
│   ├── hooks/            # React hooks
│   ├── services/         # Service layer
│   ├── web3/             # Web3 utilities
│   └── types/            # TypeScript types
├── scripts/              # Deployment scripts
└── docs/                 # Documentation
```

## Key Files to Understand

### Frontend
- `app/components/layout/Navigation.tsx` - Main navigation with wallet connection
- `app/components/ui/WalletSelector.tsx` - Wallet selection modal
- `app/(client)/profile/create/page.tsx` - Profile creation page

### Services
- `lib/services/profile/ProfileNFT.ts` - Profile NFT service
- `lib/services/bookmark/BookmarkNFTService.ts` - Bookmark NFT service
- `lib/services/profile/TokenQualifier.ts` - Token qualification service

### Hooks
- `lib/hooks/useUnifiedWallet.ts` - Unified wallet connection hook
- `lib/web3/eip6963.ts` - EIP-6963 wallet discovery

### Web3
- `lib/web3/contracts.ts` - Contract addresses and ABIs
- `lib/web3/chains.ts` - Chain configuration

## Next Steps

1. Read the [Architecture Documentation](./architecture.md)
2. Review the [Wallet Integration Guide](./wallet-integration.md)
3. Explore the [Service Layer Documentation](./services.md)
4. Check out [Smart Contracts](./smart-contracts.md)

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Smart Contracts (if working with contracts)
npx hardhat compile      # Compile contracts
npx hardhat test         # Run tests
npx hardhat run scripts/deploy-profile.js --network localhost
```

## Getting Help

- Check the [Troubleshooting Guide](./troubleshooting.md)
- Review [Common Issues](./common-issues.md)
- Open an issue on [GitHub](https://github.com/ImmutableType/immutable5/issues)
