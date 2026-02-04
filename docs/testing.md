# Testing Guide

Guide for testing ImmutableType features and components.

## Testing Strategy

### Manual Testing

Primary testing method for this project. Focus on:
- Wallet connections
- Contract interactions
- User flows
- Error handling

### Automated Testing

Limited automated tests exist. Focus areas:
- Smart contract tests (Hardhat)
- Service layer unit tests (planned)

## Manual Testing Checklist

### Wallet Connection

- [ ] **MetaMask Connection**
  - Install MetaMask
  - Connect via WalletSelector
  - Verify address appears in navigation
  - Test disconnection

- [ ] **Flow Wallet Connection**
  - Install Flow EVM Wallet
  - Connect via WalletSelector
  - Verify address appears in navigation
  - Test disconnection

- [ ] **Both Wallets Installed**
  - Install both MetaMask and Flow Wallet
  - Verify both appear in WalletSelector
  - Test connecting with each
  - Test switching between wallets

- [ ] **No Wallets Installed**
  - Disable all wallet extensions
  - Verify appropriate message shown
  - Verify no errors in console

### Network Management

- [ ] **Auto Network Switch**
  - Connect wallet on wrong network
  - Verify automatic switch to Flow EVM
  - Verify transaction succeeds

- [ ] **Network Rejection**
  - Reject network switch
  - Verify appropriate error message
  - Verify user can retry

### Profile Creation

- [ ] **Basic Profile Creation**
  - Connect wallet
  - Fill profile form
  - Submit and verify success
  - Check profile appears on profile page

- [ ] **Profile Creation with Fee**
  - Create profile without BUFFAFLOW
  - Verify 3 FLOW fee is charged
  - Verify transaction succeeds

- [ ] **Profile Creation with BUFFAFLOW**
  - Create profile with 100+ BUFFAFLOW
  - Verify fee is waived
  - Verify transaction succeeds

- [ ] **Profile Creation Errors**
  - Test with insufficient balance
  - Test with invalid data
  - Test with existing profile
  - Verify appropriate error messages

### Bookmark Minting

- [ ] **Basic Bookmark Minting**
  - Connect wallet with profile
  - Create bookmark collection
  - Mint bookmarks
  - Verify bookmarks appear

- [ ] **Daily Limit**
  - Mint 20 bookmarks (limit)
  - Attempt to mint 21st
  - Verify limit error
  - Verify can mint next day

- [ ] **Bookmark Validation**
  - Test invalid URLs
  - Test empty titles
  - Test long descriptions
  - Verify validation errors

### Profile Viewing

- [ ] **Own Profile**
  - View own profile
  - Verify edit options appear
  - Verify bookmark management available

- [ ] **Other Profile**
  - View another user's profile
  - Verify read-only view
  - Verify bookmarks visible

### Error Scenarios

- [ ] **Wallet Rejection**
  - Reject wallet connection
  - Verify appropriate message
  - Verify can retry

- [ ] **Transaction Rejection**
  - Reject transaction
  - Verify appropriate message
  - Verify state resets

- [ ] **Network Errors**
  - Disconnect internet
  - Attempt transaction
  - Verify error handling

- [ ] **RPC Errors**
  - Use invalid RPC URL
  - Verify error handling
  - Verify fallback behavior

## Testing Tools

### Browser DevTools

**Console Logging:**
- Check for errors
- Monitor debug logs
- Track wallet announcements

**Network Tab:**
- Monitor RPC requests
- Check transaction status
- Verify contract calls

**React DevTools:**
- Inspect component state
- Check hook values
- Monitor re-renders

### FlowScan Explorer

**Verify Transactions:**
- Check transaction hashes
- Verify contract interactions
- Check token transfers

**URL:** https://evm.flowscan.io

### Debug Helpers

```javascript
// In browser console
window.inspectFlowWallet()  // Inspect Flow Wallet

// Check EIP-6963 providers
import { getAllProviders } from '@/lib/web3/eip6963'
console.log(getAllProviders())
```

## Test Scenarios

### Happy Path

1. User installs MetaMask
2. Connects wallet
3. Creates profile (pays fee)
4. Mints bookmarks
5. Views profile
6. Shares profile

### Error Path

1. User connects wallet
2. Attempts to create profile with insufficient balance
3. Sees error message
4. Adds FLOW to wallet
5. Retries and succeeds

### Multi-Wallet Path

1. User has both MetaMask and Flow Wallet
2. Connects with MetaMask
3. Creates profile
4. Disconnects
5. Connects with Flow Wallet
6. Views same profile (same address)

## Contract Testing

### Hardhat Tests

```bash
# Run contract tests
npx hardhat test

# Run specific test
npx hardhat test test/ProfileNFT.test.js

# With gas reporting
REPORT_GAS=true npx hardhat test
```

### Test Structure

```javascript
describe('ProfileNFT', () => {
  it('should create a profile', async () => {
    // Test implementation
  })

  it('should revert with invalid data', async () => {
    // Test implementation
  })
})
```

## Service Testing

### Manual Service Testing

```typescript
import { ProfileNFTService } from '@/lib/services/profile/ProfileNFT'

// Test service initialization
const service = new ProfileNFTService()
await service.initialize(provider)

// Test methods
const profile = await service.getProfile(profileId)
```

### Mock Providers

```typescript
// Create mock provider for testing
const mockProvider = {
  getSigner: async () => ({
    getAddress: async () => '0x123...',
    sendTransaction: async () => ({ hash: '0xabc...' })
  })
} as any
```

## Performance Testing

### Load Testing

- Test with multiple simultaneous connections
- Test with high transaction volume
- Monitor RPC rate limits

### Optimization Testing

- Check bundle size
- Monitor load times
- Verify code splitting

## Security Testing

### Input Validation

- Test with malicious inputs
- Test with edge cases
- Verify sanitization

### Access Control

- Test unauthorized access
- Test admin functions
- Verify permissions

## Regression Testing

### Before Each Release

- [ ] All wallet types work
- [ ] Profile creation works
- [ ] Bookmark minting works
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build succeeds

## Test Data

### Test Accounts

Use test accounts with:
- Sufficient FLOW for gas
- Test BUFFAFLOW tokens (optional)
- Known profile IDs for testing

### Test Contracts

For local testing:
- Deploy contracts to local Hardhat network
- Use test contract addresses
- Test with test accounts

## Reporting Issues

When reporting test failures:

1. **Describe the scenario**
   - What you were testing
   - Steps to reproduce
   - Expected vs actual behavior

2. **Include details**
   - Browser and version
   - Wallet type and version
   - Console errors
   - Network tab information

3. **Provide evidence**
   - Screenshots
   - Console logs
   - Transaction hashes

## Further Reading

- [Troubleshooting Guide](./troubleshooting.md)
- [Development Guide](./development.md)
- [Smart Contracts Documentation](./smart-contracts.md)
