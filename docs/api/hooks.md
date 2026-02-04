# React Hooks API Reference

Documentation for all React hooks in the ImmutableType codebase.

## useUnifiedWallet

**Location:** `lib/hooks/useUnifiedWallet.ts`

Unified wallet connection hook supporting multiple wallet types.

### Usage

```typescript
import { useUnifiedWallet } from '@/lib/hooks/useUnifiedWallet'

function MyComponent() {
  const {
    address,
    isConnected,
    walletType,
    connectWallet,
    disconnect,
    isConnecting,
    availableWallets,
    provider
  } = useUnifiedWallet()
}
```

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `address` | `string \| null` | Connected wallet address |
| `isConnected` | `boolean` | Connection status |
| `walletType` | `'metamask' \| 'flow-wallet' \| null` | Type of connected wallet |
| `connectWallet` | `(type: 'metamask' \| 'flow-wallet') => Promise<void>` | Connect to wallet |
| `disconnect` | `() => void` | Disconnect wallet |
| `isConnecting` | `boolean` | Connection in progress |
| `availableWallets` | `{ metamask: boolean, flowWallet: boolean }` | Available wallets |
| `provider` | `BrowserProvider \| null` | ethers.js provider instance |

### Methods

#### `connectWallet(type)`

Connects to a specific wallet type.

```typescript
await connectWallet('flow-wallet')
// or
await connectWallet('metamask')
```

**Parameters:**
- `type`: `'metamask' | 'flow-wallet'` - Wallet type to connect

**Throws:**
- Error if wallet not available
- Error if connection fails
- Error if user rejects

#### `disconnect()`

Disconnects the current wallet.

```typescript
disconnect()
```

### Example

```typescript
function WalletButton() {
  const { address, isConnected, connectWallet, disconnect } = useUnifiedWallet()

  if (isConnected) {
    return (
      <div>
        <p>Connected: {address}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    )
  }

  return (
    <button onClick={() => connectWallet('metamask')}>
      Connect Wallet
    </button>
  )
}
```

## useWalletDiscovery

**Location:** `lib/web3/useWalletDiscovery.ts`

Hook for reactive wallet discovery via EIP-6963.

### Usage

```typescript
import { useWalletDiscovery } from '@/lib/web3/useWalletDiscovery'

function WalletList() {
  const { all, flowWallet, metaMask } = useWalletDiscovery()

  return (
    <div>
      {all.map(wallet => (
        <div key={wallet.info.rdns}>
          {wallet.info.name}
        </div>
      ))}
    </div>
  )
}
```

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `all` | `EIP6963ProviderDetail[]` | All discovered wallets |
| `flowWallet` | `EIP6963ProviderDetail \| null` | Flow Wallet if available |
| `metaMask` | `EIP6963ProviderDetail \| null` | MetaMask if available |

### Example

```typescript
function WalletStatus() {
  const { flowWallet, metaMask } = useWalletDiscovery()

  return (
    <div>
      {metaMask && <p>MetaMask: Available</p>}
      {flowWallet && <p>Flow Wallet: Available</p>}
    </div>
  )
}
```

## Custom Hooks Pattern

### Creating a Custom Hook

```typescript
// lib/hooks/useMyFeature.ts
import { useState, useEffect } from 'react'
import { useUnifiedWallet } from './useUnifiedWallet'

export function useMyFeature() {
  const { address, isConnected } = useUnifiedWallet()
  const [data, setData] = useState(null)

  useEffect(() => {
    if (isConnected && address) {
      // Fetch data...
    }
  }, [isConnected, address])

  return { data }
}
```

### Best Practices

1. **Use existing hooks**: Build on `useUnifiedWallet` when possible
2. **Handle loading states**: Provide loading indicators
3. **Handle errors**: Return error states
4. **Memoize values**: Use `useMemo` for expensive computations
5. **Clean up**: Use `useEffect` cleanup for subscriptions

## Hook Dependencies

### useUnifiedWallet Dependencies

- `@metamask/sdk` - MetaMask SDK
- `ethers` - Ethereum library
- `lib/web3/eip6963` - EIP-6963 discovery

### useWalletDiscovery Dependencies

- `lib/web3/eip6963` - EIP-6963 discovery

## Further Reading

- [Wallet Integration Guide](../wallet-integration.md)
- [EIP-6963 Implementation](../eip6963.md)
- [Service Layer Documentation](../services.md)
