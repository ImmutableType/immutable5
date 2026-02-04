# Troubleshooting Guide

Common issues and solutions when working with ImmutableType.

## Wallet Connection Issues

### Flow Wallet Not Detected

**Symptoms:**
- Flow Wallet option doesn't appear
- Error: "Flow Wallet not available"

**Solutions:**
1. **Check if Flow Wallet is installed**
   - Verify extension is installed and enabled
   - Check browser extension settings

2. **Check if it's a Cadence wallet**
   - Cadence wallets (native Flow) are NOT supported
   - You need Flow EVM Wallet (Ethereum-compatible)
   - Error message will indicate if Cadence wallet detected

3. **Refresh the page**
   - EIP-6963 discovery may need a refresh
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

4. **Check browser console**
   - Look for `[EIP-6963] Wallet announced: Flow Wallet`
   - If not present, wallet may not support EIP-6963

5. **Try multiple times**
   - Some wallets announce late
   - Wait a few seconds and try again

### MetaMask Not Connecting

**Symptoms:**
- MetaMask popup doesn't appear
- Connection fails silently

**Solutions:**
1. **Check MetaMask installation**
   - Verify MetaMask is installed
   - Check if extension is enabled

2. **Check network**
   - Ensure Flow EVM Mainnet is configured
   - Network should auto-add, but verify

3. **Check user rejection**
   - User may have rejected connection
   - Error code `4001` indicates user rejection

4. **Clear browser cache**
   - Cached JavaScript may cause issues
   - Hard refresh or clear cache

### Both Wallets Show as Unavailable

**Symptoms:**
- WalletSelector shows "No wallets detected"
- Both options unavailable

**Solutions:**
1. **Check wallet installation**
   - Verify at least one wallet is installed
   - Check browser extension settings

2. **Check EIP-6963 support**
   - Older wallets may not support EIP-6963
   - Try updating wallet extensions

3. **Check browser compatibility**
   - Some browsers may not support EIP-6963
   - Try Chrome, Firefox, or Edge

## Network Issues

### Wrong Network Error

**Symptoms:**
- Error: "Wrong network"
- Transaction fails

**Solutions:**
1. **Auto-switch should work**
   - The app automatically switches to Flow EVM
   - If it fails, manually switch in wallet

2. **Manual network configuration**
   - Add Flow EVM Mainnet manually:
     - Network Name: Flow EVM Mainnet
     - RPC URL: `https://mainnet.evm.nodes.onflow.org`
     - Chain ID: `747`
     - Currency Symbol: FLOW
     - Block Explorer: `https://evm.flowscan.io`

### RPC Connection Errors

**Symptoms:**
- "Failed to fetch"
- Network timeout errors

**Solutions:**
1. **Check RPC URL**
   - Verify `NEXT_PUBLIC_FLOW_EVM_RPC_URL` is correct
   - Try alternative RPC endpoints

2. **Check network connection**
   - Verify internet connection
   - Check firewall settings

3. **Rate limiting**
   - Too many requests may cause rate limiting
   - Wait and retry

## Profile Creation Issues

### Profile Creation Fails

**Symptoms:**
- Transaction fails
- Error during profile creation

**Solutions:**
1. **Check FLOW balance**
   - Need 3 FLOW for profile creation
   - Check balance in wallet

2. **Check gas**
   - Ensure sufficient FLOW for gas
   - Gas costs ~0.002 FLOW

3. **Check qualification**
   - If you have 100+ BUFFAFLOW, fee is waived
   - Check qualification status

4. **Check network**
   - Ensure on Flow EVM Mainnet
   - Wrong network will cause failures

### Profile Already Exists

**Symptoms:**
- "Profile already exists" error
- Can't create new profile

**Solutions:**
1. **Check existing profile**
   - Use `getProfileByAddress()` to check
   - Profile may already exist

2. **Transfer existing profile**
   - If you want a new profile, transfer old one first
   - Or use a different wallet address

