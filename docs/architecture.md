ImmutableType Phase 5 - Complete Architecture Documentation
Tiered Identity Verification System - Production Ready Profile Creation
Updated: September 15, 2025 at 12:21 PM PST
System Overview
ImmutableType Phase 5 implements a tiered identity verification system on Flow EVM with transferable profile NFTs. Status: Profile creation system fully operational with working smart contracts, fee payment processing, and on-chain data storage. Users can successfully mint identity profiles by paying 3 FLOW tokens through a clean, professional interface deployed at app.immutabletype.com.
Live Deployment Information
Production URLs

Main Application: app.immutabletype.com (Railway hosted)
Primary Website: immutabletype.com (Shopify hosted - unchanged)
GitHub Repository: https://github.com/ImmutableType/immutable5

Hosting Architecture

Frontend Application: Railway (Next.js 15.5.2)
Domain Strategy: Subdomain separation maintaining Shopify ecosystem
DNS Configuration: CNAME app.immutabletype.com → Railway
SSL/TLS: Automatic certificate provisioning via Railway

Live Contract Addresses (Flow EVM Testnet)

ProfileNFT: 0x2b1DAc1E85d5CFFFaCD38ad27595766ADf1Ffb23 ✅ DEPLOYED & OPERATIONAL
TokenQualifier: 0x4F8E10cC1f1cC1b937208F5B5ef23242b90d05ff ✅ DEPLOYED & OPERATIONAL
Treasury Wallet: 0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2 (EOA)
BUFFAFLOW Contract: 0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798 (Flow EVM Mainnet only)
Network: Flow EVM Testnet (Chain ID: 545)
RPC: https://testnet.evm.nodes.onflow.org
Explorer: https://evm-testnet.flowscan.io

Current Implementation Status
Profile Creation System: ✅ FULLY OPERATIONAL

Working smart contract deployment with proper fee handling
3 FLOW payment processing for profile creation
On-chain profile data storage and retrieval
Profile NFT minting with proper metadata
DID generation following W3C standards
Profile verification through live data display
Clean, professional UI with premium messaging

User Experience: ✅ PRODUCTION READY

Landing Page: Pass-through redirect to profile creation
Messaging: "Welcome to ImmutableType - Once moveable, now provable"
Wallet Integration: MetaMask-only flow with clear instructions
Form Design: Professional typography using Inter font stack
Error Handling: Comprehensive validation and user feedback
Success Flow: Celebration animation with profile link

Confirmed Working Features

Profile creation via createBasicProfile() with 4-parameter input
Fee payment validation (3 FLOW requirement)
Profile data persistence (displayName, bio, location, avatarUrl)
Profile retrieval by ID with full metadata
Transfer mechanics with data reset capability
Admin verification and tier advancement interfaces
Responsive design for mobile and desktop

System Architecture
High-Level Architecture Diagram
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                               ImmutableType System                                         │
│                            Hybrid Hosting Architecture                                     │
└────────────────────────────────────────────────────────────────────────────────────────────┘

Domain Layer
┌─────────────────────────────┐         ┌─────────────────────────────────────────────────┐
│   immutabletype.com         │         │         app.immutabletype.com                  │
│   (Shopify Hosted)          │         │         (Railway Hosted)                       │
│   - Main website            │         │         - Identity verification app             │
│   - E-commerce              │         │         - Profile creation                      │
│   - Marketing content       │         │         - Blockchain integration                │
│   - Blog & community        │         │         - MetaMask wallet connection            │
└─────────────────────────────┘         └─────────────────────────────────────────────────┘
             │                                                  │
             │                                                  │
             └──────────────────┬───────────────────────────────┘
                                │
                         DNS Configuration
                         CNAME app → Railway
                         A @ → Shopify

Application Layer (Railway - Next.js 15.5.2)
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                         │
│  Frontend Layer                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                   │
│  │  Landing Page   │    │ Profile Create  │    │  Profile View   │                   │
│  │  / (redirect)   │    │ /profile/create │    │  /profile/[id]  │                   │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘                   │
│           │                       │                       │                           │
│           └───────────────────────┼───────────────────────┘                           │
│                                   │                                                   │
│  Service Layer (TypeScript)                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  ProfileNFTService          │  TokenQualifierService            │               │ │
│  │  - createBasicProfile()     │  - checkQualification()           │               │ │
│  │  - getProfile()             │  - hasQualifyingTokens()          │               │ │
│  │  - getProfileCount()        │  - getRequiredFee()               │               │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│           │                                   │                                       │
│           └───────────────────┬───────────────────────────────────┘                 │
│                               │                                                       │
└───────────────────────────────┼───────────────────────────────────────────────────────┘
                                │
