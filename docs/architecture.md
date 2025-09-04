# ImmutableType Phase 5 - Architecture Documentation
**Tiered Identity Verification System with Transferable Profiles**
**Deployed: September 3, 2025**

## System Overview

ImmutableType Phase 5 implements a tiered identity verification system on Flow EVM that creates transferable profile NFTs. Users can trade verification achievements as collectible status symbols while maintaining security through data reset mechanisms.

## Contract Addresses (Flow EVM Testnet)

- **ProfileNFT**: `0x09512878ac5662aFDE0bE6046d12B2eEa30A00Fe`
- **TokenQualifier**: `0x78b9240F3EF69cc517A66564fBC488C5E5309DF7`
- **Deployer**: `0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2`
- **Network**: Flow EVM Testnet (Chain ID: 545)
- **Explorer**: https://evm-testnet.flowscan.io

## Architecture Principles

### **1. Progressive Identity Verification**
Users advance through verification tiers using different methods:
- **Tier 0 (Basic)**: Wallet connection only - FREE
- **Tier 1 (Social)**: Farcaster verification - Fee/Token required
- **Tier 2 (Identity)**: Crossmint KYC verification - Fee/Token required  
- **Tier 3 (Anonymous)**: Future zK proof verification
- **Tier 4+ (Enhanced)**: Future advanced verification methods

### **2. Transferable Collectible Value**
- **Profile ownership** can be traded like any NFT
- **Verification achievements** transfer with the NFT (tier level, creation timestamp)
- **Personal identity data** resets on transfer for security
- **Early adopter status** preserved through creation timestamps

### **3. Anti-Fraud & Sybil Resistance**
- **One person = one profile** per verification method
- **Unique identity enforcement** (FID, KYC ID, etc.)
- **Admin suspension/termination** capabilities
- **Community reporting** mechanisms

## Smart Contract Architecture

### **Core Data Structures**

```solidity
struct Profile {
    uint256 tier;                   // Current verification tier (0-4+)
    string did;                     // W3C DID: did:pkh:eip155:545:0x...
    
    // Personal data (reset on transfer)
    string displayName;             // 1-50 characters
    string bio;                     // 0-500 characters  
    string location;                // 0-100 characters
    string avatarUrl;               // 0-200 characters
    
    // System data (preserved on transfer)
    uint256 createdAt;              // Early adopter timestamp
    uint256 lastTierUpgrade;        // Last advancement timestamp
    bool isActive;                  // Profile status
    
    // Future social graph preparation
    bytes32 socialGraphHash;        // Reserved
    uint256 connectionCount;        // Reserved
    uint256 lastSocialUpdate;       // Reserved
}

struct AuthBinding {
    string method;                  // "wallet", "farcaster", "crossmint", "admin"
    string externalId;              // Address, FID, KYC ID, etc.
    uint256 verifiedAt;             // Verification timestamp
    bool isActive;                  // Deactivated on transfer
}## **Terminal Commands to Create Architecture Documentation:**

```bash
# Create architecture documentation file
touch docs/architecture.md

# Create diagrams directory if needed
mkdir -p docs/diagrams

# Create a README for the architecture docs
touch docs/README.md
```

## **Complete Architecture Documentation:**

Here's the full architecture document for `docs/architecture.md`:

```markdown
# ImmutableType Phase 5 - Architecture Documentation
**Tiered Identity Verification System with Transferable Profiles**
**Deployed: September 3, 2025**

## System Overview

ImmutableType Phase 5 implements a tiered identity verification system on Flow EVM that creates transferable profile NFTs. Users can trade verification achievements as collectible status symbols while maintaining security through data reset mechanisms.

## Contract Addresses (Flow EVM Testnet)

- **ProfileNFT**: `0x09512878ac5662aFDE0bE6046d12B2eEa30A00Fe`
- **TokenQualifier**: `0x78b9240F3EF69cc517A66564fBC488C5E5309DF7`
- **Deployer**: `0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2`
- **Network**: Flow EVM Testnet (Chain ID: 545)
- **Explorer**: https://evm-testnet.flowscan.io

## Architecture Principles

### **1. Progressive Identity Verification**
Users advance through verification tiers using different methods:
- **Tier 0 (Basic)**: Wallet connection only - FREE
- **Tier 1 (Social)**: Farcaster verification - Fee/Token required
- **Tier 2 (Identity)**: Crossmint KYC verification - Fee/Token required  
- **Tier 3 (Anonymous)**: Future zK proof verification
- **Tier 4+ (Enhanced)**: Future advanced verification methods

### **2. Transferable Collectible Value**
- **Profile ownership** can be traded like any NFT
- **Verification achievements** transfer with the NFT (tier level, creation timestamp)
- **Personal identity data** resets on transfer for security
- **Early adopter status** preserved through creation timestamps

### **3. Anti-Fraud & Sybil Resistance**
- **One person = one profile** per verification method
- **Unique identity enforcement** (FID, KYC ID, etc.)
- **Admin suspension/termination** capabilities
- **Community reporting** mechanisms

## Smart Contract Architecture

### **Core Data Structures**

```solidity
struct Profile {
    uint256 tier;                   // Current verification tier (0-4+)
    string did;                     // W3C DID: did:pkh:eip155:545:0x...
    
    // Personal data (reset on transfer)
    string displayName;             // 1-50 characters
    string bio;                     // 0-500 characters  
    string location;                // 0-100 characters
    string avatarUrl;               // 0-200 characters
    
    // System data (preserved on transfer)
    uint256 createdAt;              // Early adopter timestamp
    uint256 lastTierUpgrade;        // Last advancement timestamp
    bool isActive;                  // Profile status
    
    // Future social graph preparation
    bytes32 socialGraphHash;        // Reserved
    uint256 connectionCount;        // Reserved
    uint256 lastSocialUpdate;       // Reserved
}

struct AuthBinding {
    string method;                  // "wallet", "farcaster", "crossmint", "admin"
    string externalId;              // Address, FID, KYC ID, etc.
    uint256 verifiedAt;             // Verification timestamp
    bool isActive;                  // Deactivated on transfer
}
```

