# Wallet Integration Guide

ImmutableType supports multiple wallet types through a unified wallet system built on EIP-6963. This guide explains how wallet integration works and how to extend it.

## Supported Wallets

### Currently Supported
- **MetaMask** - Via MetaMask SDK
- **Flow EVM Wallet** - Via EIP-6963 discovery

### Planned
- WalletConnect (for mobile wallets)

### Not Supported
- **Cadence/Native Flow Wallets** - These are for native Flow blockchain, not Flow EVM
- Blocto (excluded by design)

## Architecture Overview

The wallet system uses a three-layer architecture:

1. **EIP-6963 Discovery Layer** (`lib/web3/eip6963.ts`)
   - Discovers available wallets via EIP-6963 standard
   - Maintains a registry of discovered providers

2. **Unified Wallet Hook** (`lib/hooks/useUnifiedWallet.ts`)
   - Provides a unified interface for all wallet types
   - Manages connection state, network switching, and event listeners

3. **UI Components** (`app/components/ui/WalletSelector.tsx`)
   - Presents wallet options to users
   - Handles connection flow

## EIP-6963 Implementation

### How It Works

EIP-6963 is an event-based standard that allows dApps to discover multiple injected wallet providers. This is crucial when multiple wallets are installed.

```typescript
// Initialize discovery
import { initEIP6963Discovery } from '../web3/eip6963'

// Initialize once on app load
initEIP6963Discovery()

// Wallets will announce themselves via 'eip6963:announceProvider' events
```

### Flow Wallet Detection

Flow Wallet uses the RDNS identifier: `com.flowfoundation.wallet`

```typescript
import { getFlowWalletProvider, isFlowWalletAvailable } from '../web3/eip6963'

// Check if Flow Wallet is available
if (isFlowWalletAvailable()) {
  const provider = getFlowWalletProvider()
  // Use provider...
}
```

### MetaMask Detection

MetaMask uses the RDNS identifier: `io.metamask`

```typescript
import { getMetaMaskProvider, isMetaMaskAvailable } from '../web3/eip6963'

// Check if MetaMask is available
if (isMetaMaskAvailable()) {
  const provider = getMetaMaskProvider()
  // Use provider...
}
```

## Using the Unified Wallet Hook

The `useUnifiedWallet` hook provides a single interface for all wallet operations:

```typescript
import { useUnifiedWallet } from '@/lib/hooks/useUnifiedWallet'

function MyComponent() {
  const {
    address,           // Connected wallet address
    isConnected,        // Connection status
    walletType,         // 'metamask' | 'flow-wallet' | null
    connectWallet,      // Function to connect
    disconnect,         // Function to disconnect
    isConnecting,       // Connection in progress
    availableWallets,  // { metamask: boolean, flowWallet: boolean }
    provider            // ethers.BrowserProvider instance
  } = useUnifiedWallet()

  // Connect to a specific wallet
  const handleConnect = async () => {
    try {
      await connectWallet('flow-wallet') // or 'metamask'
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

  return (
    <div>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  )
}
```

## Network Management

The unified wallet automatically handles Flow EVM network configuration:

```typescript
// Network configuration (lib/hooks/useUnifiedWallet.ts)
const FLOW_EVM_MAINNET = {
  chainId: '0x2eb', // 747 in hex
  chainName: 'Flow EVM Mainnet',
  rpcUrls: ['https://mainnet.evm.nodes.onflow.org'],
  blockExplorerUrls: ['https://evm.flowscan.io'],
  nativeCurrency: {
    name: 'Flow',
    symbol: 'FLOW',
    decimals: 18
  }
}
```

The hook automatically:
- Checks current network on connection
- Switches to Flow EVM if needed
- Handles network change events

## Wallet Selector Component

The `WalletSelector` component provides a UI for wallet selection:

```typescript
import { WalletSelector } from '@/app/components/ui/WalletSelector'
import { Modal } from '@/app/components/ui/Modal'

function ConnectButton() {
  const [showSelector, setShowSelector] = useState(false)

  return (
    <>
      <button onClick={() => setShowSelector(true)}>
        Connect Wallet
      </button>
      <Modal
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        title="Connect Wallet"
      >
        <WalletSelector onClose={() => setShowSelector(false)} />
      </Modal>
    </>
  )
}
```

