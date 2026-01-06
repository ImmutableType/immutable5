# FROTH Daily Comic Tournament - Architecture
**Production System - October 30, 2025**

## Key Innovations
- **Gas Optimization**: 98% gas savings by storing word indices instead of strings
- **Authentic Vocabulary**: Community-driven word banks (FROTH Essentials pack)
- **Skill-Based Competition**: Strategy over luck - voting timing matters
- **Multi-Token Ecosystem**: FROTH fees convert to FVIX; BUFFAFLOW adds NFT utility
- **NFT Integration**: MoonBuffaFLOW character primitives from sold-out collection
- **Desktop-First Web3**: Reliable MetaMask integration (95%+ success rate)

## Ecosystem Integration
- **NFTs**: MoonBuffaFLOW character assets in comic creation
- **Meme Tokens**: FROTH and BUFFAFLOW utility integration
- **DeFi**: Treasury FROTH converts to FVIX tokens
- **Gameplay**: Skill-based daily tournaments with real economic stakes
- **Flow EVM**: Demonstrates multi-asset composability on Flow blockchain

## Production Metrics (First Tournament - Day 363)
- Entry: 1 user, 100 FROTH processed correctly
- Comics: 5 NFTs minted successfully  
- Votes: 13 BUFFAFLOW deployed
- Rewards: 67 FROTH claimed (34 creator + 33 voter)
- Treasury: 33 FROTH received (→ FVIX) + 13 BUFFAFLOW (adds NFT utility)
- System Uptime: 100%

## System at a Glance (3x5 Card Version)
```
USER JOURNEY
┌─────────────────────────────────────────────────┐
│ 1. ENTER (100 FROTH)                            │
│    └─> 33 FROTH → Treasury                      │
│    └─> 67 FROTH → Prize Pools                   │
│                                                  │
│ 2. CREATE (Mint Comics)                         │
│    └─> Select characters + backgrounds          │
│    └─> Add words from word bank                 │
│    └─> Mint as NFT                              │
│                                                  │
│ 3. VOTE (BUFFAFLOW)                             │
│    └─> BUFFAFLOW → Treasury                     │
│    └─> Votes tracked on-chain                   │
│                                                  │
│ 4. CLAIM (After 24 hours)                       │
│    └─> Top comic wins creator pool              │
│    └─> Voters share voter pool                  │
└─────────────────────────────────────────────────┘

3 SMART CONTRACTS
- TournamentV2: Manages daily tournaments
- ComicNFT: Mints comic NFTs  
- Treasury: Receives FROTH + BUFFAFLOW

DAILY CYCLE
- 24 hours: Submit comics
- Finalize: Determine winner
- Forever: Claim rewards
```