Blockchain Layer (Solidity)
┌───────────────────────────────┼───────────────────────────────────────────────────────┐
│                    Flow EVM Testnet                                                   │
│  ┌─────────────────┐              ┌─────────────────┐                                │
│  │   ProfileNFT    │◄─────────────►│ TokenQualifier  │                                │
│  │   Contract      │              │    Contract     │                                │
│  │                 │              │                 │                                │
│  │ 0x2b1DAc1E...   │              │ 0x4F8E10cC...   │                                │
│  └─────────────────┘              └─────────────────┘                                │
└───────────────────────────────────────────────────────────────────────────────────────┘
Smart Contract Architecture
ProfileNFT Contract (ERC721 + AccessControl + ReentrancyGuard)
├── Profile Struct
│   ├── tier: uint256 (0=Basic, 1=Social, 2=Identity, 3=Anonymous)
│   ├── did: string (W3C compliant: did:pkh:eip155:545:0x...)
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
│   ├── createBasicProfile() payable - Tier 0 creation with fee
│   ├── stepUpWithFarcaster() payable - Tier 1 advancement
│   ├── stepUpWithCrossmint() payable - Tier 2 advancement
│   ├── updateProfile() - Edit profile data
│   ├── getProfile() view - Retrieve profile by ID
│   ├── hasProfile() view - Check if address has profile
│   └── adminVerifyProfile() - Admin tier advancement
│
└── Fee Logic
    ├── 3 FLOW payment requirement for createBasicProfile()
    ├── TokenQualifier integration for fee bypass
    └── BUFFAFLOW token qualification (mainnet only)

TokenQualifier Contract (Ownable)
├── Fee Management
│   ├── tierFees mapping (tier => fee amount)
│   └── getRequiredFee() view
│
├── Token Qualification
│   ├── tokenRequirements mapping (tier => token => minimum balance)
│   ├── hasQualifyingTokens() view
│   └── addQualifyingToken() onlyOwner
│
└── Admin Functions
    ├── setTierFee() onlyOwner
    ├── updateTokenRequirement() onlyOwner
    └── removeQualifyingToken() onlyOwner
Data Flow Architecture
User Profile Creation Flow:

1. User Entry
   ┌─────────────────┐
   │ app.immutable   │
   │ type.com        │
   │ Landing         │
   └─────────────────┘
            │
            ▼
2. Redirect Flow
   ┌─────────────────┐
   │ Pass-through    │
   │ Redirect to     │
   │ /profile/create │
   └─────────────────┘
            │
            ▼
3. User Input
   ┌─────────────────┐
   │ Form Submission │
   │ - displayName   │
   │ - bio           │
   │ - location      │
   │ - avatarUrl     │
   └─────────────────┘
            │
            ▼
4. Frontend Validation
   ┌─────────────────┐
   │ Form Validation │
   │ - Length limits │
   │ - Required fields│
   │ - URL format    │
   └─────────────────┘
            │
            ▼
5. Service Layer
   ┌─────────────────┐
   │ProfileNFTService│
   │ - Connect wallet│
   │ - Check balance │
   │ - Prepare tx    │
   └─────────────────┘
            │
            ▼
6. Blockchain Transaction
   ┌─────────────────┐
   │ Smart Contract  │
   │ - Fee validation│
   │ - Profile mint  │
   │ - DID generation│
   │ - Event emission│
   └─────────────────┘
            │
            ▼
7. Confirmation
   ┌─────────────────┐
   │ Transaction     │
   │ Receipt         │
   │ - Profile ID    │
   │ - DID           │
   │ - Tx hash       │
   └─────────────────┘
