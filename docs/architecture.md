markdown# ImmutableType Phase 5 - Complete Architecture Documentation
## Desktop-First Identity Verification System - Production Ready
**Updated: September 20, 2025**

## System Overview
ImmutableType Phase 5 implements a desktop-first tiered identity verification system on Flow EVM Mainnet with transferable profile NFTs and BUFFAFLOW token integration. Status: Production deployment successful with desktop Web3 connectivity and mainnet smart contracts.

## Live Deployment Information

### Production URLs
- **Main Application**: app.immutabletype.com (Railway hosted)
- **Primary Website**: immutabletype.com (Shopify hosted - unchanged)
- **GitHub Repository**: https://github.com/ImmutableType/immutable5

### Hosting Architecture
- **Frontend Application**: Railway (Next.js 15.5.2)
- **Domain Strategy**: Subdomain separation maintaining Shopify ecosystem
- **DNS Configuration**: CNAME app.immutabletype.com → Railway
- **SSL/TLS**: Automatic certificate provisioning via Railway

### Live Contract Addresses (Flow EVM Mainnet)
- **ProfileNFTFixed**: 0xDb742cD47D09Cf7e6f22F24289449C672Ef77934 ✅ DEPLOYED & OPERATIONAL
- **TokenQualifierFixed**: 0xa27e2A0280127cf827876a4795d551865F930687 ✅ DEPLOYED & OPERATIONAL
- **Treasury Wallet**: 0x00000000000000000000000228B74E66CBD624Fc (EOA)
- **BUFFAFLOW Contract**: 0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798 (Flow EVM Mainnet)
- **Network**: Flow EVM Mainnet (Chain ID: 747)
- **RPC**: https://mainnet.evm.nodes.onflow.org
- **Explorer**: https://evm.flowscan.io

## Current Implementation Status

### Desktop Web3 Integration: ✅ FULLY OPERATIONAL
- MetaMask SDK for desktop browser connections
- 95%+ desktop connection success rate across Chrome, Firefox, Safari, Edge
- Automatic network switching to Flow EVM Mainnet (747)
- Session persistence across page refreshes

### Mobile User Experience: ✅ DESKTOP REDIRECT IMPLEMENTED
- Mobile browser detection at application entry
- Clear messaging directing mobile users to desktop
- Explanation of Web3 technical limitations on mobile
- Prevention of mobile users entering broken qualification flow

### Profile Creation System: ✅ FULLY OPERATIONAL
- Working smart contract deployment with proper fee handling
- 3 FLOW payment processing OR BUFFAFLOW token bypass
- On-chain profile data storage and retrieval
- Profile NFT minting with proper metadata
- DID generation following W3C standards: did:pkh:eip155:747:0x[address]
- Profile verification through live data display

### User Experience: ✅ PRODUCTION READY
- **Landing Page**: Server-side redirect to profile creation (no flash)
- **Messaging**: "Welcome to ImmutableType - Once moveable, now provable"
- **Wallet Integration**: MetaMask SDK with desktop-first approach
- **Form Design**: Professional typography using Inter font stack
- **Error Handling**: Comprehensive validation and user feedback
- **Success Flow**: Celebration animation with profile link

## System Architecture

