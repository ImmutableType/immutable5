# ImmutableType Phase 2 - Updated Architecture Documentation
**Tiered Identity Verification System - Wallet Connection Complete**
**Updated: September 5, 2025**

## System Overview

ImmutableType Phase 2 implements a tiered identity verification system on Flow EVM with transferable profile NFTs. **Currently completed: Full wallet connection UX with seamless MetaMask integration**. Users can now connect wallets with immediate popup triggers and proper state management.

## Contract Addresses (Flow EVM Testnet)

- **ProfileNFT**: `0x09512878ac5662aFDE0bE6046d12B2eEa30A00Fe` ✅ **VERIFIED DEPLOYED**
- **TokenQualifier**: `0x78b9240F3EF69cc517A66564fBC488C5E5309DF7` ✅ **VERIFIED DEPLOYED**
- **Treasury Wallet**: `0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2` (EOA)
- **BUFFAFLOW Contract**: `0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798` (Flow EVM Mainnet only)
- **Network**: Flow EVM Testnet (Chain ID: 545)
- **RPC**: `https://testnet.evm.nodes.onflow.org`
- **Explorer**: https://evm-testnet.flowscan.io

## Current Implementation Status

### **Wallet Connection System: ✅ COMPLETE**
- Direct `window.ethereum` integration (no Wagmi dependency issues)
- Immediate MetaMask popup on "Connect Wallet" click
- Automatic Flow EVM network switching after connection
- Proper connecting state to eliminate blank screens
- Error handling for user rejection and connection failures

### **Architecture Evolution**
**Previous Attempt**: Wagmi + library abstractions caused infinite loops and connection failures
**Current Solution**: Direct MetaMask API calls with proven reliability from working codebase
**Key Fix**: Removed dependency chain issues and connection proxy errors

### **Phase Progress**
- ✅ **Smart Contracts**: ProfileNFT and TokenQualifier deployed and verified
- ✅ **Wallet Integration**: Direct wallet connection with immediate popup UX
- ✅ **Network Management**: Automatic Flow EVM switching and chain detection
- ✅ **UI Flow**: Complete auth selection → wallet connection → profile form progression
- 🔲 **Contract Integration**: Connect UI to actual ProfileNFT smart contract calls
- 🔲 **Form Submission**: Profile creation with blockchain transactions

## Technical Architecture

### **Wallet Connection Stack**
```typescript
// lib/hooks/useDirectWallet.ts - Direct MetaMask integration
const connectWallet = async () => {
  await ensureCorrectNetwork()  // Add/switch to Flow EVM first
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'  // Direct API call - immediate popup
  })
  setAddress(accounts[0])
}
```

### **UI State Management**
```typescript
// Complete flow states in app/profile/create/page.tsx
1. Auth method selection (!selectedAuth)
2. Wallet download required (!hasWallet) 
3. Connecting state (selectedAuth && hasWallet && !isConnected)
4. Profile creation form (selectedAuth && isConnected)
5. Success state (creationState.status === 'success')
```

### **Key UX Improvements**
- **Eliminated blank screens**: Proper connecting state during wallet processing
- **Immediate popup triggers**: Direct MetaMask API calls, no library delays
- **Network auto-switching**: Seamless Flow EVM network addition and switching
- **Clean error handling**: User rejection handled gracefully without error states

## Project Structure (Current)

```
app/
├── page.tsx                     # Landing page with redirection logic
├── layout.tsx                   # Root layout with DirectWalletProvider
├── globals.css                  # Global styles and CSS variables
└── profile/
    └── create/page.tsx          # ✅ Complete wallet connection + form UI

lib/
├── hooks/
│   ├── useDirectWallet.ts       # ✅ Direct MetaMask integration (replaces Wagmi)
│   ├── useProfile.ts            # Legacy file (not currently used)
│   └── useWallet.ts             # Legacy file (reference implementation)
├── providers/
│   ├── DirectWalletProvider.tsx # ✅ Minimal provider for wallet state
│   └── Web3Provider.tsx         # Legacy file (unused)
├── types/
│   └── profile.ts               # ✅ TypeScript interfaces
├── web3/
│   ├── chains.ts               # ✅ Flow EVM testnet configuration
│   └── contracts.ts            # 🔲 Empty ABIs - needs contract integration
└── services/profile/
    ├── ProfileNFT.ts           # 🔲 Contract service (needs integration)
    └── TokenQualifier.ts       # 🔲 Contract service (needs integration)
```

## Current Working Implementation