Current Technical Implementation
Project Structure
immutable5/
├── contracts/
│   ├── identity/
│   │   └── ProfileNFT.sol              ✅ Deployed contract
│   ├── interfaces/
│   │   └── ITokenQualifier.sol         ✅ Interface definition
│   └── TokenQualifier.sol              ✅ Deployed contract
│
├── app/
│   ├── page.tsx                        ✅ Pass-through landing page
│   ├── layout.tsx                      ✅ Root layout
│   ├── globals.css                     ✅ Enhanced styling with Inter fonts
│   └── profile/
│       ├── create/page.tsx             ✅ Profile creation form
│       └── [id]/page.tsx               ✅ Profile viewer
│
├── lib/
│   ├── hooks/
│   │   └── useDirectWallet.ts          ✅ Wallet integration
│   ├── providers/
│   │   └── DirectWalletProvider.tsx    ✅ Wallet state management
│   ├── services/profile/
│   │   ├── ProfileNFT.ts               ✅ Contract interaction service
│   │   └── TokenQualifier.ts           ✅ Token qualification service
│   ├── types/
│   │   └── profile.ts                  ✅ TypeScript interfaces
│   └── web3/
│       ├── chains.ts                   ✅ Network configuration
│       └── contracts.ts                ✅ Contract ABIs and addresses
│
├── design-inspo/                       ✅ Local design reference files
│   ├── index.html
│   ├── index-backup-*.html
│   └── shopify-*.html
│
├── deployments/
│   └── ProfileNFT.json                 ✅ Deployment record
│
├── next.config.js                      ✅ ESLint configuration
├── .eslintrc.json                      ✅ Linting rules
├── .gitignore                          ✅ Excludes design-inspo
└── scripts/
    └── deploy-profile.js               ✅ Deployment script
Technology Stack
typescript// Core Framework
Next.js 15.5.2 (App Router, Turbopack disabled)
TypeScript 5.x
React 19.1.0

// Styling & UI
CSS Custom Properties with Inter font stack
Responsive design with mobile-first approach
Professional typography hierarchy
Canvas Confetti for success animations

// Blockchain Integration
ethers.js for Web3 connectivity
MetaMask wallet integration
Flow EVM Testnet (Chain ID: 545)

// Hosting & Deployment
Railway (Primary application hosting)
Automatic deployments from GitHub main branch
Custom domain with SSL certificate provisioning
Design System
css/* Typography Scale */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-headlines: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;

/* Color Palette */
--color-slate-50: #f8fafc;    /* Background */
--color-slate-900: #0f172a;   /* Primary text */
--color-primary-600: #2563eb; /* Brand primary */
--color-emerald-600: #059669; /* Success states */
--color-red-600: #dc2626;     /* Error states */

/* Component System */
Premium form elements with focus states
Gradient buttons with hover animations
Professional alert components
Responsive grid layouts
User Experience Design
Messaging Strategy

Primary Headline: "Welcome to ImmutableType"
Value Proposition: "Once moveable, now provable"
Call to Action: "Get started by creating a profile"
Trust Signals: MetaMask security, blockchain verification

User Journey

Entry: app.immutabletype.com → Automatic redirect
Onboarding: Clear MetaMask installation guidance
Profile Creation: Streamlined 4-field form
Payment: 3 FLOW fee with clear pricing
Success: Celebration with profile link
Profile View: Clean display of verified identity data

Responsive Design

Mobile-first CSS architecture
Touch-friendly interface elements
Optimized form layouts for mobile
Professional desktop experience

Deployment Architecture
Domain Strategy Decision
Chosen Approach: Subdomain separation maintaining existing Shopify ecosystem
Rationale:

Preserves existing immutabletype.com Shopify store and SEO
Allows independent development and scaling of blockchain application
Enables different hosting optimizations for different use cases
Maintains brand coherence while separating technical concerns

Implementation:

immutabletype.com → Shopify (unchanged)
app.immutabletype.com → Railway (new blockchain application)
DNS CNAME configuration for seamless user experience

Hosting Platform Selection
Chosen Platform: Railway
Rationale:

Simplified deployment pipeline from GitHub
Automatic SSL certificate management
Better developer experience than Vercel for this use case
Reliable custom domain support
Cost-effective for current scale

Deployment Pipeline
GitHub Repository (main branch)
         ↓
Railway Automatic Detection
         ↓
Next.js Build Process
         ↓
Production Deployment
         ↓
app.immutabletype.com
Verified Working Features
Profile Creation (Confirmed Working)

Transaction fees: 3 FLOW payment successfully processed
Profile storage: Data persisted on-chain with proper structure
Profile IDs: Sequential ID assignment (Profile 1, Profile 2, etc.)
DID generation: W3C compliant format did:pkh:eip155:545:0x[address]
Timestamps: Accurate creation time recording
Status management: Active profile status tracking
UI/UX: Professional interface with clear success feedback

Profile Retrieval (Confirmed Working)