## Complete Architecture Diagram
```
┌────────────────────────────────────────────────────────────────────────────┐
│                    FROTH DAILY COMIC TOURNAMENT SYSTEM                      │
│                         Flow EVM Mainnet (Chain ID: 747)                    │
└────────────────────────────────────────────────────────────────────────────┘

USER INTERFACE (app.immutabletype.com)
┌────────────────────────────────────────────────────────────────────────────┐
│  Next.js 15.5.2 Application (Railway Hosted)                               │
│                                                                             │
│  Pages:                                                                     │
│  ├─ /froth-comics ...................... Main tournament interface          │
│  ├─ /profile/[id] ..................... User profiles (ImmutableType)      │
│  └─ /profile/create ................... Profile creation                   │
│                                                                             │
│  Services (TypeScript):                                                     │
│  ├─ FrothComicService ................. Tournament interaction             │
│  ├─ ProfileNFTService ................. Identity verification              │
│  └─ MetaMask SDK ...................... Wallet connection (desktop-first)  │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                          SMART CONTRACTS LAYER                              │
└────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────┐
│  FrothComicTournamentV2             │
│  0x57AA...10FC                      │
├─────────────────────────────────────┤
│  • Daily tournament management      │
│  • Entry fee processing (100 FROTH) │
│  • Prize pool allocation            │
│  • Voting system (BUFFAFLOW)        │
│  • Winner selection & finalization  │
│  • Reward distribution              │
└─────────────────────────────────────┘
          │                    │
          │                    └────────────────┐
          ▼                                     ▼
┌─────────────────────────────────────┐  ┌─────────────────────────────────────┐
│  ComicNFT                           │  │  Treasury Wallet (EOA)              │
│  0x7AA0...dFF5                      │  │  0x0000...24Fc                      │
├─────────────────────────────────────┤  ├─────────────────────────────────────┤
│  • ERC721 NFT contract              │  │  Receives:                          │
│  • Comic metadata storage           │  │  • 33 FROTH per entry (treasury)    │
│  • Character + background IDs       │  │  • All BUFFAFLOW votes              │
│  • Word indices (not strings)       │  │                                     │
│  • Daily submission tracking        │  │  Converts to:                       │
│  • Gas optimized (98% savings)      │  │  • FVIX tokens (via conversion)     │
└─────────────────────────────────────┘  └─────────────────────────────────────┘

┌─────────────────────────────────────┐  ┌─────────────────────────────────────┐
│  ProfileNFT (ImmutableType)         │  │  Token Contracts                    │
│  0xDb74...7934                      │  │                                     │
├─────────────────────────────────────┤  ├─────────────────────────────────────┤
│  • Required for tournament entry    │  │  FROTH (ERC20)                     │
│  • Tiered identity verification     │  │  0xB73B...04bA                      │
│  • 3 FLOW or 100+ BUFFAFLOW to mint │  │                                     │
│  • W3C DID format                   │  │  BUFFAFLOW (ERC404)                 │
└─────────────────────────────────────┘  │  0xc865...b4798                     │
                                         └─────────────────────────────────────┘

ENTRY FEE SPLIT (100 FROTH)
┌────────────────────────────────────────────────────────────────────────────┐
│  User pays 100 FROTH                                                        │
│  ├─ 33 FROTH → Treasury (0x0000...24Fc) [converts to FVIX]                 │
│  ├─ 34 FROTH → Creator Prize Pool (held in tournament contract)            │
│  └─ 33 FROTH → Voter Prize Pool (held in tournament contract)              │
└────────────────────────────────────────────────────────────────────────────┘

DAILY TOURNAMENT LIFECYCLE
┌────────────────────────────────────────────────────────────────────────────┐
│  00:00 UTC - Day Starts                                                     │
│  ├─ Users enter tournament (100 FROTH)                                     │
│  ├─ Users mint comics (up to 5 per entry)                                  │
│  └─ Prize pools accumulate                                                 │
│                                                                             │
│  24:00 UTC - Submissions Close                                              │
│  ├─ Voting opens (BUFFAFLOW)                                               │
│  └─ 5 minute grace period                                                  │
│                                                                             │
│  24:05 UTC - Voting Closes                                                  │
│  ├─ Tournament finalized (manual trigger)                                  │
│  ├─ Winner determined (most votes)                                         │
│  └─ Rewards become claimable                                               │
│                                                                             │
│  Forever - Claim Period                                                     │
│  ├─ Winner claims creator pool                                             │
│  └─ Voters claim proportional voter pool                                   │
└────────────────────────────────────────────────────────────────────────────┘

VOTING ECONOMICS
┌────────────────────────────────────────────────────────────────────────────┐
│  • Vote with BUFFAFLOW tokens                                               │
│  • All BUFFAFLOW goes to treasury                                           │
│  • - Voters who voted for THE WINNING COMIC share voter pool proportionally              │
│  • Winner is comic with most total votes                                    │
└────────────────────────────────────────────────────────────────────────────┘
```

TIE-BREAKING LOGIC
┌────────────────────────────────────────────────────────────────────────────┐
│  If multiple comics have the same highest vote count:                       │
│                                                                             │
│  1. LAST VOTE timestamp wins                                                │
│     └─> Comic that received its final vote most recently wins              │
│                                                                             │
│  2. If final votes in SAME BLOCK:                                           │
│     └─> LOWEST creator Profile ID wins                                     │
│                                                                             │
│  Prize Distribution:                                                        │
│  ├─ Creator Pool: Goes entirely to the single winner                       │
│  └─ Voter Pool: Shared only among voters who voted for the winner          │
│                                                                             │
│  Example: Comics by Profile #5 and #8 both have 100 votes                  │
│  • If Profile #8's comic got its last vote at 23:59:55                      │
│  • And Profile #5's comic got its last vote at 23:59:50                     │
│  • Then Profile #8's comic WINS (more recent last vote)                     │
│                                                                             │
│  • If both got their last vote in the same block → Profile #5 wins         │
└────────────────────────────────────────────────────────────────────────────┘


