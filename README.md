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