# Developer FAQ

Frequently asked questions from developers working with ImmutableType.

## General Questions

### What is Flow EVM?

Flow EVM is an Ethereum Virtual Machine (EVM) compatible layer on the Flow blockchain. It allows you to use Ethereum tools (MetaMask, ethers.js, etc.) while benefiting from Flow's infrastructure.

### Why Flow EVM instead of Ethereum?

- Lower gas costs
- Faster transaction times
- EVM compatibility (can use existing Ethereum tools)
- Growing ecosystem

### Can I use this on Ethereum mainnet?

The contracts are deployed on Flow EVM Mainnet. To use on Ethereum, you'd need to deploy new contracts. The code is compatible, but addresses would be different.

## Wallet Questions

### Why doesn't my Cadence wallet work?

Cadence wallets are for native Flow blockchain, not Flow EVM. This app requires **Flow EVM wallets** (Ethereum-compatible). You need either:
- MetaMask (with Flow EVM network configured)
- Flow EVM Wallet extension

### How do I add Flow EVM to MetaMask?

1. Open MetaMask
2. Click network dropdown → "Add Network"
3. Enter:
   - Network Name: Flow EVM Mainnet
   - RPC URL: `https://mainnet.evm.nodes.onflow.org`
   - Chain ID: `747`
   - Currency Symbol: FLOW
   - Block Explorer: `https://evm.flowscan.io`

### Can I add WalletConnect support?

Yes! It's planned for future releases. The unified wallet system is designed to be extensible. See [Wallet Integration Guide](./wallet-integration.md) for how to add new wallets.

## Development Questions

### How do I test locally?

1. Clone repository
2. Install dependencies: `npm install`
3. Set up `.env.local` with contract addresses
4. Run: `npm run dev`
5. Connect wallet and test

### How do I deploy contracts locally?

```bash
# Start Hardhat node
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy-profile.js --network localhost

# Update .env.local with deployed addresses
```

### Can I use this codebase as a template?

Yes! The codebase is open source. Feel free to use it as a template for your own projects. Just remember to:
- Update contract addresses
- Change branding/content
- Review and customize for your needs

## Integration Questions

### Can I integrate ImmutableType contracts into my app?

Yes! See [Contract Integration Guide](./contract-integration.md) for details. The contracts are public and can be called from any EVM-compatible application.

### How do I check if a user has a profile?

```typescript
const hasProfile = await profileNFT.hasProfile(userAddress)
```

### How do I get profile data?

```typescript
const profile = await profileNFT.getProfileByAddress(userAddress)
```

### Can I create profiles programmatically?

Yes, but users must sign the transaction. You can't create profiles on behalf of users without their wallet signature.

## Technical Questions

### Why use a service layer instead of direct contract calls?

- **Abstraction**: Hides contract complexity
- **Consistency**: Standardized error handling
- **Flexibility**: Easy to swap implementations
- **Testing**: Easier to mock and test

### How does EIP-6963 work?

EIP-6963 is an event-based standard. Wallets announce themselves via events, and dApps listen for these announcements. This allows multiple wallets to coexist without conflicts.

### Why TypeScript?

- Type safety catches errors early
- Better IDE support
- Self-documenting code
- Easier refactoring

### Why Next.js App Router?

- Modern React patterns
- Better performance
- Improved developer experience
- Server components support

## Troubleshooting

### Build fails with TypeScript errors

```bash
npm run lint
# Fix errors shown
```

### Wallet not connecting

1. Check wallet is installed and enabled
2. Check browser console for errors
3. Verify network configuration
4. Try hard refresh

### Contract calls failing

1. Verify contract addresses
2. Check network (must be Flow EVM Mainnet)
3. Check gas/balance
4. Verify ABI matches contract

## Contributing

### How do I contribute?

See [Contributing Guidelines](./contributing.md) for details. General process:
1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### What should I work on?

Check GitHub issues for:
- Bug fixes
- Feature requests
- Documentation improvements
- Performance optimizations

### Do I need to sign a CLA?

Not currently. Just follow the contributing guidelines.

## Further Reading

- [Getting Started Guide](./getting-started.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Contributing Guidelines](./contributing.md)
- [Architecture Documentation](./architecture.md)