## Service Layer Integration

All services accept a generic `BrowserProvider` to work with any wallet:

```typescript
import { ProfileNFTService } from '@/lib/services/profile/ProfileNFT'
import { useUnifiedWallet } from '@/lib/hooks/useUnifiedWallet'

function MyComponent() {
  const { provider, address } = useUnifiedWallet()

  const createProfile = async () => {
    // Initialize service with provider from unified wallet
    await profileNFTService.initialize(provider)
    
    // Create profile - works with any wallet
    const result = await profileNFTService.createBasicProfile(
      profileData,
      address,
      provider
    )
  }
}
```

## Adding a New Wallet

To add support for a new wallet:

1. **Update EIP-6963 Discovery** (`lib/web3/eip6963.ts`)
   ```typescript
   export const WALLET_RDNS = {
     FLOW_WALLET: 'com.flowfoundation.wallet',
     METAMASK: 'io.metamask',
     NEW_WALLET: 'com.newwallet.rdns' // Add new RDNS
   }
   ```

2. **Add Detection Functions**
   ```typescript
   export function getNewWalletProvider(): EIP1193Provider | null {
     const detail = discoveredProviders.get(WALLET_RDNS.NEW_WALLET)
     return detail?.provider || null
   }
   ```

3. **Update Unified Wallet Hook** (`lib/hooks/useUnifiedWallet.ts`)
   ```typescript
   // Add connection function
   const connectNewWallet = async () => {
     const provider = getNewWalletProvider()
     // ... connection logic
   }

   // Update connectWallet function
   const connectWallet = async (type: 'metamask' | 'flow-wallet' | 'new-wallet') => {
     if (type === 'new-wallet') {
       await connectNewWallet()
     }
     // ...
   }
   ```

4. **Update WalletSelector** (`app/components/ui/WalletSelector.tsx`)
   ```typescript
   // Add button for new wallet
   {availableWallets.newWallet && (
     <button onClick={() => handleConnect('new-wallet')}>
       Connect New Wallet
     </button>
   )}
   ```

## Error Handling

### Common Errors

**"Flow Wallet not detected"**
- User may have Cadence wallet instead of Flow EVM wallet
- Check for `window.fcl` or `window.fcl_extensions` to detect Cadence wallets
- Provide clear error message explaining the difference

**"MetaMask is not connected/installed"**
- Check if MetaMask is actually installed
- Verify user hasn't rejected connection
- Handle `4001` error code (user rejection)

**"Wrong network"**
- Automatically switch to Flow EVM Mainnet
- Provide clear instructions if auto-switch fails

## Best Practices

1. **Always use the unified wallet hook** - Don't access `window.ethereum` directly
2. **Pass providers to services** - Services should accept providers, not assume MetaMask
3. **Handle connection state** - Check `isConnected` before contract operations
4. **Provide clear errors** - Distinguish between wallet types and provide helpful messages
5. **Test with multiple wallets** - Ensure features work with both MetaMask and Flow Wallet

## Testing Wallet Integration

### Local Testing

1. Install both MetaMask and Flow EVM Wallet extensions
2. Test connection flow with each wallet
3. Test network switching
4. Test disconnection and reconnection

### Debugging

Enable debug logging:
```typescript
// Check console for:
// - [EIP-6963] Wallet announced: ...
// - 🔍 WalletSelector - Available wallets: ...
// - ✅ Flow Wallet connected successfully: ...
```

Use the debug helper:
```javascript
// In browser console
window.inspectFlowWallet()
```

## Troubleshooting

See [Troubleshooting Guide](./troubleshooting.md) for common wallet issues.

## Further Reading

- [EIP-6963 Specification](https://eips.ethereum.org/EIPS/eip-6963)
- [EIP-1193 Provider Standard](https://eips.ethereum.org/EIPS/eip-1193)
- [Flow EVM Documentation](https://docs.onflow.org/evm/)