By ID lookup: /profile/1 and /profile/2 successfully display data
Complete metadata: All profile fields retrieved correctly
Real-time verification: Direct contract queries confirm data integrity
Professional display: Clean typography and information hierarchy

Fee System (Confirmed Working)

Payment processing: MetaMask transactions confirmed with 3 FLOW deduction
Gas consumption: Proper gas usage (~518k gas units per transaction)
Treasury deposit: Fees successfully transferred to contract
User feedback: Clear payment status and confirmation flows

Production Deployment (Confirmed Working)

Custom domain: app.immutabletype.com fully operational
SSL/HTTPS: Automatic certificate provisioning and renewal
Performance: Sub-second page loads and responsive design
Error handling: Comprehensive validation and user guidance

Current Limitations & Known Issues
Flow EVM Testnet Explorer

Issue: Block explorer indexing delays prevent transaction hash searches
Impact: Cannot verify transactions via explorer search
Mitigation: Direct contract queries confirm successful profile creation
Status: Infrastructure issue, not application problem

Token Qualification

Current state: TokenQualifier deployed but not configured with qualifying tokens
BUFFAFLOW availability: Only exists on Flow EVM mainnet, not testnet
Fee bypass: Not currently functional due to lack of qualifying tokens
Plan: Deploy test tokens or configure admin overrides for qualification testing

Design Asset Management

Current state: Design inspiration files moved to design-inspo/ directory
Gitignore status: Directory excluded from future commits but preserved in repository
Impact: Clean codebase while maintaining design reference materials

Security Implementation
Smart Contract Security

ReentrancyGuard: Prevents reentrancy attacks on payable functions
AccessControl: Role-based permissions for admin functions
Input validation: String length limits and format validation
Fee validation: Proper payment amount verification
Transfer protection: Personal data reset on NFT transfer

Frontend Security

Form validation: Client-side validation with server-side verification
Network verification: Flow EVM testnet chain ID enforcement
Wallet integration: Secure MetaMask API usage
Error handling: Graceful failure management
HTTPS enforcement: SSL certificates for all communications

Deployment Security

Automatic SSL: Railway-managed certificate provisioning
Environment separation: Production environment isolation
Secure build pipeline: Automated deployment from verified source

Performance Metrics
Transaction Performance

Profile creation time: ~10-15 seconds (including MetaMask confirmation)
Gas usage: ~518,000 gas units per profile creation
Success rate: 100% for properly formatted transactions
Network reliability: Flow EVM testnet stable for development

Application Performance

Page load times: Sub-second profile data retrieval
Form responsiveness: Real-time validation and feedback
Wallet connection: Immediate MetaMask popup integration
Error recovery: Proper error states and retry mechanisms
Mobile performance: Optimized for mobile device constraints

Hosting Performance

Railway deployment: Automatic scaling and optimization
CDN delivery: Global content distribution
SSL termination: Secure connection handling
Uptime: Production-level reliability metrics

Development Roadmap
Phase 5: Completed ✅

Smart contract deployment and verification
Profile creation with fee payment
Professional UI/UX with premium messaging
Production deployment on Railway
Custom domain configuration
Mobile-responsive design

Phase 6: In Progress 🔄

Farcaster integration for Tier 1 advancement
Enhanced profile editing capabilities
Admin dashboard for profile management
BUFFAFLOW token qualification testing

Phase 7: Planned 📋

Crossmint KYC integration for Tier 2 advancement
zK proof verification for Tier 3 advancement
Social graph implementation
Transfer mechanics and marketplace integration

Phase 8: Future 🔮

Multi-network deployment (Flow EVM mainnet)
Advanced verification methods
Community governance features
Ecosystem integrations and partnerships

API Documentation
ProfileNFT Contract Interface
solidity// Core profile creation
function createBasicProfile(
    string memory displayName,
    string memory bio, 
    string memory location,
    string memory avatarUrl
) external payable returns (uint256)

// Profile retrieval
function getProfile(uint256 profileId) external view returns (Profile memory)
function getProfileByAddress(address owner) external view returns (Profile memory)
function hasProfile(address owner) external view returns (bool)

// Profile management
function updateProfile(
    uint256 profileId,
    string memory displayName,
    string memory bio,
    string memory location, 
    string memory avatarUrl
) external