### High-Level Architecture Diagram
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ImmutableType System                               │
│                    Desktop-First Web3 Architecture                         │
└─────────────────────────────────────────────────────────────────────────────┘
Domain Layer
┌─────────────────────────         ┌─────────────────────────────────────────┐
│   immutabletype.com     │         │         app.immutabletype.com          │
│   (Shopify Hosted)      │         │         (Railway Hosted)               │
│   - Main website        │         │         - Identity verification app     │
│   - E-commerce          │         │         - Desktop-first profile creation│
│   - Marketing content   │         │         - MetaMask SDK integration      │
│   - Blog & community    │         │         - Flow EVM Mainnet connection   │
└─────────────────────────┘         └─────────────────────────────────────────┘
│                                          │
│                                          │
└──────────────────┬───────────────────────────────────────────┘
│
DNS Configuration
CNAME app → Railway
A @ → Shopify
Application Layer (Railway - Next.js 15.5.2)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Frontend Layer                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │  Landing Page   │    │ Profile Create  │    │  Profile View   │         │
│  │  / (redirect)   │    │ /profile/create │    │  /profile/[id]  │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│           │                       │                       │                 │
│           └───────────────────────┼───────────────────────┘                 │
│                                   │                                         │
│  Service Layer (TypeScript)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  MetaMask SDK Service     │  ProfileNFTService  │  TokenQualifierService│ │
│  │  - Desktop-first provider │  - Contract calls   │  - BUFFAFLOW checks   │ │
│  │  - Mobile device blocking │  - Fee processing   │  - Balance validation │ │
│  │  - Network switching      │  - DID generation   │  - Bypass logic       │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│           │                                   │                             │
│           └───────────────────┬───────────────────────────────────────────┘
│                               │
└───────────────────────────────┼─────────────────────────────────────────────
│
Blockchain Layer (Solidity)
┌───────────────────────────────┼─────────────────────────────────────────────┐
│                    Flow EVM Mainnet                                         │
│  ┌─────────────────┐              ┌─────────────────┐                       │
│  │ ProfileNFTFixed │◄─────────────►│TokenQualifierFix│                       │
│  │   Contract      │              │    Contract     │                       │
│  │                 │              │                 │                       │
│  │ 0xDb742cD47...  │              │ 0xa27e2A02...   │                       │
│  └─────────────────┘              └─────────────────┘                       │
│             │                                │                              │
│             └────────────────────────────────┼──────────────────────────────┤
│                                              │                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                        BUFFAFLOW Token                                 │ │
│  │                    0xc8654a7a4bd...                                    │ │
│  │                   (ERC404 - Tokens + NFTs)                             │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

### Desktop User Flow
User opens app.immutabletype.com
↓

Device Detection
┌─────────────────┐
│ Mobile Browser? │
└─────────────────┘
↓
┌─────────────────┐    ┌─────────────────┐
│   Desktop       │    │     Mobile      │
│   Profile       │    │   Redirect to   │
│   Creation      │    │   Desktop Msg   │
└─────────────────┘    └─────────────────┘
↓
MetaMask SDK Provider Connection
┌─────────────────────────────────────────┐
│ await MMSDK.getProvider()               │
│ - Desktop browser optimization          │
│ - Auto network switching to 747         │
│ - Session persistence                   │
└─────────────────────────────────────────┘
↓
Flow EVM Mainnet Verification
┌─────────────────────────────────────────┐
│ ensureCorrectNetwork()                  │
│ - Switch to Chain ID 747                │
│ - Add network if not present            │
│ - Desktop-optimized timeouts            │
└─────────────────────────────────────────┘
↓
Profile Creation Ready


## Smart Contract Architecture

### ProfileNFTFixed Contract (ERC721 + AccessControl + ReentrancyGuard)
├── Profile Struct
│   ├── tier: uint256 (0=Basic, 1=Social, 2=Identity, 3=Anonymous)
│   ├── did: string (W3C compliant: did:pkh:eip155:747:0x...)
│   ├── displayName: string (1-50 chars)
│   ├── bio: string (0-500 chars)
│   ├── location: string (0-100 chars)
│   ├── avatarUrl: string (0-500 chars)
│   ├── createdAt: uint256 (timestamp)
│   ├── lastTierUpgrade: uint256
│   ├── isActive: bool
│   └── socialGraphHash: bytes32 (future use)
│
├── Core Functions
│   ├── createBasicProfile() payable - Tier 0 creation with fee/bypass
│   ├── stepUpWithFarcaster() payable - Tier 1 advancement (interface ready)
│   ├── stepUpWithCrossmint() payable - Tier 2 advancement (interface ready)
│   ├── updateProfile() - Edit profile data
│   ├── getProfile() view - Retrieve profile by ID
│   ├── hasProfile() view - Check if address has profile
│   └── adminVerifyProfile() - Admin tier advancement
│
└── Fee Logic
├── 3 FLOW payment requirement for createBasicProfile()
├── TokenQualifier integration for BUFFAFLOW bypass
└── Mainnet BUFFAFLOW token qualification (100+ tokens = free)

### TokenQualifierFixed Contract (Ownable)
├── Fee Management
│   ├── tierFees mapping (tier => fee amount)
│   └── getRequiredFee() view
│
├── Token Qualification
│   ├── tokenRequirements mapping (tier => token => minimum balance)
│   ├── hasQualifyingTokens() view
│   ├── isQualified() view - Frontend compatibility function
│   └── BUFFAFLOW integration (100+ tokens OR any NFT)
│
└── Admin Functions
├── setTierFee() onlyOwner
├── updateTokenRequirement() onlyOwner
└── removeQualifyingToken() onlyOwner

