Here's the updated content to append to your existing README.md:

```markdown

## Current Status (September 4, 2025)

### Phase 1: Complete ✅
- **ProfileNFT**: `0x09512878ac5662aFDE0bE6046d12B2eEa30A00Fe`
- **TokenQualifier**: `0x78b9240F3EF69cc517A66564fBC488C5E5309DF7`
- **Network**: Flow EVM Testnet (Chain ID: 545)
- **Explorer**: https://evm-testnet.flowscan.io

### Phase 2: In Development 🔄
Building Tier 0 profile creation system with user journey: Connect wallet → Create profile → Pay fee or qualify via tokens.

#### Fee Structure
- **Profile Creation**: 3 FLOW tokens to treasury wallet
- **Fee Bypass**: 100+ $BUFFAFLOW tokens OR any $BUFFAFLOW NFT
- **BUFFAFLOW Contract**: `0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798`
- **Treasury Wallet**: `0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2`

#### Technical Stack
- **Web3 Library**: viem + wagmi (for durability)
- **RPC Endpoint**: https://testnet.evm.nodes.onflow.org
- **Profile DID Format**: `did:pkh:eip155:545:0x{walletAddress}`

## Project Structure

### Application (Next.js App Router)
```
app/
├── page.tsx                 # Landing page
├── layout.tsx              # Root layout
├── globals.css             # Global styles
└── profile/
    ├── create/page.tsx     # Tier 0 profile creation
    ├── tier1/page.tsx      # Future Farcaster integration
    └── layout.tsx          # Profile section layout
```

### Business Logic
```
lib/
├── services/profile/
│   ├── ProfileNFT.ts       # Contract interaction service
│   └── TokenQualifier.ts   # Fee bypass logic
├── hooks/
│   └── useProfile.ts       # Profile operations
├── types/
│   └── profile.ts          # Type definitions
└── web3/
    ├── providers.ts        # Flow EVM connection
    └── contracts.ts        # Contract configuration
```

## Installation & Setup

```bash
# Install dependencies
npm install

# Add Web3 dependencies for viem/wagmi
npm install viem wagmi @tanstack/react-query @wagmi/core

# Run development server
npm run dev
```

## Environment Configuration

Create `.env.local` with:
```
NEXT_PUBLIC_FLOW_EVM_RPC=https://testnet.evm.nodes.onflow.org
NEXT_PUBLIC_CHAIN_ID=545
NEXT_PUBLIC_PROFILE_NFT_ADDRESS=0x09512878ac5662aFDE0bE6046d12B2eEa30A00Fe
NEXT_PUBLIC_TOKEN_QUALIFIER_ADDRESS=0x78b9240F3EF69cc517A66564fBC488C5E5309DF7
```

## Architecture Documents

- **Complete Architecture**: `docs/architecture.md` - Detailed system design and implementation status
- **Contract Specifications**: Available in deployed contract addresses above
- **Phase Documentation**: Each phase includes detailed handoff documents for development continuity

## Repository

- **GitHub**: https://github.com/ImmutableType/immutable5
- **Documentation**: Comprehensive architecture and implementation guides
- **Status**: Phase 1 deployed, Phase 2 active development

## Contributing

This project follows a phase-based development approach with detailed documentation for each implementation stage. Reference the architecture documentation for complete system understanding before contributing.
```

This update preserves your existing content while adding current status, contract addresses, project structure details, and setup instructions for the Phase 2 development work.




# Immutable5 - Next Generation Platform

**Built on Flow EVM blockchain.**

## Overview

Immutable5 is the next-generation decentralized platform starting with a comprehensive tiered identity system. Phase 1 focuses on ProfileNFT contracts that enable progressive identity verification through multiple pathways.

## Architecture

### Smart Contracts (Flow EVM)
- **ProfileNFT Contract**: Tiered identity system with transferable profiles
- **TokenQualifier Contract**: Flexible token requirements for tier advancement
- **Deployed Contracts**: *(Will be updated after deployment)*
  - ProfileNFT: `0x[contract-address]` (Flow EVM)
  - TokenQualifier: `0x[contract-address]` (Flow EVM)

### Tier System
- **Tier 0**: Basic wallet-only profiles
- **Tier 1**: Farcaster social verification
- **Tier 2**: Crossmint KYC identity verification
- **Tier 3+**: Advanced verification methods (zK proofs, etc.)

### Key Features
- Progressive identity verification
- Transferable NFT profiles with data reset
- Multiple verification pathways (Farcaster, Crossmint, Admin)
- Anti-sybil mechanisms
- Built for Flow EVM ecosystem

## Development Phases

1. **Phase 1**: Core ProfileNFT contracts ✅
2. **Phase 2**: Farcaster integration
3. **Phase 3**: UI development & testing
4. **Phase 4**: Crossmint KYC integration
5. **Phase 5**: Advanced features & zK proofs

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev