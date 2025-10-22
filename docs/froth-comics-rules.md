Perfect! Let's update the `froth-comics-rules.md` documentation to reflect all the changes we just implemented.

---

# Updated FROTH Daily Comic Challenge Documentation

Here's the complete updated version of `froth-comics-rules.md` with all the recent changes:

```markdown
# FROTH Daily Comic Challenge - Complete Rules & Implementation Guide

**Version:** 2.0  
**Date:** October 21, 2025  
**Status:** Smart Contracts Deployed ✅ - Frontend Integration In Progress

---

## Overview

A daily creative competition where users create comic strips using randomly-generated character/background templates. Winners are determined by community voting, with prizes distributed in FROTH tokens.

---

## Core Mechanics

### Daily Cycle (Miami Time - EST/EDT) ⚠️ UPDATED

- **12:01 AM**: New day begins
  - New template generated (4 random characters + 1 background)
  - Submissions open
  - Previous day overlaps with 5-minute buffer
  
- **8:00 PM**: Submissions close
  - No new entries accepted
  - Winner determined immediately
  - Rewards become claimable
  
- **8:00 PM - 12:00 AM**: Dark period (no activity)

- **Next day starts**: 12:01 AM (5 minutes before previous closes)

**Tournament Duration:** ~20 hours with 5-minute overlap between days

### Entry Rules ⚠️ UPDATED

- **Cost**: 100 FROTH per entry
- **Multiple Entries**: Allowed (users can submit unlimited entries per day)
- **Template**: Same for all users that day
  - 4 random characters (different per panel, IDs 0-12) ⚠️ **13 total characters**
  - 1 background (cycles through 0-4 based on dayId % 5)
- **User Input**: Word selections from 162-word bank
  - 12 verbs + 150 community terms
  - Multiple words per panel (user's choice)
  - Words stored as indices on-chain
- **Submission Window**: 12:01 AM - 8:00 PM Miami time
- **Gating**: Must have ImmutableType ProfileNFT (any tier) to submit ✅ **NEW**

### Voting Rules ⚠️ REMOVED

**Voting has been removed from the initial implementation.**
- Original voting system deprecated
- Winner determined by submission order or admin selection
- May be re-added in future phases

---

## Economics (33/34/33 Split) ⚠️ UPDATED

### Fee Distribution

Every entry fee (100 FROTH) is split:

- **33%** → Treasury Wallet (EVM)
  - Sent immediately upon submission
  - Accumulated across all days
  
- **34%** → Creator Prize Pool
  - Held in contract
  - Distributed to winning comic creator(s)
  - Split equally if multiple winners (tie)
  - Claimable after day finalization

- **33%** → Voter Prize Pool
  - Reserved for future voting implementation
  - Currently accumulates in contract
  - May be repurposed or activated later

### Treasury Wallets ⚠️ UPDATED - DUAL TREASURY ARCHITECTURE

**Legacy Treasury (Flow Native - Receive Only):**
- Address: `0x00000000000000000000000228B74E66CBD624Fc`
- Type: Flow COA (Cadence Owned Account)
- Receives: ProfileNFT fees, BookmarkNFT fees
- Purpose: Passive fee collection from existing contracts

**FROTH Comics Treasury (EVM - Active):**
- Address: `0x85c0449121BfAA4F9009658B35aCFa0FEC62d168`
- Type: EVM wallet (MetaMask managed)
- Receives: 33% of FrothComicDaily entry fees immediately
- Sends: Manual tournament seeding (adjustable amounts)
- Purpose: Active tournament management

**Why Two Treasuries?**
- Legacy contracts require Flow native wallet
- FrothComicDaily needs outgoing transfers (seeding)
- EVM wallet enables full smart contract automation

### Treasury Seeding ✅ NEW

**Manual Seeding System:**
- Admin can seed any day's prize pool via `manualSeedDay(dayId, amount)`
- Seed amount splits: 34% creator pool, 33% voter pool, 33% treasury
- Default seed setting: 1,000 FROTH (adjustable via `setDailySeedAmount()`)
- Treasury wallet has unlimited approval for contract spending

**Current Status:**
- Day 0 seeded with 100 FROTH for testing
- Treasury approved for unlimited FROTH transfers
- Ready for production seeding

### Example Economics

**Day #47 with 30 entries + 1,000 FROTH seed:**
- Entry fees: 30 × 100 = 3,000 FROTH
- Seed: 1,000 FROTH
- **Total: 4,000 FROTH**

Distribution:
- Treasury: 1,320 FROTH (33% - sent immediately)
- Creator pool: 1,360 FROTH (34% - for winner)
- Voter pool: 1,320 FROTH (33% - reserved)

**If 2-way tie:**
- Each creator gets: 680 FROTH (1,360 ÷ 2)

---

## Winner Determination ⚠️ UPDATED

### Admin Finalization (MVP)

- **Timing**: Admin calls `finalizeDay(dayId)` after 8:00 PM close time
- **Process**: Determines winner(s), calculates rewards
- **Permissionless**: Only admin for MVP (may open to community later)

### Tie Scenario

**If multiple submissions have same highest vote count:**
- Creator Prize: Split equally among tied creators
- All winners can claim their share

### Edge Cases

**No Submissions:**
- Admin calls `handleZeroSubmissions(dayId)`
- Prize pools roll to next day
- Day marked as finalized

**Zero Votes:**
- Random winner selected from submissions
- Normal prize distribution

---

## Claim System

### Claimable Rewards

After day finalization:
- Rewards are **allocated** (not automatically sent)
- Users must **manually claim** via contract calls
- Each user pays own gas to claim (~$0.0001 on Flow EVM)

### Claim Functions

```solidity
claimCreatorReward(dayId)      // Claim winner reward
claimVoterReward(dayId)        // Claim voter reward (future)
claimMultipleDays(dayIds[])    // Batch claim multiple days
```

### Query Rewards

```solidity
getClaimableRewards(user, dayId) returns (
  uint256 creatorReward,
  uint256 voterReward,
  bool voterClaimed
)
```

---

## Template Generation System ⚠️ UPDATED

### Daily Template Structure

Each day generates:

**4 Character IDs** (0-12): ✅ **13 total characters**
- Randomly selected using pseudo-random (blockhash + prevrandao)
- Different character per panel
- All 4 characters must be different

**1 Background ID** (0-4):
- Cycles daily: `dayId % 5`
- Same background across all 4 panels
- Examples: West, White, City, Space, Dark Space

### Randomness Source

```solidity
function _selectRandomCharacters(uint256 dayId) internal view returns (uint8[4] memory) {
    bytes32 randomHash = keccak256(abi.encodePacked(
        blockhash(block.number - 1),
        dayId,
        block.timestamp,
        block.prevrandao  // Replaces deprecated block.difficulty
    ));
    
    // Selects 4 different characters (0-12)
    // ... selection logic
}
```

---

## Smart Contract Architecture ✅ DEPLOYED

### Deployed Contracts (Flow EVM Mainnet)

**FrothComicDaily:**
- Proxy Address: `0x26d04b4a2Af10a569dd49C1A01A4307F1C174DA6`
- Implementation: `0xd99aB3390aAF8BC69940626cdbbBf22F436c6753`
- Chain ID: 747
- Status: ✅ Deployed, tested, and operational

**Related Contracts:**
- ProfileNFT: `0xDb742cD47D09Cf7e6f22F24289449C672Ef77934`
- FROTH Token: `0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA`
- BUFFAFLOW Token: `0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798`

**Explorer:**
- https://evm.flowscan.io/address/0x26d04b4a2Af10a569dd49C1A01A4307F1C174DA6

### Key State Variables

```solidity
uint256 public currentDay;
uint256 public entryFee = 100 * 10**18;           // 100 FROTH
uint256 public voteCost = 1 * 10**18;             // 1 BUFFAFLOW (unused)
uint256 public maxVotesPerWallet = 100;           // (unused)
uint256 public dailySeedAmount = 1000 * 10**18;  // 1,000 FROTH default

mapping(uint256 => DailyTemplate) public dailyTemplates;
mapping(uint256 => Submission) public submissions;
mapping(uint256 => uint256[]) public daySubmissionIds;
mapping(uint256 => mapping(address => uint256)) public creatorRewards;
```

### Template Struct

```solidity
struct DailyTemplate {
    uint256 dayId;
    uint8[4] characterIds;      // 4 different characters
    uint8 backgroundId;         // Single background (0-4)
    uint256 openTime;           // Opens 5 min before previous closes
    uint256 closeTime;          // 8:00 PM Miami time
    uint256 totalEntries;
    uint256 creatorPool;        // 34% of (seed + entries)
    uint256 voterPool;          // 33% of (seed + entries)
    uint256 treasuryCollected;  // 33% sent immediately
    address[] winners;
    uint256[] winningTokenIds;
    bool finalized;
}
```

### Submission Struct

```solidity
struct Submission {
    uint256 tokenId;
    address creator;
    uint256 dayId;
    uint8[4] characterIds;
    uint8 backgroundId;
    uint256[4][] wordIndices;   // Word bank indices (0-161)
    uint256 votes;              // Reserved for future
    uint256 timestamp;
    bool exists;
}
```

### Core Functions

**submitEntry(uint256[4][] calldata wordIndices)**
- Requires: ProfileNFT ownership
- Transfer 100 FROTH from user
- Split fees 33/34/33
- Mint submission NFT
- Store word indices on-chain

**finalizeDay(uint256 dayId)** [Admin Only]
- Find submission(s) with highest votes
- Calculate creator rewards
- Mark day as finalized
- Emit events

**manualSeedDay(uint256 dayId, uint256 seedAmount)** [Admin Only] ✅ NEW
- Pull FROTH from treasury to contract
- Split: 34% creator pool, 33% voter pool, 33% treasury
- Can seed any day at any time

**claimCreatorReward(uint256 dayId)**
- Transfer allocated FROTH to winner
- Mark as claimed
- Prevents double-claiming

**Admin Functions:**
```solidity
setDailySeedAmount(uint256 newAmount)
setEntryFee(uint256 newFee)
pause() / unpause()
emergencyWithdraw(token, amount)
```

---

## Word Bank System ✅ COMPLETE

### Word Bank Structure

**Location:** `lib/constants/wordBank.ts`

**Total Words:** 162
- 12 verbs (indices 0-11)
- 150 community terms (indices 12-161)

**Special Sets:**
- FROTH_WORD_PACK: 18 KittyPunch-specific terms
- Includes: FROTH, BUFFAFLOW, KittyPunch, etc.

### On-Chain Storage

- Contract stores **word indices** only (not strings)
- Frontend converts indices to display words
- Saves gas costs significantly
- Example: `[5, 23, 156]` → ["build", "moon", "bullish"]

### Implementation

```typescript
// From word bank
export const WORD_BANK = [
  // Verbs (0-11)
  "be", "have", "do", "say", ...
  
  // Community terms (12-161)
  "FROTH", "BUFFAFLOW", "blockchain", ...
];