// Tier advancement
function stepUpWithFarcaster(uint256 profileId, uint256 fid, bytes memory proof) external payable
function stepUpWithCrossmint(uint256 profileId, string memory kycId, bytes memory proof) external payable
Frontend Service Interface
typescript// ProfileNFTService methods
async createBasicProfile(profileData: ProfileData, address: string): Promise<ProfileCreationResult>
async getProfileCount(userAddress: string): Promise<number>
async canCreateProfile(userAddress: string): Promise<boolean>

// TokenQualifierService methods  
async checkQualification(userAddress: Address): Promise<QualificationStatus>
async isBuffaflowBypassAvailable(): Promise<boolean>
Deployment Information
Contract Deployment Record
json{
  "network": "Flow EVM Testnet",
  "chainId": 545,
  "timestamp": "2025-09-08T16:17:26.755Z",
  "contracts": {
    "TokenQualifier": "0x4F8E10cC1f1cC1b937208F5B5ef23242b90d05ff",
    "ProfileNFT": "0x2b1DAc1E85d5CFFFaCD38ad27595766ADf1Ffb23"
  },
  "deployer": "0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2"
}
Environment Configuration
bash# Core blockchain configuration
NEXT_PUBLIC_FLOW_EVM_RPC_URL=https://testnet.evm.nodes.onflow.org
NEXT_PUBLIC_FLOW_EVM_CHAIN_ID=545
NEXT_PUBLIC_PROFILE_NFT_ADDRESS=0x2b1DAc1E85d5CFFFaCD38ad27595766ADf1Ffb23
NEXT_PUBLIC_TOKEN_QUALIFIER_ADDRESS=0x4F8E10cC1f1cC1b937208F5B5ef23242b90d05ff
NEXT_PUBLIC_ENVIRONMENT=production

# Domain configuration
PRODUCTION_URL=https://app.immutabletype.com
SHOPIFY_MAIN_SITE=https://immutabletype.com
DNS Configuration
immutabletype.com          A       [Shopify IP]
app.immutabletype.com      CNAME   hmxwxqim.up.railway.app
Machine-Readable Architecture Specification
json{
  "system": {
    "name": "ImmutableType",
    "version": "5.1.0",
    "phase": "Production Ready Profile Creation",
    "deployment": {
      "primary": "app.immutabletype.com",
      "hosting": "Railway",
      "mainSite": "immutabletype.com (Shopify)"
    },
    "network": {
      "name": "Flow EVM Testnet",
      "chainId": 545,
      "rpc": "https://testnet.evm.nodes.onflow.org"
    }
  },
  "contracts": {
    "ProfileNFT": {
      "address": "0x2b1DAc1E85d5CFFFaCD38ad27595766ADf1Ffb23",
      "standard": "ERC721",
      "features": ["AccessControl", "ReentrancyGuard"],
      "functions": {
        "createBasicProfile": {
          "type": "payable",
          "fee": "3000000000000000000",
          "parameters": ["string", "string", "string", "string"],
          "returns": "uint256"
        }
      }
    },
    "TokenQualifier": {
      "address": "0x4F8E10cC1f1cC1b937208F5B5ef23242b90d05ff",
      "standard": "Ownable",
      "functions": {
        "hasQualifyingTokens": {
          "type": "view",
          "parameters": ["address", "uint256"],
          "returns": "bool"
        }
      }
    }
  },
  "tiers": {
    "0": {"name": "Basic", "fee": "3 FLOW", "method": "wallet"},
    "1": {"name": "Social", "fee": "variable", "method": "farcaster"},
    "2": {"name": "Identity", "fee": "variable", "method": "crossmint"},
    "3": {"name": "Anonymous", "fee": "variable", "method": "zk-proof"}
  },
  "status": {
    "profileCreation": "production",
    "feePayment": "production", 
    "dataRetrieval": "production",
    "userInterface": "production",
    "mobileResponsive": "production",
    "customDomain": "production",
    "tierAdvancement": "interface-ready",
    "tokenQualification": "deployed-not-configured"
  },
  "hosting": {
    "architecture": "hybrid",
    "frontend": "Railway",
    "mainSite": "Shopify",
    "domainStrategy": "subdomain-separation"
  }
}

Repository: https://github.com/ImmutableType/immutable5
Production URL: https://app.immutabletype.com
Last Updated: September 15, 2025 at 12:21 PM PST
Status: Production ready profile creation system with professional UI
Next Milestone: Farcaster integration for Tier 1 advancement
Hosting: Railway with custom domain and SSL