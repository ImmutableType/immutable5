# ImmutableType - Decentralized Journalism Platform

[![Flow EVM Mainnet](https://img.shields.io/badge/Flow-EVM%20Mainnet-00EF8B)](https://evm.flowscan.io)
[![Live on Mainnet](https://img.shields.io/badge/Status-Live%20on%20Mainnet-success)](https://app.immutabletype.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Built on Flow EVM Mainnet** | **Production URL**: https://app.immutabletype.com

---

## 🌊 Built on Flow Blockchain

**ImmutableType** is a decentralized journalism platform built on **Flow EVM Mainnet** that creates immutable, transferable identity verification for journalists and readers. We're building critical infrastructure to support local journalism by enabling on-chain content creation, source verification, and community-driven news economics.

### Network Information
- **Blockchain**: Flow EVM Mainnet
- **Chain ID**: 747
- **Network Status**: ✅ **LIVE ON MAINNET**
- **RPC Endpoint**: https://mainnet.evm.nodes.onflow.org
- **Block Explorer**: https://evm.flowscan.io

---

## 📝 Deployed Smart Contract Addresses

All contracts are **deployed and operational on Flow EVM Mainnet**:

| Contract | Address | Purpose |
|----------|---------|---------|
| **ProfileNFTFixed** | `0xDb742cD47D09Cf7e6f22F24289449C672Ef77934` | Tiered transferable identity NFTs |
| **TokenQualifierFixed** | `0xa27e2A0280127cf827876a4795d551865F930687` | Multi-token gating system |
| **BookmarkNFT** | `0x6652801B89f9E3B4a8847Fd0C4F17e7dCd32dFF5` | On-chain source verification |
| **FrothComicTournamentV2** | `0x57AA4E1B146C675c446310b4Ff92ed9e6E5c10FC` | Daily comic tournaments with voting |
| **ComicNFT** | `0x7AA01C6E9CF61751FFbED7aEA8d656ad5bE526d6` | Comic NFT minting (98% gas optimized) |
| **BUFFAFLOW Token** | `0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798` | Voting token & fee bypass (ERC404) |
| **Treasury Wallet** | `0x00000000000000000000000228B74E66CBD624Fc` | Platform treasury (EOA) |

**Verify all contracts on Flow EVM Explorer**: [evm.flowscan.io](https://evm.flowscan.io)

---

## 🎥 Video Demo

**[VIDEO DEMO LINK - https://www.loom.com/share/55f3c327ca5b4fa58e239367de060a47]**

The video demonstration covers:
1. Profile NFT creation with BUFFAFLOW token bypass
2. Bookmark collection system with Chrome extension import
3. FROTH Daily Comic tournament with MoonBuffaFLOW characters
4. Dune Analytics dashboard showing real growth metrics
5. Complete user journey from wallet connection to NFT minting

---

## ⚡ Key Features (All Live on Mainnet)

### 1. Tiered Transferable Profile NFTs
- Progressive verification system (Tier 0-4+)
- Multiple token gates: 3 FLOW payment OR 100+ BUFFAFLOW tokens OR 100 FROTH tokens
- W3C compliant DIDs: `did:pkh:eip155:747:0x...`
- Fully transferable ERC-721 tokens with personal data reset
- Early adopter recognition via preserved creation timestamps

### 2. On-Chain Bookmark Collection System
- Chrome extension integration for bulk import
- Mint bookmark NFTs (0.025 FLOW per bookmark OR free with BUFFAFLOW)
- Daily mint limits (20/day) for anti-spam protection
- Global discovery feed for public bookmark browsing
- Foundation for upcoming News Launchpad and citation system

### 3. FROTH Daily Comic Tournament
- Skill-based comic creation using MoonBuffaFLOW NFT characters
- Word Pack economy with themed NFT purchases
- Community-driven vocabulary (authentic Buffalo dialect)
- No gambling mechanics - pure creativity competition

**Key Innovation: 98% Gas Optimization**
- Comics store word **indices** instead of full strings
- Dramatically reduced minting costs on Flow EVM
- Example: "puking" (excellent), "pop" (soda), Buffalo-specific phrases

**Tournament Mechanics**:
- Entry: 100 FROTH tokens (33 to treasury, 67 to prize pools)
- Create: Mint up to 5 comics per entry using character + word bank
- Vote: BUFFAFLOW holders vote on favorite comics
- Claim: Winner takes creator pool, voters share voter pool (after 24 hours)

**Multi-Token Ecosystem**:
- FROTH: Entry fees and creator rewards
- BUFFAFLOW: Voting power and fee bypass
- Treasury FROTH converts to FVIX tokens
- Demonstrates Flow EVM multi-asset composability

**Production Metrics (First Tournament - Day 363)**:
- Entry: 100 FROTH processed
- Comics: 5 NFTs minted successfully
- Votes: 13 BUFFAFLOW deployed
- Rewards: 67 FROTH claimed (34 creator + 33 voter)
- System Uptime: 100%

### 4. Dune Analytics Dashboard
- Real-time on-chain metrics tracking
- Profile creation and growth trends
- Bookmark minting activity
- BUFFAFLOW holder distribution
- Complete platform transparency

### 5. Chrome Extension for UX
- One-click bookmark export from browser
- Bulk import with URL validation
- Direct wallet-to-contract interaction
- Privacy-first design (no server processing)

---

## 🏗️ Technical Architecture

### Smart Contracts (Solidity)
- **ERC-721**: ProfileNFT, BookmarkNFT, ComicNFT
- **ERC-20**: FROTH token (tournament entry fees)
- **ERC-404**: BUFFAFLOW (hybrid token/NFT for voting)
- **Tournament System**: Daily tournament lifecycle with voting
- **Custom Logic**: TokenQualifier for multi-token gating
- **Security**: ReentrancyGuard, AccessControl, input validation
- **Gas Optimization**: 98% savings storing indices vs strings (ComicNFT)
- **Deployment**: Hardhat with mainnet configuration

### Frontend (Next.js)
- **Framework**: Next.js 15.5.2 with React 19
- **Language**: TypeScript for type safety
- **Web3**: MetaMask SDK + ethers.js
- **Hosting**: Railway with custom domain
- **SSL**: Automatic HTTPS certificate provisioning

### Development Tools
- Hardhat for smart contract development
- Foundry's `cast` for contract verification
- Chrome Extension (Manifest V3)
- Dune Analytics for on-chain metrics

---

## 🚀 Getting Started

### Prerequisites
- MetaMask wallet installed
- Flow EVM Mainnet network added (Chain ID: 747)
- FLOW tokens for gas fees OR BUFFAFLOW tokens for fee bypass

### Quick Start
1. Visit **https://app.immutabletype.com**
2. Connect MetaMask wallet
3. Create your profile (3 FLOW or 100+ BUFFAFLOW)
4. Start minting bookmark NFTs
5. **Enter FROTH Daily Comic Tournament**
   - Pay 100 FROTH to enter
   - Mint up to 5 comics using MoonBuffaFLOW characters
   - Vote with BUFFAFLOW on your favorite comics
   - Claim rewards after 24 hours

### Local Development
```bash
# Clone repository
git clone https://github.com/ImmutableType/immutable5
cd immutable5

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your contract addresses and RPC URL

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables Required
```bash
NEXT_PUBLIC_PROFILE_NFT_ADDRESS=0xDb742cD47D09Cf7e6f22F24289449C672Ef77934
NEXT_PUBLIC_TOKEN_QUALIFIER_ADDRESS=0xa27e2A0280127cf827876a4795d551865F930687
NEXT_PUBLIC_BOOKMARK_NFT_ADDRESS=0x6652801B89f9E3B4a8847Fd0C4F17e7dCd32dFF5
NEXT_PUBLIC_FROTH_TOURNAMENT_ADDRESS=0x57AA4E1B146C675c446310b4Ff92ed9e6E5c10FC
NEXT_PUBLIC_COMIC_NFT_ADDRESS=0x7AA01C6E9CF61751FFbED7aEA8d656ad5bE526d6
NEXT_PUBLIC_BUFFAFLOW_ADDRESS=0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798
NEXT_PUBLIC_FLOW_EVM_CHAIN_ID=747
NEXT_PUBLIC_FLOW_EVM_RPC_URL=https://mainnet.evm.nodes.onflow.org
```


---

## 📊 Current Metrics (Live on Mainnet)

**Platform Activity** (as of October 31, 2025):
- ✅ All features operational on Flow EVM Mainnet
- ✅ ProfileNFT contract deployed and minting
- ✅ BookmarkNFT contract active with daily mints
- ✅ BUFFAFLOW token integration working
- ✅ Chrome extension in production use
- ✅ Dune Analytics dashboard tracking growth

**Contract Verification**:
- All transactions viewable on [FlowScan](https://evm.flowscan.io)
- Public Dune dashboard for transparency
- Open-source repository on GitHub

---

## 🎯 Why Flow EVM?

We chose Flow EVM for strategic reasons:

1. **Low Gas Costs**: Profile creation ~$0.15, bookmark minting ~$0.03
2. **EVM Compatibility**: Leverage Solidity expertise and MetaMask ecosystem
3. **NFT Heritage**: Flow's proven success with NBA Top Shot
4. **Growing Ecosystem**: Early positioning in emerging Flow EVM landscape
5. **Developer Experience**: Excellent tooling and documentation

**Real-world viability**: Our micro-transaction model (bookmark minting, word pack purchases) requires low gas costs to be economically sustainable. Flow EVM delivers this while maintaining EVM compatibility.

---

## 🗺️ Roadmap

### ✅ Phase 5 (Completed - October 2025)
- Desktop Web3 integration with MetaMask SDK
- Tiered profile NFT system with multi-token gating
- Bookmark collection system with Chrome extension
- **FROTH Daily Comic Tournaments (LIVE)**
  - FrothComicTournamentV2 contract deployed
  - ComicNFT with 98% gas optimization
  - MoonBuffaFLOW character integration
  - Daily tournament lifecycle operational
  - First tournament completed successfully
- Production deployment on Railway
- Dune Analytics dashboard

### 🔥 Phase 6 (Launching November 15, 2025)
- News Launchpad: Story proposals with community voting
- Article publishing with on-chain source citations
- Miami Local News Hub with geographic tokens
- Enhanced profile management features
- Secondary marketplace for article NFTs

### 📋 Phase 7 (Q1 2026)
- Farcaster integration for Tier 1 verification
- Crossmint KYC for Tier 2 verification
- zK proof verification for Tier 3 anonymous profiles
- Social graph implementation
- Expansion to additional cities beyond Miami

---

## 🏆 Hackathon Highlights

**What Makes This Special**:

1. **Production-Ready**: Not a testnet prototype - all features live on mainnet with real users
2. **Complete Stack**: Smart contracts, frontend, Chrome extension, analytics all working together
3. **Real Economics**: BUFFAFLOW token creates actual utility through fee bypass
4. **Cultural Authenticity**: FROTH Comics use genuine Buffalo community vocabulary
5. **Journalism Focus**: Addressing real problems in local news with blockchain solutions

**Technical Achievements**:
- Transferable NFTs with selective data reset on transfer
- Multi-token qualification system (FLOW + BUFFAFLOW + FROTH)
- **98% gas optimization in ComicNFT** (storing indices vs strings)
- **Daily tournament system** with automated lifecycle management
- **Multi-token ecosystem integration** (FROTH → FVIX conversion)
- Chrome extension for seamless Web3 UX
- Desktop-first approach with mobile redirect
- Production deployment with custom domain and SSL

---

## 🤝 Community & Contact

**Production Platform**: https://app.immutabletype.com  
**Marketing Site**: https://immutabletype.com  
**Twitter**: [@Immutable_type](https://twitter.com/Immutable_type)  
**GitHub**: https://github.com/ImmutableType/immutable5  
**Dune Dashboard**: [Add your dashboard URL]

**Built by**: Damon  
- Bitcoin involvement since 2012
- Former Overstock.com blockchain team
- 15+ years software engineering experience
- Deep Flow ecosystem expertise

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **Flow Foundation** for Flow EVM infrastructure
- **MetaMask** for wallet SDK
- **Railway** for hosting platform
- **Dune Analytics** for blockchain analytics
- **BUFFAFLOW Community** for early adoption and testing

---

## 🔗 Additional Resources

- [Flow EVM Documentation](https://developers.flow.com/evm/about)
- [ImmutableType Architecture Docs](/mnt/project/architecture.md)
- [Phase 5 Design Roadmap](/mnt/project/User_ID_Arch_Design_roadmaps_and_decisions_)
- [Contract Deployment Records](/mnt/project/Final_ID_contract_decisions_)

---

**Built on Flow EVM Mainnet | Chain ID: 747 | All Features Live in Production**

*Restoring trust in local journalism through immutable on-chain identity and source verification.*