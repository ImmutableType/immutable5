# ImmutableType Technical Documentation

Welcome to the ImmutableType technical documentation. This documentation is designed for developers who want to understand, contribute to, or integrate with the ImmutableType platform.

## Documentation Structure

### Getting Started
- **[Getting Started Guide](./getting-started.md)** - Quick start guide for new developers
- **[Installation & Setup](./installation.md)** - Detailed setup instructions
- **[Development Environment](./development.md)** - Setting up your development environment

### Architecture
- **[System Architecture](./architecture.md)** - High-level system design and architecture
- **[Smart Contracts](./smart-contracts.md)** - Smart contract documentation
- **[Service Layer](./services.md)** - Service layer architecture and patterns

### Integration Guides
- **[Wallet Integration](./wallet-integration.md)** - Multi-wallet support (MetaMask, Flow EVM)
- **[EIP-6963 Implementation](./eip6963.md)** - EIP-6963 wallet discovery implementation
- **[Contract Integration](./contract-integration.md)** - How to interact with smart contracts

### API Reference
- **[Service API](./api/services.md)** - Service layer API reference
- **[Hooks API](./api/hooks.md)** - React hooks API reference
- **[Web3 Utilities](./api/web3.md)** - Web3 utility functions

### Contributing
- **[Contributing Guidelines](./contributing.md)** - How to contribute to the project
- **[Code Style Guide](./code-style.md)** - Coding standards and conventions
- **[Testing Guide](./testing.md)** - Testing strategies and guidelines

### Deployment
- **[Deployment Guide](./deployment.md)** - Production deployment instructions
- **[Environment Configuration](./environment.md)** - Environment variables and configuration

---

## Quick Links

- **Production App**: https://app.immutabletype.com
- **GitHub Repository**: https://github.com/ImmutableType/immutable5
- **Flow EVM Explorer**: https://evm.flowscan.io

---

## Key Concepts

### Flow EVM vs Native Flow
ImmutableType is built on **Flow EVM** (Ethereum Virtual Machine compatible), not native Flow/Cadence. This means:
- Uses Ethereum-compatible wallets (MetaMask, Flow EVM Wallet)
- Uses Solidity smart contracts
- Uses EIP-1193/EIP-6963 standards
- **Does NOT support Cadence/native Flow wallets**

### Multi-Wallet Support
The platform supports multiple wallet types via EIP-6963:
- **MetaMask** - Primary wallet option
- **Flow EVM Wallet** - Native Flow EVM wallet
- **Future**: WalletConnect support planned

### Service Layer Pattern
All smart contract interactions go through a service layer:
- `ProfileNFTService` - Profile NFT operations
- `BookmarkNFTService` - Bookmark NFT operations
- `TokenQualifierService` - Token qualification checks
- `MintedBookmarkService` - Bookmark querying

---

## Need Help?

- Check the [Troubleshooting Guide](./troubleshooting.md)
- Review [Common Issues](./common-issues.md)
- Open an issue on GitHub