## Bookmark Issues

### Bookmark Minting Fails

**Symptoms:**
- Can't mint bookmarks
- Transaction fails

**Solutions:**
1. **Check daily limit**
   - Maximum 20 bookmarks per day
   - Wait for next day or use different address

2. **Check URL format**
   - Must be valid HTTP/HTTPS URL
   - Check URL validation

3. **Check title length**
   - Title must be 1-100 characters
   - Check character count

### Bookmarks Not Loading

**Symptoms:**
- Bookmarks don't appear
- Loading forever

**Solutions:**
1. **Check RPC connection**
   - Verify RPC endpoint is accessible
   - Check network connection

2. **Check contract address**
   - Verify `NEXT_PUBLIC_BOOKMARK_NFT_ADDRESS` is correct
   - Check environment variables

3. **Check address**
   - Verify address has bookmarks
   - Check on FlowScan explorer

## Build and Development Issues

### TypeScript Errors

**Symptoms:**
- Build fails with TypeScript errors
- Type mismatches

**Solutions:**
1. **Check types**
   - Verify all types are correct
   - Use explicit types

2. **Check imports**
   - Verify all imports are correct
   - Check file paths

3. **Run type check**
   ```bash
   npm run build
   ```

### Build Fails

**Symptoms:**
- `npm run build` fails
- Deployment fails

**Solutions:**
1. **Check Node version**
   - Requires Node.js 18+
   - Check with `node --version`

2. **Clear cache**
   ```bash
   rm -rf .next node_modules
   npm install
   ```

3. **Check environment variables**
   - Verify all required env vars are set
   - Check `.env.local` file

### Hydration Errors

**Symptoms:**
- React hydration warnings
- Mismatch between server and client

**Solutions:**
1. **Check for browser extensions**
   - Extensions can modify DOM
   - Use `suppressHydrationWarning` if needed

2. **Check for `typeof window`**
   - Avoid `typeof window` checks in render
   - Use `useEffect` for client-only code

3. **Check for dynamic content**
   - Avoid `Date.now()`, `Math.random()` in render
   - Use state for dynamic values

## Service Layer Issues

### Service Not Initialized

**Symptoms:**
- Error: "Service not initialized"
- Contract calls fail

**Solutions:**
1. **Initialize service**
   ```typescript
   await service.initialize(provider)
   ```

2. **Check provider**
   - Verify provider is valid
   - Check wallet connection

3. **Use read-only for queries**
   ```typescript
   await service.initializeReadOnly()
   ```

### Contract Not Found

**Symptoms:**
- Error: "Contract not found"
- Transaction fails

**Solutions:**
1. **Check contract address**
   - Verify address in environment variables
   - Check contract on FlowScan

2. **Check network**
   - Ensure on correct network
   - Contract must be on Flow EVM Mainnet

3. **Check ABI**
   - Verify ABI matches contract
   - Check `lib/web3/contracts.ts`

## Getting Help

If you're still experiencing issues:

1. **Check browser console**
   - Look for error messages
   - Check network requests

2. **Check FlowScan**
   - Verify transactions on explorer
   - Check contract state

3. **Open an issue**
   - Provide error messages
   - Include browser/OS info
   - Include steps to reproduce

4. **Check documentation**
   - Review relevant guides
   - Check API documentation

## Common Error Messages

### "Flow Wallet not available"
- Wallet not installed or not detected
- May be Cadence wallet instead of Flow EVM wallet

### "MetaMask is not connected/installed"
- MetaMask not installed or disabled
- User rejected connection

### "Wrong network"
- Not on Flow EVM Mainnet
- Auto-switch failed

### "Insufficient balance"
- Not enough FLOW for transaction
- Check balance in wallet

### "Daily limit exceeded"
- Reached 20 bookmarks per day limit
- Wait for next day

### "Profile already exists"
- Address already has a profile
- Use different address or transfer existing profile