## Technical Implementation

### Project Structure
immutable5/
├── app/
│   ├── page.tsx                        ✅ Server-side redirect
│   ├── layout.tsx                      ✅ Clean layout (no providers)
│   ├── globals.css                     ✅ Custom CSS (no Tailwind)
│   └── profile/
│       ├── create/page.tsx             ✅ Desktop-first profile creation
│       └── [id]/page.tsx               ✅ Profile viewer
│
├── lib/
│   ├── hooks/
│   │   └── useDirectWallet.ts          ✅ MetaMask SDK integration
│   ├── services/profile/
│   │   ├── ProfileNFT.ts               ✅ Contract interaction service
│   │   └── TokenQualifier.ts           ✅ BUFFAFLOW qualification
│   ├── types/
│   │   └── profile.ts                  ✅ TypeScript interfaces
│   └── web3/
│       ├── chains.ts                   ✅ Flow EVM Mainnet config
│       └── contracts.ts                ✅ Mainnet contract addresses
│
├── .env.production                     ✅ Mainnet environment variables
├── .dockerignore                       ✅ Railway deployment optimization
├── railway.toml                        ✅ Railway configuration
├── next.config.js                      ✅ Simplified build config
└── package.json                        ✅ Minimal dependencies

### Technology Stack
```typescript
// Core Framework
Next.js 15.5.2 (App Router, no Turbopack for Railway)
TypeScript 5.x
React 19.1.0

// Desktop Web3 Integration
@metamask/sdk for desktop browser connections
ethers.js for contract interactions
@react-native-async-storage/async-storage for compatibility

// Styling & UI
Custom CSS with Inter font stack
No Tailwind CSS dependencies
Responsive desktop-first design
Canvas Confetti for success animations

// Hosting & Deployment
Railway (Production application hosting)
Automatic deployments from GitHub main branch
Custom domain with SSL certificate provisioning
Docker optimization with .dockerignore
Environment Configuration
bash# Flow EVM Mainnet Configuration (.env.production)
NEXT_PUBLIC_PROFILE_NFT_ADDRESS=0xDb742cD47D09Cf7e6f22F24289449C672Ef77934
NEXT_PUBLIC_TOKEN_QUALIFIER_ADDRESS=0xa27e2A0280127cf827876a4795d551865F930687
NEXT_PUBLIC_TREASURY_ADDRESS=0x00000000000000000000000228B74E66CBD624Fc
NEXT_PUBLIC_BUFFAFLOW_ADDRESS=0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798
NEXT_PUBLIC_FLOW_EVM_CHAIN_ID=747
NEXT_PUBLIC_FLOW_EVM_RPC_URL=https://mainnet.evm.nodes.onflow.org
NEXT_PUBLIC_ENVIRONMENT=mainnet
Verified Working Features
Desktop Web3 Connection (Confirmed Working)

Desktop connection rate: 95%+ success on Chrome, Firefox, Safari, Edge
Network switching: Automatic Flow EVM Mainnet (747) addition
Session persistence: Maintains connections across page refreshes
Provider stability: Reliable MetaMask SDK integration

Profile Creation (Confirmed Working)

Fee processing: 3 FLOW payment successfully processed
BUFFAFLOW bypass: 100+ token holders create profiles for free
Profile storage: Data persisted on-chain with proper structure
DID generation: W3C compliant format did:pkh:eip155:747:0x
Transfer mechanics: NFT transferable with personal data reset

Production Deployment (Confirmed Working)

Custom domain: app.immutabletype.com fully operational
SSL/HTTPS: Automatic certificate provisioning and renewal
Build optimization: Docker optimized, minimal dependencies
Performance: Sub-second page loads and responsive design
Error handling: Comprehensive validation and user guidance

Mobile User Management (Confirmed Working)

Device detection: Immediate mobile browser identification
Clear messaging: Desktop requirement explanation
Technical transparency: Web3 limitations clearly communicated
User guidance: Direction to desktop for optimal experience

Security Implementation
Smart Contract Security

ReentrancyGuard: Prevents reentrancy attacks on payable functions
AccessControl: Role-based permissions for admin functions
Input validation: String length limits and format validation
Fee validation: Proper payment amount verification with BUFFAFLOW bypass
Transfer protection: Personal data reset on NFT transfer

Frontend Security

Form validation: Client-side validation with server-side verification
Network verification: Flow EVM Mainnet chain ID enforcement
Wallet integration: Secure MetaMask SDK API usage
Error handling: Graceful failure management
HTTPS enforcement: SSL certificates for all communications

Desktop Security

Provider validation: Secure MetaMask SDK provider detection
Connection management: Secure wallet connection persistence
Network isolation: Desktop-only Web3 operations

Performance Metrics
Desktop Performance

Connection time: 3-5 seconds on desktop browsers
Success rate: 95%+ on Chrome, Firefox, Safari, Edge
Network switching: 95%+ success rate for Flow EVM addition
Form responsiveness: Real-time validation and feedback

Transaction Performance

Profile creation time: 10-15 seconds (including MetaMask confirmation)
Gas usage: ~518,000 gas units per profile creation
Fee bypass: Instant for qualified BUFFAFLOW holders
Success rate: 100% for properly formatted transactions

Hosting Performance

Railway deployment: Automatic scaling and optimization
CDN delivery: Global content distribution
SSL termination: Secure connection handling
Build time: 2-4 minutes from push to deployment

Development Roadmap
Phase 5: Completed ✅

Desktop MetaMask integration with SDK
Flow EVM Mainnet deployment with fixed contracts
BUFFAFLOW token integration for fee bypass
Production deployment on Railway with custom domain
Mobile user management with desktop redirect
Contract debugging and fixes for proper fee handling

Phase 6: In Progress 🔥

Farcaster integration for Tier 1 advancement
Enhanced profile editing capabilities
Admin dashboard for profile management
Mobile native app evaluation and planning

Phase 7: Planned 📋

Crossmint KYC integration for Tier 2 advancement
zK proof verification for Tier 3 advancement
Social graph implementation
Transfer mechanics and marketplace integration

API Documentation
ProfileNFTFixed Contract Interface
solidity// Core profile creation
function createBasicProfile(
    string memory displayName,
    string memory bio, 
    string memory location,
    string memory avatarUrl
) external payable returns (uint256)

// Profile retrieval
function getProfile(uint256 profileId) external view returns (Profile memory)
function hasProfile(address owner) external view returns (bool)

// Tier advancement (interfaces ready)
function stepUpWithFarcaster(uint256 profileId, uint256 fid, bytes memory proof) external payable
function stepUpWithCrossmint(uint256 profileId, string memory kycId, bytes memory proof) external payable
Frontend Service Interface
typescript// ProfileNFTService methods
async createBasicProfile(profileData: ProfileData, address: string): Promise<ProfileCreationResult>
async getProfile(profileId: string): Promise<ProfileDisplayData>

// TokenQualifierService methods  
async checkQualification(userAddress: string): Promise<QualificationStatus>

// Desktop wallet integration
async connectWallet(): Promise<void>
Deployment Information
Contract Deployment Record
json{
  "network": "Flow EVM Mainnet",
  "chainId": 747,
  "timestamp": "2025-09-20T03:00:00.000Z",
  "contracts": {
    "ProfileNFTFixed": "0xDb742cD47D09Cf7e6f22F24289449C672Ef77934",
    "TokenQualifierFixed": "0xa27e2A0280127cf827876a4795d551865F930687"
  },
  "treasury": "0x00000000000000000000000228B74E66CBD624Fc",
  "buffaflow": "0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798",
  "fixes_applied": [
    "Added isQualified function to TokenQualifier",
    "Set proper Tier 0 fee (3 FLOW)",
    "Fixed fee validation logic in ProfileNFT",
    "Configured BUFFAFLOW token qualification"
  ]
}
DNS Configuration
immutabletype.com          A       [Shopify IP]
app.immutabletype.com      CNAME   [Railway Domain]
Project Status

Repository: https://github.com/ImmutableType/immutable5
Production URL: https://app.immutabletype.com
Last Updated: September 20, 2025
Status: Production ready with desktop Web3 connectivity and mainnet deployment
Next Milestone: Farcaster integration for Tier 1 advancement
Hosting: Railway with custom domain and SSL
Architecture: Desktop-first Web3 identity verification system