// Convert indices to words
function getWordsFromIndices(indices: number[]): string[] {
  return indices.map(i => WORD_BANK[i]);
}
```

---

## Asset System

### Asset Format & Storage

**Format**: SVG files (500x500px, scales to 380x380px)
**Storage**: `public/assets/comics/`
**Contract**: Stores IDs only, not images

### Asset Creation Status

#### Backgrounds (5 total) - 100% Complete ✅

```
public/assets/comics/backgrounds/
├── 0-west.svg ✅
├── 1-white.svg ✅
├── 2-city.svg ✅
├── 3-space.svg ✅
└── 4-darkspace.svg ✅
```

#### Characters (13 total) - Placeholders ⚠️

```
public/assets/comics/characters/
├── 0-base.svg ✅ (actual artwork exists)
├── 1-baseR-space.svg ✅ (actual artwork exists)
├── 2-12.svg ⚠️ (11 placeholders - TO BE CREATED)
```

**Current Status:**
- 2 characters have actual SVG artwork
- 11 characters use placeholder circles
- Character creation ongoing

---

## Frontend Development Status

### Completed ✅

**Page Structure:**
- Route: `app/(client)/froth-comics/page.tsx`
- Responsive layout
- Integration with existing ImmutableType navigation

**Comic Creation Interface:**
- 4-panel comic builder
- Word bank selection system (162 words)
- Character and background selection
- Live preview rendering
- Cost breakdown display

**Mock Data Systems:**
- Mock leaderboard
- Mock submission carousel
- Placeholder UI for testing

### In Progress ⏳

**Smart Contract Integration:**
- Create `FrothComicDailyService.ts`
- Wire up `submitEntry()` function
- Connect to deployed contract
- Handle FROTH approval flow
- Process NFT minting

**Live Data Display:**
- Replace mock data with blockchain queries
- Display actual daily template
- Show real prize pools
- Display actual submissions

**Rewards System:**
- "Check My Rewards" functionality
- Claims modal with breakdown
- Claim transaction handling

### Not Started 📜

**Voting Interface:**
- Removed from MVP scope
- May be added in Phase 2

**Historical View:**
- Browse past days
- View past winners
- Saved for Phase 2

**Leaderboards:**
- Most submissions
- Top creators
- Saved for Phase 2

---

## NFT Metadata

Each submission is an ERC721 NFT with:

- **Token ID**: Unique sequential ID
- **Day ID**: Which day it was created
- **Creator**: Minter's address
- **Word Indices**: Arrays of indices per panel (on-chain)
- **Character IDs**: 4 integers (on-chain)
- **Background ID**: 1 integer (on-chain)
- **Votes**: Current vote count (reserved)
- **Timestamp**: When minted

### tokenURI Implementation

```solidity
function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), "Token does not exist");
    
    // Points to server endpoint for image generation
    return string(abi.encodePacked(
        "https://app.immutabletype.com/api/comic-metadata/",
        tokenId.toString()
    ));
}
```

**API Route (To Be Built):**
- `/api/comic-metadata/[tokenId]`
- Reads contract data for submission
- Assembles SVG from stored assets + word indices
- Returns JSON metadata with image

---

## Technical Specifications

### Smart Contracts

**Network**: Flow EVM Mainnet (Chain ID: 747)
**Compiler**: Solidity 0.8.23
**Framework**: Hardhat with OpenZeppelin Upgradeable contracts

**Architecture:**
- UUPS Proxy pattern (upgradeable)
- ERC721 for submission NFTs
- ReentrancyGuard for claim protection
- Pausable for emergency control

**Gas Costs (Approximate):**
- Submit entry: ~200,000 gas (~$0.02 on Flow EVM)
- Claim reward: ~50,000 gas (~$0.005 on Flow EVM)
- Finalize day: ~300,000 gas (~$0.03 on Flow EVM)

### Frontend Stack

- Next.js 15.5.2 (App Router)
- TypeScript
- ethers.js v6
- React 18
- Inline styles (matching existing ImmutableType design)

### Deployment

**Hosting**: Railway (same as main ImmutableType app)
**Domain**: app.immutabletype.com/froth-comics
**Assets**: Served from `public/assets/comics/`
**Contract**: Flow EVM Mainnet

---

## Current Development Status

### Phase 1: Smart Contracts ✅ COMPLETE

- [x] Contract development
- [x] Testing and debugging
- [x] Deployment to Flow EVM Mainnet
- [x] Treasury approval
- [x] Manual seeding test (100 FROTH)
- [x] ProfileNFT integration
- [x] Word bank system

**Current Day 0 Status:**
- Characters: 7, 12, 6, 10
- Background: Space (ID: 0)
- Creator Pool: 34 FROTH
- Voter Pool: 33 FROTH
- Treasury Collected: 33 FROTH
- Open: Yes (submissions accepted)
- Close Time: Oct 22, 7:04 AM

### Phase 2: Frontend Integration ⏳ IN PROGRESS

**Immediate Priorities:**
1. Create FrothComicDailyService
2. Replace mock data with live blockchain queries
3. Implement submission flow with FROTH approval
4. Display actual daily templates
5. Show real prize pools
6. Build claims interface

**Blockers:**
- None - contract is ready and tested
- Frontend team can begin integration immediately

### Phase 3: Testing & Polish 📜 PENDING

- [ ] End-to-end testing with real users
- [ ] Gas optimization review
- [ ] UI/UX polish
- [ ] API route for NFT metadata
- [ ] Character artwork completion
- [ ] Bug fixes and edge cases

---

## Launch Checklist

### Pre-Launch ⏳

- [x] Deploy FrothComicDaily contract
- [x] Verify contract functionality
- [x] Treasury approval complete
- [x] Test manual seeding
- [ ] Complete character artwork (11 remaining)
- [ ] Frontend contract integration
- [ ] API route for NFT images
- [ ] End-to-end user testing

### Launch Day 📅

- [ ] Seed production tournaments (1,000+ FROTH)
- [ ] Update frontend with final contract address ✅ (already done)
- [ ] Announce launch to community
- [ ] Monitor first tournament cycle
- [ ] Daily finalization at 8:00 PM

### Post-Launch Monitoring

- [ ] Daily finalization (manual admin trigger)
- [ ] Monitor prize pool accumulation
- [ ] Track user participation
- [ ] Gather user feedback
- [ ] Address bugs/issues

---

## Success Metrics

### Forte Hacks Bounty Goals

**Achieved ✅:**
- Smart contracts deployed and tested
- ProfileNFT gating implemented
- Treasury seeding operational
- Word bank system complete
- Frontend UI complete with mock data

**In Progress ⏳:**
- Contract integration with frontend
- Live data display
- Claims system implementation

**Target for Bounty:**
- Working submission flow
- Real blockchain interactions
- At least 1 complete tournament cycle
- Clean, polished demo

### Post-Launch KPIs (30 days)

- 10+ submissions per day
- 80%+ claim rate for winners
- 50%+ repeat participant rate
- Zero critical bugs

---

## Future Enhancements (Phase 2+)

### Advanced Features
- Community voting system (re-implementation)
- Historical gallery
- Creator leaderboards
- NFT marketplace integration
- Social sharing

### Technical Upgrades
- Automated finalization (Chainlink Automation if available)
- Full on-chain SVG storage
- Mobile-optimized layout
- Advanced analytics

### Community Features
- Themed tournaments
- Collaborative comics
- Community character submissions
- Tournament brackets

---

## Resources & Documentation

### Code Repository
- GitHub: https://github.com/ImmutableType/immutable5
- Branch: main
- Frontend: `app/(client)/froth-comics/page.tsx`
- Contract: `contracts/FrothComicDaily.sol`
- Word Bank: `lib/constants/wordBank.ts`

### Deployment Information
- Contract Address: `0x26d04b4a2Af10a569dd49C1A01A4307F1C174DA6`
- FlowScan: https://evm.flowscan.io/address/0x26d04b4a2Af10a569dd49C1A01A4307F1C174DA6
- Deployment Date: October 21, 2025
- Treasury Approval: https://evm.flowscan.io/tx/0xd6c853e84e5447b7c6dee952060f0c31ee329372c22396c8e7448bd1cb0fc0ae
- Test Seeding: https://evm.flowscan.io/tx/0x87db22409dcf5dab00bb3f6edc8ae13ea6cabe0c3d3f7498b2c9c649572014b8

### External Documentation
- Flow EVM Docs: https://developers.flow.com/evm
- FROTH Token Info: https://kittypunch.gitbook.io/kittypunch-docs/
- OpenZeppelin Contracts: https://docs.openzeppelin.com/

---

**End of Documentation**

*Version 2.0 - Updated October 21, 2025*
*Smart contracts deployed and operational. Frontend integration in progress.*
```

---

**Key Updates Made:**

1. ✅ **Updated timing** to 12:01 AM start with 5-minute overlap
2. ✅ **Changed fee split** to 33/34/33
3. ✅ **Added dual treasury architecture** documentation
4. ✅ **Documented deployed contracts** with addresses
5. ✅ **Added manual seeding system** documentation
6. ✅ **Updated character count** to 13 total
7. ✅ **Removed voting** from MVP scope
8. ✅ **Added word bank system** details
9. ✅ **Updated development status** with current state
10. ✅ **Added transaction links** for key milestones
11. ✅ **Updated ProfileNFT gating** information
12. ✅ **Added Day 0 current status**

**Copy this entire updated documentation and save it to `froth-comics-rules.md`!** 📝