### **Wallet Connection (Complete)**
```typescript
const { address, isConnected, connectWallet, isConnecting } = useDirectWallet()

// Flow:
1. User clicks "Connect Wallet (Tier 0)"
2. setSelectedAuth('wallet') triggers useEffect
3. connectWallet() called immediately
4. MetaMask popup appears (direct window.ethereum call)
5. User approves connection
6. Network switches to Flow EVM automatically  
7. Profile creation form displays
```

### **Form Data Structure (Ready)**
```typescript
interface FormData {
  displayName: string  // Required, 1-50 characters
  bio: string         // Optional, max 500 characters  
  location: string    // Optional, max 100 characters
  avatarUrl: string   // Optional, max 500 characters, URL validation
}
```

## Next Development Phase

### **Priority 1: Contract Integration**
- Populate `lib/web3/contracts.ts` with ProfileNFT and TokenQualifier ABIs
- Connect form submission to actual `ProfileNFT.createBasicProfile()` calls
- Implement fee checking (3 FLOW payment requirement)
- Add transaction state management (preparing → pending → success → error)

### **Priority 2: Complete Profile Creation**
- Real blockchain transaction submission on form submit
- Transaction hash display and Explorer links
- Profile ID generation and DID creation
- Success state with actual profile data

### **Files Requiring Contract Integration**
```typescript
// lib/web3/contracts.ts - Add real ABIs
export const ProfileNFT_ABI = [...] // From deployed contract
export const TokenQualifier_ABI = [...] // From deployed contract

// lib/services/profile/ProfileNFT.ts - Implement contract calls
export async function createBasicProfile(profileData, userAddress) {
  // Real contract interaction using viem/ethers
}

// app/profile/create/page.tsx - Connect form to contract
const handleSubmit = async (e) => {
  // Replace setTimeout simulation with real transaction
  const result = await createBasicProfile(formData, address)
}
```

## Wallet Integration Lessons Learned

### **What Didn't Work**
- **Wagmi abstractions**: Caused infinite loops and connection proxy errors
- **Library dependency chains**: Created timing issues and state conflicts
- **Complex provider wrapping**: Introduced unnecessary connection delays

### **What Works**
- **Direct `window.ethereum` calls**: Immediate, reliable MetaMask integration
- **Network management first**: Add/switch network before requesting accounts
- **Simple state management**: Minimal provider, direct state updates
- **Proven patterns**: Using battle-tested implementation from working project

## Fee Structure (Ready for Integration)

- **Profile Creation**: 3 FLOW tokens paid to treasury wallet
- **Fee Bypass**: 100+ $BUFFAFLOW tokens OR any $BUFFAFLOW NFT (mainnet only)
- **Current State**: UI shows fee information, contract integration needed
- **TokenQualifier Logic**: Ready to implement BUFFAFLOW checking

## Security Measures (Implemented)

- **Form validation**: Character limits, required fields, URL validation
- **Network verification**: Flow EVM testnet chain ID enforcement  
- **User consent**: MetaMask approval required for all connections
- **Error boundaries**: Graceful handling of wallet rejection and failures

## Development Status Summary

### ✅ **Complete**
- Wallet connection UX with immediate MetaMask popup
- Flow EVM network auto-switching and management
- Profile creation form with validation
- Complete UI state management (no blank screens)
- Clean error handling and user feedback

### 🔲 **Next Session Priority**
- Contract ABI integration
- Real ProfileNFT.createBasicProfile() transaction calls
- Transaction state management and success handling
- Fee payment validation and BUFFAFLOW qualification

### 🚫 **Out of Scope**
- Farcaster integration (Tier 1)
- Crossmint KYC integration (Tier 2)  
- Advanced verification methods (Tier 3+)
- Profile editing and management
- Admin dashboard features

## Critical Technical Notes

### **Wallet Connection Architecture**
The current implementation bypasses all Web3 library abstractions and uses direct MetaMask API calls. This pattern proved reliable and should be maintained. Any future wallet integrations should follow this direct approach rather than introducing library dependencies that caused previous connection failures.

### **Contract Integration Path**
The UI framework is complete and ready for contract integration. The next developer should focus on populating contract ABIs and implementing real transaction calls rather than modifying the wallet connection logic, which is working correctly.

---

**Repository**: `github.com:ImmutableType/immutable5.git`  
**Last Commit**: `ebec814` - "Fix wallet connection UX flow"  
**Status**: Wallet connection complete, ready for contract integration  
**Next Milestone**: Working profile creation with blockchain transactions  
**Last Updated**: September 5, 2025