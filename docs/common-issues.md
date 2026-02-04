# Common Issues & Solutions

Quick reference for common issues and their solutions.

## Wallet Issues

### "Flow Wallet not detected"

**Quick Fix:**
1. Verify Flow EVM Wallet (not Cadence) is installed
2. Refresh the page
3. Check browser console for EIP-6963 announcements

**See**: [Troubleshooting Guide](./troubleshooting.md#flow-wallet-not-detected)

### "MetaMask not connecting"

**Quick Fix:**
1. Check MetaMask is installed and unlocked
2. Verify Flow EVM network is configured
3. Check user didn't reject connection

**See**: [Troubleshooting Guide](./troubleshooting.md#metamask-not-connecting)

## Network Issues

### "Wrong network"

**Quick Fix:**
1. App should auto-switch to Flow EVM
2. If not, manually switch in wallet
3. Verify network configuration

**See**: [Troubleshooting Guide](./troubleshooting.md#wrong-network-error)

## Profile Issues

### "Profile creation fails"

**Quick Fix:**
1. Check FLOW balance (need 3 FLOW)
2. Verify sufficient gas
3. Check if already has profile

**See**: [Troubleshooting Guide](./troubleshooting.md#profile-creation-fails)

## Build Issues

### "Build fails with TypeScript errors"

**Quick Fix:**
```bash
npm run lint
npm run build
```

**See**: [Troubleshooting Guide](./troubleshooting.md#typescript-errors)

### "Module not found"

**Quick Fix:**
```bash
rm -rf .next node_modules
npm install
```

**See**: [Troubleshooting Guide](./troubleshooting.md#module-not-found-errors)

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Wallet not detected | Refresh page, check installation |
| Wrong network | Auto-switch should work, verify config |
| Insufficient balance | Check FLOW balance in wallet |
| Build fails | Clear cache, reinstall dependencies |
| Type errors | Run `npm run lint` for details |

## Getting More Help

- [Full Troubleshooting Guide](./troubleshooting.md)
- [Wallet Integration Guide](./wallet-integration.md)
- [GitHub Issues](https://github.com/ImmutableType/immutable5/issues)