### **Transfer Logic**

**Preserves on Transfer:**
- Profile ownership (NFT)
- Tier level (verification achievement)
- Creation timestamp (early adopter status)
- Profile ID

**Resets on Transfer:**
- Display name → "Unnamed"
- Bio → ""
- Location → ""
- Avatar URL → ""
- All auth bindings → deactivated

**New Owner Requirements:**
- Must re-verify identity to reactivate profile
- Can update personal information
- Retains collectible verification status

### **Fee & Token System**

The `TokenQualifier` contract manages tier advancement requirements:

```solidity
// Users can either:
1. Pay fee in FLOW tokens, OR
2. Hold qualifying tokens to bypass fees

// Default fee structure:
Tier 1: 0.001 FLOW
Tier 2: 0.01 FLOW  
Tier 3: 0.1 FLOW
```

**Admin Override:** Manual verification bypasses all fees

## Security Architecture

### **Access Control**
- **DEFAULT_ADMIN_ROLE**: Contract upgrades, admin management
- **ADMIN_ROLE**: Profile suspension, manual verification
- **VERIFIER_ROLE**: Future automated verification systems

### **Anti-Fraud Measures**
- **Unique verification IDs**: Prevent duplicate usage across profiles
- **Profile suspension**: Admin can deactivate malicious profiles
- **Audit trails**: All profile changes logged via events
- **Gas payment requirement**: Natural spam prevention

### **Data Privacy**
- **W3C DID compliance**: Standard decentralized identifier format
- **Transfer data reset**: Personal info cleared on ownership change
- **Future zK integration**: Privacy-preserving verification options

## Implementation Phases

### **Phase 1: Core Foundation ✅ COMPLETE**
- ProfileNFT contract with transferability
- TokenQualifier fee system
- Admin verification capabilities
- Deployment to Flow EVM testnet

### **Phase 2: Farcaster Integration (NEXT)**
- Farcaster AuthKit integration
- Neynar API service layer
- Tier 1 advancement via FID verification
- Duplicate FID prevention

### **Phase 3: Frontend Development**
- Onboarding flow UI
- Profile management interface
- Tier advancement components
- End-to-end testing

### **Phase 4: Crossmint Integration**
- KYC verification flow
- Credit card payment handling
- Direct Tier 2 advancement
- Embedded wallet support

### **Phase 5: Advanced Features**
- zK proof verification adapters
- Social graph connections
- Community governance systems
- Enhanced fraud detection

## Integration Points

### **External APIs (Future Phases)**
- **Neynar API**: Farcaster profile data and verification
- **Crossmint API**: KYC verification and embedded wallets
- **zK Proof Services**: Sismo, Polygon ID, WorldID adapters

### **Frontend Integration**
- **Contract ABIs**: Available in deployments/ProfileNFT.json
- **Event Monitoring**: Real-time profile updates via contract events
- **MetaMask Integration**: Standard wallet connection patterns

## Economic Model

### **Revenue Streams**
- **Tier advancement fees**: Paid in FLOW tokens
- **NFT marketplace fees**: Standard trading fees
- **Premium features**: Future enhanced verification methods

### **Token Utility**
- **Fee payment**: FLOW tokens for tier advancement
- **Fee bypass**: Qualifying token holdings
- **Governance**: Future community decision making

## Future Expansion

### **Social Features**
- **Follower/following relationships**: Social graph analysis
- **Reputation systems**: Community-based validation
- **Social proof verification**: Connection pattern analysis

### **Privacy Features**
- **zK proof integration**: Anonymous verification methods
- **Privacy-preserving reputation**: Zero-knowledge social signals
- **Regulatory compliance**: Data protection requirements

### **Ecosystem Integration**
- **Cross-chain support**: Multi-network identity verification
- **DID interoperability**: Integration with other identity systems
- **Composable verification**: Modular proof systems

## Development Resources

### **Repository Structure**
```
Immutable_5/
├── contracts/
│   ├── interfaces/
│   │   └── ITokenQualifier.sol
│   └── identity/
│       ├── ProfileNFT.sol
│       └── TokenQualifier.sol
├── scripts/
│   └── deploy-profile.js
├── deployments/
│   └── ProfileNFT.json
├── docs/
│   └── architecture.md
└── hardhat.config.js
```

### **Deployment Configuration**
- **Network**: Flow EVM Testnet
- **RPC**: https://testnet.evm.nodes.onflow.org
- **Chain ID**: 545
- **Gas Strategy**: User pays immediately (spam prevention)

## Risk Assessment

### **Technical Risks**
- **Contract upgrades**: Minimal upgrade capability by design
- **Gas optimization**: Large contract size warnings addressed
- **Version compatibility**: Hardhat/Ethers version conflicts resolved

### **Economic Risks**
- **Fee structure**: Adjustable via TokenQualifier governance
- **Token requirements**: Flexible qualifying token system
- **Market dynamics**: NFT collectible value dependent on adoption

### **Security Risks**
- **Admin key management**: Multi-sig recommended for production
- **Verification oracle risks**: API dependency for external verification
- **Social engineering**: Manual verification processes require care

---

**Last Updated**: September 3, 2025  
**Status**: Phase 1 Complete, Phase 2 Ready  
**Next Milestone**: Farcaster AuthKit Integration
```

This architecture document captures the complete system design, implementation status, and future roadmap based on our successful Phase 1 deployment.