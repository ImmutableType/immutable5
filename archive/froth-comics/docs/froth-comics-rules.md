# FROTH Daily Comic Tournament - Complete Documentation

**Version:** 3.0 (POC)  
**Last Updated:** October 24, 2025  
**Status:** ✅ Live in Production - Day 1 Active  
**Environment:** Proof of Concept for Forte Hacks Bounty

---

## 🎯 Overview

### What Is This?

A daily creative competition where users create 4-panel comic strips using:
- Randomly-generated character templates (13 characters available)
- Cycling background templates (5 backgrounds available)
- A curated word bank (162 words from FROTH ecosystem)

Winners determined by community voting, with prizes distributed in FROTH tokens.

### POC vs Commercial Fork

**This is a Proof of Concept build** with known limitations and bugs (documented below). The architecture is designed to be forked and properly rebuilt for commercial deployment with fixes for:
- Tournament timing consistency
- Proper genesis timestamp
- Enhanced reward claiming history
- Voting system activation

---

## ⚠️ Known Issues & Limitations (POC v1)

### 🚨 Critical Bug: Rotating Tournament Schedule

**Problem:** Genesis timestamp is ~6 hours too early, causing tournament close times to rotate backward through the day.

**Current Behavior:**
- Day 0: Closes at 6:49 PM Miami time
- Day 1: Closes at 2:54 PM Miami time
- Day 2: Closes at 10:59 AM Miami time  
- Day 3: Closes at 7:04 AM Miami time
- Day 4: Closes at 3:09 AM Miami time
- Pattern repeats every ~5 days

**Intended Behavior:** All tournaments should close at 8:00 PM Miami time daily

**Root Cause:** 
```
Genesis timestamp: 1761187495 (Oct 22, 2025 10:44:55 PM Miami)
Correct genesis should be: 1761205800 (Oct 23, 2025 3:50:00 AM Miami)
Difference: -18,305 seconds (6 hours too early)
```

**Fix for Commercial Fork:**
- Redeploy contract with correct genesis timestamp
- Calculate genesis as: "Target close time (8 PM Miami)" - 20h5min
- Ensure genesis accounts for EDT/EST timezone shifts

### Design Limitations

**Unclaimed Voter Pools:**
- If no one votes on a day, voter pool is locked in contract forever
- Example: Day 0 has 33 FROTH stuck (no voters participated)
- No admin recovery mechanism implemented yet
- Low priority - rare once voting is enabled (creators will vote for themselves)

**NFT Metadata API Missing:**
- Token URIs point to `/api/comic-metadata/[tokenId]` but endpoint doesn't exist yet
- NFTs won't display on marketplaces until API route is built
- **Priority 1 for next development phase**

**Voting UI Disabled:**
- Contract fully supports voting (tested and working)
- Frontend UI has voting controls commented out/hidden
- Intentionally disabled for POC testing phase
- **Priority 3 for activation**

**Rewards History:**
- Rewards modal only shows current claimable amounts
- Doesn't display historical claims with timestamps
- Users can't see when they previously claimed rewards
- **Priority 2 for UX improvement**

---

## 🎮 Core Mechanics (AS IMPLEMENTED)

### Daily Cycle

**Tournament Duration:** 20 hours 5 minutes per day

**Overlap System:**
- Each new day opens 5 minutes before previous day closes
- Prevents "dark periods" where no tournament is active
- Creates continuous play availability 24/7

**Schedule Example (POC behavior):**
```
Day 0: Opens Wed 10:39 PM → Closes Thu 6:49 PM (20h 5min)
Day 1: Opens Thu 6:44 PM → Closes Fri 2:54 PM (5 min overlap, then 20h 5min)
Day 2: Opens Fri 2:49 PM → Closes Sat 10:59 AM (5 min overlap, then 20h 5min)
```

**Note:** Close times rotate backward due to genesis bug (see Known Issues)

### Entry Rules

**Submission Requirements:**
- **Cost:** 100 FROTH per entry (ERC-20 token)
- **Gating:** Must own an ImmutableType ProfileNFT (any tier)
- **Multiple Entries:** Unlimited submissions per user per day
- **Template Constraints:** 
  - Must use the daily character template (4 specific characters)
  - Must use the daily background (1 specific background)
  - Can arrange words freely from word bank

**Word Bank System:**
- 162 total words available
- Curated from FROTH/KittyPunch ecosystem terminology
- Words stored on-chain as indices (0-161)
- Multiple words allowed per panel
- Same word can be used multiple times across panels

**Submission Window:**
- Opens: ~5 minutes before previous day closes
- Closes: 20 hours 5 minutes after opening
- See "Daily Cycle" above for rotating close times (POC bug)

### Template Generation

**Daily Template Includes:**

1. **4 Character IDs** (range 0-12)
   - Pseudo-randomly selected using `blockhash + prevrandao + dayId`
   - All 4 characters must be different
   - One character per panel (order matters)

2. **1 Background ID** (range 0-4)
   - Cycles daily: `backgroundId = dayId % 5`
   - Same background used across all 4 panels
   - Predictable rotation: West → White → City → Space → Dark Space

3. **Word Cloud Template** (currently ID 0 only)
   - Fixed word cloud bubble SVG overlay
   - Words rendered as text on top of cloud

**Autonomous Initialization:**
- Templates are generated on-demand, not pre-created
- First submission of the day triggers `_ensureDayInitialized()`
- Frontend calculates expected open/close times even before template exists
- System self-starts with no admin intervention required

### Voting System

**Status:** Implemented in contract, disabled in UI for POC

**When Enabled:**
- Voting opens after submission period closes
- Cost: 1 BUFFAFLOW token per vote
- Max votes per wallet per submission: 10
- Voters share proportional rewards from voter pool

**Current POC Behavior:**
- Voting UI is hidden/disabled
- Voter pools accumulate but no one can vote
- Winner determined manually by admin or submission order

---

## 💰 Economics (33/34/33 Split)

### Fee Distribution

Every 100 FROTH entry fee is split:

- **33%** → Treasury Wallet (EVM)
  - Sent immediately on submission
  - Address: `0x85c0449121BfAA4F9009658B35aCFa0FEC62d168`
  - Used for ecosystem operations

- **34%** → Creator Prize Pool
  - Held in contract until day finalized
  - Distributed to winning comic creator(s)
  - Split equally if multiple winners (tie scenario)
  - Claimable after admin calls `finalizeDay()`

- **33%** → Voter Prize Pool
  - Reserved for community voters
  - Distributed proportionally based on votes cast
  - Currently accumulates (voting disabled in POC)

### Treasury Seeding (Admin Feature)

**Manual Seeding System:**
```solidity
manualSeedDay(uint256 dayId, uint256 amount)
```

- Admin can inject additional FROTH into any day's prize pools
- Seed amount splits following same 33/34/33 ratio
- Default seed setting: 1,000 FROTH (adjustable)
- Treasury wallet has unlimited approval for FROTH transfers

**Current Status:**
- Day 0 was seeded with 100 FROTH for testing
- Treasury approved for unlimited FROTH spending
- Production seeding can be adjusted per tournament needs

### Example Economics

**Day with 30 Entries + 1,000 FROTH Seed:**

```
Entry Fees:  30 × 100 FROTH = 3,000 FROTH
Manual Seed: 1,000 FROTH
Total Pool:  4,000 FROTH

Distribution:
├─ Treasury (33%):    1,320 FROTH → Sent immediately to 0x85c0...
├─ Creator Pool (34%): 1,360 FROTH → Winner(s) can claim
└─ Voter Pool (33%):   1,320 FROTH → Voters can claim

If 2-way tie: Each winner gets 680 FROTH (1,360 ÷ 2)
```

### Historical Example - Day 0

**Tournament Results:**
- Total Entries: 1
- Seed Amount: 100 FROTH
- Winner: `0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2`
- Creator Pool: 34 FROTH (✅ claimed)
- Voter Pool: 33 FROTH (🔒 stuck - no voters)
- Treasury: 33 FROTH (✅ sent immediately)

**Claim Transaction:** 
- Hash: `0xd19ca72ba76a8aeee24fa41efcfb52da926d48d4c63374b521ea0f27c7659d42`
- User successfully claimed 34 FROTH creator reward

---

## 🏆 Winner Determination & Rewards

### Admin Finalization (Current POC)

**Process:**
1. Admin calls `finalizeDay(dayId)` after close time
2. Contract determines winner(s) based on vote counts
3. Rewards are allocated (not automatically sent)
4. Users must manually claim their rewards

**Timing:** 
- Should happen shortly after submission period closes
- Manual process for POC (could be automated with Chainlink in production)

### Tie Scenarios

**Multiple submissions with same highest vote count:**
- Creator prize pool split equally among all tied winners
- Each winner can claim their proportional share
- Example: 3-way tie with 1,000 FROTH pool = 333.33 FROTH each

### Edge Cases

**No Submissions:**
```solidity
handleZeroSubmissions(dayId)
```
- Admin function to handle days with zero entries
- Prize pools roll forward to next day
- Day marked as finalized

**Zero Votes (Current POC State):**
- Without voting enabled, all submissions have 0 votes
- Admin determines winner manually or uses submission order
- Normal prize distribution applies

---

## 🎁 Multi-Day Rewards System

### Architecture (New Feature - Oct 24, 2025)

**Comprehensive Rewards Scanning:**
- User clicks "Check My Rewards" button
- Frontend scans days 0 through (currentDay - 1)
- Filters days where user has claimable amounts
- Displays total claimable for each reward type

**Rewards Modal Display:**
```
Your Rewards

Day 0:
  Creator Reward: 34.00 FROTH  [Claim] or [Already claimed ✓]
  Voter Reward:   0.00 FROTH   (No voting activity)

Day 1:
  Creator Reward: 0.00 FROTH   (Not a winner)
  Voter Reward:   12.50 FROTH  [Claim]
  
Total Claimable: 12.50 FROTH
```

**Claiming Process:**
- Individual claim buttons per day per reward type
- Each claim is a separate transaction (user pays gas)
- Modal auto-refreshes after successful claim
- Shows "Already claimed ✓" for previously claimed rewards

**Smart Contract Functions:**
```solidity
// Query what's claimable
getClaimableRewards(address user, uint256 dayId) 
  returns (uint256 creatorReward, uint256 voterReward, bool voterClaimed)

// Claim functions
claimCreatorReward(uint256 dayId)
claimVoterReward(uint256 dayId)
claimMultipleDays(uint256[] calldata dayIds)  // Batch claiming
```

**Implementation Files:**
- `app/(client)/froth-comics/page.tsx` - Frontend rewards modal
- State management: `allDays[]` array structure
- Service: `FrothComicDailyService.ts`

---

## 🤖 Autonomous Day Initialization System

### How It Works (Key Architectural Feature)

**Problem Solved:** 
- Don't want admin to manually create templates each day
- Need tournaments to self-start without intervention

**Solution:**

**Step 1: Frontend Detection**
```typescript
// Service detects uninitialized day
if (template.opensAt === 0 && template.closesAt === 0) {
  // Day hasn't been initialized yet
  // Calculate expected times from genesis + progression
  const opensAt = genesis + (dayId * TOURNAMENT_DURATION) - OVERLAP;
  const closesAt = genesis + (dayId * TOURNAMENT_DURATION) + TOURNAMENT_DURATION;
}
```

**Step 2: Display as Open**
- Frontend shows day as "open" even if contract template doesn't exist yet
- Users can click "Submit" and see the creation interface
- Time remaining countdown works based on calculated times

**Step 3: First Submission Triggers Initialization**
```solidity
function submitEntry(...) external {
    _ensureDayInitialized(currentDay);  // ← Auto-initializes if needed
    // ... rest of submission logic
}

function _ensureDayInitialized(uint256 dayId) internal {
    if (!dailyTemplates[dayId].exists) {
        // Generate random characters
        // Set background (dayId % 5)
        // Set open/close times
        // Mark as initialized
    }
}
```

**Benefits:**
- ✅ No admin intervention required for new days
- ✅ Seamless user experience (they don't know initialization happened)
- ✅ Gas cost paid by first submitter (not admin)
- ✅ System runs 24/7 autonomously

**Randomness Source:**
```solidity
bytes32 randomHash = keccak256(abi.encodePacked(
    blockhash(block.number - 1),
    dayId,
    block.timestamp,
    block.prevrandao  // Replaces deprecated block.difficulty
));
```

---

## 🎨 Asset Library

### Characters (13 Total)

| ID | Name | File |
|----|------|------|
| 0 | Base | `0-base.svg` |
| 1 | Base R Space | `1-baseR-space.svg` |
| 2 | Base L Space | `2-baseL-space.svg` |
| 3 | RG Saucer | `3-RG-saucer.svg` |
| 4 | Impact | `4-impact.svg` |
| 5 | Mask L | `5-maskL.svg` |
| 6 | Mask R | `6-maskR.svg` |
| 7 | Froth R | `7-frothR.svg` |
| 8 | Froth L | `8-frothL.svg` |
| 9 | Buff R | `9-BuffR.svg` |
| 10 | Buff L | `10-BuffL.svg` |
| 11 | Block | `11-Block.svg` |
| 12 | QWERTY | `12-QWERTY.svg` |

**Location:** `/public/assets/comics/characters/`

### Backgrounds (5 Total)

| ID | Name | File | Rotation |
|----|------|------|----------|
| 0 | West | `0-west.svg` | Days 0, 5, 10, 15... |
| 1 | White | `1-white.svg` | Days 1, 6, 11, 16... |
| 2 | City | `2-city.svg` | Days 2, 7, 12, 17... |
| 3 | Space | `3-space.svg` | Days 3, 8, 13, 18... |
| 4 | Dark Space | `4-darkspace.svg` | Days 4, 9, 14, 19... |

**Location:** `/public/assets/comics/backgrounds/`

### Word Clouds

- **ID 0:** Default word cloud bubble (currently only one design)
- **Location:** `/public/assets/comics/word-clouds/`
- **Note:** May expand to multiple designs in future

---

## 📜 Smart Contract Architecture

### Deployed Contract (Flow EVM Mainnet)

**FrothComicDaily:**
- **Address:** `0x8B576e5177b52e56fcF7f51d132234844CA3ccB6`
- **Chain ID:** 747 (Flow EVM Mainnet)
- **Status:** ✅ Live and Operational (Day 1 active)
- **Deployment Date:** October 23, 2025 (upgraded from Oct 21 contract)

**Explorer:**
- https://evm.flowscan.io/address/0x8B576e5177b52e56fcF7f51d132234844CA3ccB6

**Related Contracts:**
- ProfileNFT: `0xDb742cD47D09Cf7e6f22F24289449C672Ef77934`
- FROTH Token: `0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA`
- BUFFAFLOW Token: `0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798`
- Treasury Wallet: `0x85c0449121BfAA4F9009658B35aCFa0FEC62d168`

### Contract Architecture

**Pattern:** UUPS Upgradeable Proxy
**Inheritance:**
- ERC721 (submission NFTs)
- ReentrancyGuard (claim protection)
- Pausable (emergency control)
- AccessControl (admin functions)

### Key State Variables

```solidity
uint256 public currentDay;                    // Increments automatically
uint256 public genesisTimestamp;              // 1761187495 (6h too early - POC bug)
uint256 public constant TOURNAMENT_DURATION = 72300;  // 20h 5min in seconds
uint256 public constant OVERLAP_BUFFER = 300;         // 5 minutes

uint256 public entryFee = 100 * 10**18;      // 100 FROTH
uint256 public voteCost = 1 * 10**18;        // 1 BUFFAFLOW (for future)
uint256 public maxVotesPerWallet = 10;       // Per submission limit
uint256 public dailySeedAmount = 1000 * 10**18;  // Default 1,000 FROTH

mapping(uint256 => DailyTemplate) public dailyTemplates;
mapping(uint256 => Submission) public submissions;
mapping(uint256 => uint256[]) public daySubmissionIds;
mapping(uint256 => mapping(address => uint256)) public creatorRewards;
mapping(uint256 => mapping(address => uint256)) public voterRewards;
```

### Data Structures

**DailyTemplate:**
```solidity
struct DailyTemplate {
    uint256 dayId;
    uint8[4] characterIds;      // 4 different characters (0-12)
    uint8 backgroundId;         // Single background (0-4)
    uint256 opensAt;            // Unix timestamp
    uint256 closesAt;           // Unix timestamp
    uint256 totalEntries;       // Submission count
    uint256 creatorPool;        // 34% of (seed + entries)
    uint256 voterPool;          // 33% of (seed + entries)
    uint256 treasuryCollected;  // 33% sent immediately
    address[] winners;          // Winner address(es)
    uint256[] winningTokenIds;  // Winning NFT token IDs
    bool finalized;             // Admin has finalized day
    bool exists;                // Template initialized
}
```

**Submission:**
```solidity
struct Submission {
    uint256 tokenId;            // ERC721 token ID
    address creator;            // Minter address
    uint256 dayId;              // Which tournament day
    uint8[4] characterIds;      // Characters used (must match template)
    uint8 backgroundId;         // Background used (must match template)
    uint256[4][] wordIndices;   // Word bank indices per panel (0-161)
    uint256 votes;              // Vote count (reserved for future)
    uint256 timestamp;          // Submission time
    bool exists;                // Submission is valid
}
```

### Core Functions

**User Functions:**
```solidity
// Submit entry (100 FROTH required, ProfileNFT gating)
function submitEntry(uint256[4][] calldata wordIndices) external nonReentrant

// Voting (disabled in UI, but contract supports)
function vote(uint256 tokenId, uint256 amount) external nonReentrant

// Query functions
function getDailyTemplate(uint256 dayId) external view returns (DailyTemplate memory)
function getSubmission(uint256 tokenId) external view returns (Submission memory)
function getDaySubmissions(uint256 dayId) external view returns (uint256[] memory)
function getClaimableRewards(address user, uint256 dayId) external view 
    returns (uint256 creatorReward, uint256 voterReward, bool voterClaimed)

// Claiming
function claimCreatorReward(uint256 dayId) external nonReentrant
function claimVoterReward(uint256 dayId) external nonReentrant
function claimMultipleDays(uint256[] calldata dayIds) external nonReentrant
```

**Admin Functions:**
```solidity
function manualSeedDay(uint256 dayId, uint256 amount) external onlyAdmin
function finalizeDay(uint256 dayId) external onlyAdmin
function handleZeroSubmissions(uint256 dayId) external onlyAdmin
function setDailySeedAmount(uint256 amount) external onlyAdmin
function setGenesisTimestamp(uint256 timestamp) external onlyAdmin  // For fixing timing bug
function pause() external onlyAdmin
function unpause() external onlyAdmin
```

### Gas Costs (Approximate on Flow EVM)

- Submit entry: ~200,000 gas (~$0.02 USD)
- Vote: ~80,000 gas (~$0.008 USD)
- Claim reward: ~50,000 gas (~$0.005 USD)
- Finalize day: ~300,000 gas (~$0.03 USD)

---

## 💻 Frontend Implementation

### Tech Stack

- **Framework:** Next.js 15.5.2 (App Router)
- **Language:** TypeScript
- **Web3 Library:** ethers.js v6
- **Styling:** Inline JSX styles (matches ImmutableType design system)
- **Hosting:** Railway (app.immutabletype.com)

### Service Layer

**FrothComicDailyService** (`lib/services/FrothComicDailyService.ts`)

**Key Methods:**
```typescript
// Initialization
async initialize(signer: ethers.Signer): Promise<void>
async initializeReadOnly(): Promise<void>

// Read functions
async getCurrentDay(): Promise<number>
async getDailyTemplate(dayId: number): Promise<DailyTemplate>
async getDaySubmissionsWithMetadata(dayId: number): Promise<SubmissionMetadata[]>
async getTimeUntilClose(dayId: number): Promise<number>
async getClaimableRewards(address: string, dayId: number): Promise<RewardData>

// Write functions
async submitEntry(wordIndices: number[][]): Promise<string>
async vote(tokenId: string, amount: number): Promise<void>
async claimCreatorReward(dayId: number): Promise<void>
async claimVoterReward(dayId: number): Promise<void>
```

**Contract Data Parsing:**
```typescript
// CRITICAL: Contract struct field order changed after Oct 21 deployment
// OLD ORDER: [creator, wordIndices, votes, timestamp, characterIds, backgroundId]
// NEW ORDER: [tokenId, creator, dayId, characterIds, backgroundId, wordIndices, votes, timestamp, exists]

// Correct parsing (as of Oct 24, 2025):
const submission = await this.readOnlyContract.getSubmission(tokenId);
const parsed = {
  tokenId: submission[0],
  creator: submission[1],
  dayId: submission[2],
  characterIds: submission[3],
  backgroundId: submission[4],
  wordIndices: submission[5],
  votes: Number(submission[6]),
  timestamp: Number(submission[7])
};
```

### UI Components

**Main Page:** `app/(client)/froth-comics/page.tsx`

**Component Hierarchy:**
```
FrothComics (main page)
├─ LoadingSpinner (during data fetch)
├─ Tournament Info Section
│  ├─ Day #, Prize Pool, Time Remaining
│  ├─ Entry Cost Breakdown
│  └─ "Check My Rewards" button
├─ Leaderboard Section
│  ├─ Top 3 submissions with vote counts
│  └─ "View All Submissions" button
├─ Comic Creation Interface
│  ├─ Template Info Display
│  ├─ 4-Panel Tab Selector
│  ├─ Live Comic Preview (SVG)
│  ├─ Word Bank (162 words)
│  └─ Mint Button (100 FROTH)
├─ All Submissions Modal
│  ├─ Full list with vote counts
│  └─ Voting controls (disabled)
└─ Multi-Day Rewards Modal
   ├─ Scan all past days
   ├─ Show claimable per day
   └─ Individual claim buttons
```

**SVG Comic Rendering:**
```typescript
<ComicStrip 
  characterIds={[7, 12, 6, 10]}  // From daily template
  backgroundId={0}                // From daily template
  wordCloudId={0}                 // Fixed for POC
  panelWords={[
    ["Punch", "the", "frothy"],   // Panel 1 words
    ["BUFFAFLOW", "to", "moon"],  // Panel 2 words
    ["Trenches", "always", "win"], // Panel 3 words
    ["PunchSwap", "is", "king"]    // Panel 4 words
  ]}
/>

// Renders 1600x400 SVG with:
// - Background layer (same across all 4 panels)
// - Character layer (different per panel)
// - Word cloud bubble layer
// - Text layer (words centered in bubble)
```

### User Flows

**1. Submit Comic:**
```
1. User connects wallet (MetaMask)
2. System checks ProfileNFT ownership (required)
3. User selects words from word bank (add to panels)
4. Live preview updates as words are added
5. User clicks "Mint Your Comic (100 FROTH)"
6. Approval tx: 100 FROTH to contract
7. Mint tx: Creates ERC721 NFT with word indices
8. Success: Comic added to leaderboard
```

**2. Check Rewards:**
```
1. User clicks "Check My Rewards"
2. Frontend loops through days 0 to currentDay-1
3. Queries getClaimableRewards() for each day
4. Filters days with claimable amounts > 0
5. Modal displays all claimable rewards
6. User clicks [Claim] button for specific day/type
7. Transaction submitted, rewards transferred
8. Modal refreshes to show "Already claimed ✓"
```

**3. Vote (When Enabled):**
```
1. Submission period closes
2. Voting controls appear on leaderboard
3. User clicks "Vote +1" or "Vote +5"
4. Approval tx: BUFFAFLOW to contract
5. Vote tx: Increments submission vote count
6. Leaderboard updates with new vote totals
```

---

## 🗺️ Development Roadmap

### Phase 1: Smart Contracts ✅ COMPLETE

- [x] Contract development and testing
- [x] Deployment to Flow EVM Mainnet
- [x] Treasury approval for FROTH spending
- [x] ProfileNFT gating integration
- [x] Word bank system implementation
- [x] Manual seeding functionality
- [x] Multi-submission support
- [x] Claim system with proper accounting

### Phase 2: Frontend Integration ✅ COMPLETE

- [x] FrothComicDailyService creation
- [x] Live blockchain data integration
- [x] Comic creation interface with word bank
- [x] SVG rendering system (4-panel strips)
- [x] Submission flow with FROTH approval
- [x] Multi-day rewards modal
- [x] Autonomous day initialization (frontend + contract)
- [x] Leaderboard with live data
- [x] Profile ownership verification
- [x] Production deployment to Railway

**Status:** Live at app.immutabletype.com/froth-comics

### Phase 3: Critical Fixes & Polish 🔥 CURRENT PRIORITY

**Priority 0: Fix Tournament Timing (CRITICAL)**
- [ ] Determine if redeployment is acceptable for POC
- [ ] Calculate correct genesis timestamp for 8 PM daily close
- [ ] Deploy new contract OR live with rotating schedule
- [ ] Update documentation based on decision

**Priority 1: NFT Metadata API (HIGH)**
- [ ] Create `/app/api/comic-metadata/[tokenId]/route.ts`
- [ ] Read submission data from contract
- [ ] Generate SVG comic strip dynamically
- [ ] Return ERC721-compliant JSON with image
- [ ] Test on OpenSea/marketplace

**Priority 2: Rewards Modal UX (MEDIUM)**
- [ ] Add claim timestamp tracking
- [ ] Show historical claims instead of hiding
- [ ] Display "Claimed on [date] at [time]"
- [ ] Keep full history visible

**Priority 3: Voting UI Activation (MEDIUM)**
- [ ] Unhide voting controls after close time
- [ ] Display "Voting opens when submissions close" during open period
- [ ] Show remaining votes per submission (max 10)
- [ ] Test full voting flow end-to-end

**Priority 4: Admin Recovery Function (LOW)**
- [ ] Add `recoverUnclaimedVoterPool(dayId)` function
- [ ] Requires contract upgrade (UUPS pattern)
- [ ] Redirect unclaimed pools to treasury or next day
- [ ] Prevents FROTH from being locked forever

### Phase 4: Future Enhancements 📜 POST-POC

**For Commercial Fork:**
- [ ] Fix genesis timestamp for consistent 8 PM close
- [ ] Increase tournament duration to 24h for same-time daily close
- [ ] Automated finalization with Chainlink Automation
- [ ] Full on-chain SVG storage (no API dependency)
- [ ] Mobile-optimized responsive layout
- [ ] Historical tournament gallery
- [ ] Creator leaderboards (most wins, highest earnings)
- [ ] Social sharing (Twitter/Farcaster integration)
- [ ] Themed tournaments (holiday specials, etc.)
- [ ] Community character submissions
- [ ] Tournament brackets (March Madness style)

---

## 📊 Success Metrics

### Forte Hacks Bounty Goals ✅ ACHIEVED

**Technical Achievements:**
- ✅ Smart contracts deployed and tested
- ✅ ProfileNFT gating implemented
- ✅ Treasury seeding operational
- ✅ Word bank system complete
- ✅ Frontend fully functional with live data
- ✅ Working submission flow
- ✅ Real blockchain interactions
- ✅ At least 1 complete tournament cycle (Day 0 finished, Day 1 active)
- ✅ Rewards claiming system functional (34 FROTH claimed from Day 0)

**Current Status:**
- Day 1 is live with ~58 minutes remaining (as of last check)
- System running autonomously with no manual intervention
- Ready for demo and user testing

### Post-Launch KPIs (30 Days)

**Target Metrics:**
- 10+ submissions per day
- 80%+ claim rate for winners
- 50%+ repeat participant rate
- Zero critical bugs
- <5% failed transactions

**Monitoring:**
- Daily finalization execution
- Prize pool accumulation trends
- User participation rates
- Gas cost averages
- User feedback collection

---

## 🔗 Resources & Links

### Deployment Information

**Live Application:**
- URL: https://app.immutabletype.com/froth-comics
- Status: ✅ Operational (Day 1 active)

**Smart Contracts:**
- FrothComicDaily: `0x8B576e5177b52e56fcF7f51d132234844CA3ccB6`
- FlowScan: https://evm.flowscan.io/address/0x8B576e5177b52e56fcF7f51d132234844CA3ccB6
- ProfileNFT: `0xDb742cD47D09Cf7e6f22F24289449C672Ef77934`
- FROTH Token: `0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA`
- BUFFAFLOW Token: `0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798`

**Example Transactions:**
- Day 0 Reward Claim: `0xd19ca72ba76a8aeee24fa41efcfb52da926d48d4c63374b521ea0f27c7659d42`
- User claimed 34 FROTH successfully

### Code Repository

- GitHub: https://github.com/ImmutableType/immutable5
- Branch: main
- Frontend: `app/(client)/froth-comics/page.tsx`
- Service: `lib/services/FrothComicDailyService.ts`
- Word Bank: `lib/constants/wordBank.ts`
- Contract: `contracts/FrothComicDaily.sol` (presumed location)

### External Documentation

- Flow EVM Docs: https://developers.flow.com/evm
- FROTH Token Info: https://kittypunch.gitbook.io/kittypunch-docs/
- OpenZeppelin Contracts: https://docs.openzeppelin.com/
- ERC721 Standard: https://eips.ethereum.org/EIPS/eip-721

### Network Information

**Flow EVM Mainnet:**
- Chain ID: 747
- RPC: https://mainnet.evm.nodes.onflow.org
- Explorer: https://evm.flowscan.io
- Gas Token: FLOW
- Block Time: ~1-2 seconds
- Gas Costs: Very low (~$0.01-0.02 per transaction)

---

## 📝 Technical Reference

### Word Bank System

**Total Words:** 162
- 12 action verbs (punch, swap, mint, etc.)
- 150 community terms from FROTH/KittyPunch ecosystem

**Categories:**
- Core Actions: punch, swap, mint, claim, stake, vote, burn, froth
- Platform Terms: PunchSwap, BUFFAFLOW, FVIX, Trenches, Vaults, Liquidity
- Community Slang: Moon, Diamond Hands, WAGMI, NGMI, etc.

**Storage:** `/lib/constants/wordBank.ts`
```typescript
export const DAILY_WORDS = [
  "Punch", "Swap", "Mint", ... // 162 total
];
```

**Usage:**
- Words stored as indices (0-161) on-chain
- Reduces gas costs (uint8 vs string storage)
- Frontend maps indices back to words for display

### Economic Calculations

**Entry Fee Breakdown:**
```
100 FROTH entry = {
  treasury: 33 FROTH (sent immediately),
  creatorPool: 34 FROTH (held in contract),
  voterPool: 33 FROTH (held in contract)
}
```

**Manual Seed Distribution:**
```
1000 FROTH seed = {
  treasury: 330 FROTH,
  creatorPool: 340 FROTH,
  voterPool: 330 FROTH
}
```

**Winner Calculation:**
```solidity
// Single winner
winnerReward = creatorPool

// Multiple winners (tie)
winnerReward = creatorPool / numberOfWinners

// Voter rewards (proportional)
voterReward = (voterPool * userVotes) / totalVotes
```

### SVG Rendering System

**Component Hierarchy:**
```
ComicStrip (1600x400 px)
├─ Panel 1 (380x380) at x=10
├─ Panel 2 (380x380) at x=410  
├─ Panel 3 (380x380) at x=810
└─ Panel 4 (380x380) at x=1210

Each Panel:
├─ Background SVG (full panel)
├─ Character SVG (positioned at y=140)
├─ Word Cloud SVG (positioned at y=30)
└─ Text (3 lines, centered in word cloud)
```

**Text Wrapping Logic:**
```typescript
// Max chars per line: [22, 25, 23]
const wrapText = (text: string): string[] => {
  // Intelligently breaks at word boundaries
  // Returns 3 lines maximum
  // Handles overflow gracefully
}
```

**Asset Paths:**
```
/public/assets/comics/
├─ characters/
│  ├─ 0-base.svg
│  ├─ 1-baseR-space.svg
│  └─ ... (13 total)
├─ backgrounds/
│  ├─ 0-west.svg
│  ├─ 1-white.svg
│  └─ ... (5 total)
└─ word-clouds/
   └─ 0-wordcloud.svg
```

---

## 🎓 Lessons Learned (For Commercial Fork)

### What Worked Well ✅

1. **Autonomous Initialization**
   - Self-starting tournaments with no admin intervention
   - Gas cost distributed to users (not admin)
   - Seamless UX (users don't notice initialization)

2. **Multi-Day Rewards System**
   - Users can check all past days at once
   - Clear breakdown per day per reward type
   - Prevents users from missing unclaimed rewards

3. **BUFFAFLOW Integration**
   - Successfully used for voting (contract ready)
   - Token gating works smoothly
   - ERC404 token provides dual utility

4. **ProfileNFT Gating**
   - Prevents bot spam
   - Creates barrier to entry (quality over quantity)
   - Ties tournament to broader ImmutableType ecosystem

5. **Low Gas Costs**
   - Flow EVM makes transactions affordable (~$0.02)
   - Users can participate frequently without worry
   - Claiming rewards is essentially free

### What Needs Fixing 🔧

1. **Tournament Timing**
   - **Problem:** Genesis timestamp 6 hours too early
   - **Impact:** Close times rotate backward daily
   - **Fix:** Redeploy with calculated genesis for fixed 8 PM close
   - **Calculation:** `genesisTimestamp = targetCloseTime - TOURNAMENT_DURATION`

2. **Duration vs Daily Alignment**
   - **Problem:** 20h 5min duration doesn't align with 24h day
   - **Impact:** Creates rotating schedule even with correct genesis
   - **Fix:** Either 24h duration OR adjust genesis daily (not scalable)
   - **Recommendation:** 24h duration with 5min overlap = 24h 5min total

3. **Unclaimed Reward Handling**
   - **Problem:** Voter pools can be locked forever if no one votes
   - **Impact:** FROTH stuck in contract (33 FROTH from Day 0)
   - **Fix:** Admin recovery function after 30+ days
   - **Alternative:** Roll unclaimed pools into next day automatically

4. **NFT Metadata Missing**
   - **Problem:** tokenURI points to non-existent API endpoint
   - **Impact:** NFTs don't display on marketplaces
   - **Fix:** Build `/api/comic-metadata/[tokenId]/route.ts`
   - **Priority:** High - affects marketplace integration

5. **Rewards History**
   - **Problem:** Modal hides claimed days
   - **Impact:** Users can't see their claim history
   - **Fix:** Show all days with "Claimed on [date]" status
   - **Enhancement:** Add total lifetime earnings stat

6. **Voting UI Disabled**
   - **Problem:** Contract supports voting but UI doesn't expose it
   - **Impact:** Voter pools accumulate but can't be earned
   - **Fix:** Unhide voting controls after submission period
   - **Testing:** Full end-to-end voting flow needed

### Architecture Improvements for V2

1. **Finalization Automation**
   - Use Chainlink Automation to trigger `finalizeDay()` automatically
   - Removes admin dependency
   - Ensures timely reward distribution

2. **On-Chain SVG Storage**
   - Store SVG data in contract (expensive but permanent)
   - Eliminates API dependency
   - Makes NFTs truly decentralized

3. **Dynamic Word Banks**
   - Allow admin to rotate word banks per day/week
   - Community submissions for new words
   - Themed word sets (holidays, events)

4. **Enhanced Randomness**
   - Use Chainlink VRF for provably fair character selection
   - Prevents admin manipulation
   - Adds credibility to randomness

5. **Mobile Responsiveness**
   - Current UI is desktop-focused
   - Need mobile-optimized SVG scaling
   - Touch-friendly word selection interface

---

## 🚀 Quick Start Guide (For New Developers)

### Prerequisites

- Node.js 18+
- MetaMask wallet with Flow EVM configured
- FLOW tokens for gas
- FROTH tokens for entries (100 FROTH per submission)
- ImmutableType ProfileNFT (any tier)

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/ImmutableType/immutable5
cd immutable5

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Add contract addresses and RPC URL

# Run development server
npm run dev
```

### Key Files to Understand

1. **Frontend:** `app/(client)/froth-comics/page.tsx`
   - Main UI component
   - Handles all user interactions
   - ~1410 lines of TypeScript + JSX

2. **Service:** `lib/services/FrothComicDailyService.ts`
   - Blockchain interaction layer
   - Contract read/write functions
   - Data parsing and formatting

3. **Types:** `lib/types/frothComic.ts`
   - TypeScript interfaces
   - DailyTemplate, Submission, SubmissionMetadata

4. **Word Bank:** `lib/constants/wordBank.ts`
   - 162 curated words
   - Exported as DAILY_WORDS array

5. **Assets:** `/public/assets/comics/`
   - 13 character SVGs
   - 5 background SVGs
   - 1 word cloud SVG

### Testing Locally

```bash
# Connect MetaMask to Flow EVM Mainnet
Network Name: Flow EVM Mainnet
RPC: https://mainnet.evm.nodes.onflow.org
Chain ID: 747
Currency: FLOW
Explorer: https://evm.flowscan.io

# Get test FROTH tokens
# Contact team on Twitter: @Immutable_type

# Create ProfileNFT (prerequisite)
Visit: https://app.immutabletype.com/profile/create
Cost: 3 FLOW or 100+ BUFFAFLOW

# Test submission flow
1. Navigate to /froth-comics
2. Check tournament is open
3. Select words from word bank
4. Preview comic strip
5. Mint (costs 100 FROTH + gas)
```

### Troubleshooting

**Issue:** "Please connect your wallet"
- **Fix:** Click MetaMask icon, connect wallet

**Issue:** "You need an ImmutableType Profile"
- **Fix:** Visit /profile/create and mint ProfileNFT

**Issue:** "Submissions are closed for this day"
- **Fix:** Wait for next day or check rotating schedule

**Issue:** "Failed to submit comic"
- **Fix:** Check FROTH balance (need 100+ FROTH)
- **Fix:** Approve FROTH spending for contract
- **Fix:** Verify all 4 panels have at least 1 word

**Issue:** NFT doesn't show image
- **Known Issue:** Metadata API not built yet (Priority 1)

---

## 📞 Support & Contact

### For Development Questions

- **GitHub Issues:** https://github.com/ImmutableType/immutable5/issues
- **Twitter:** @Immutable_type
- **Documentation:** This file + architecture.md in project root

### For User Support

- **Twitter:** @Immutable_type (request FROTH/BUFFAFLOW for testing)
- **Discord:** TBD (community server being set up)

### For Bug Reports

Please include:
- Transaction hash (if applicable)
- Wallet address
- Steps to reproduce
- Expected vs actual behavior
- Screenshot/video if possible

---

**End of Documentation**

*Version 3.0 - Updated October 24, 2025*  
*POC deployed and operational on Flow EVM Mainnet*  
*Day 1 active with rotating schedule (genesis timestamp bug documented)*

---

## 🔄 Changelog

**v3.0 - October 24, 2025**
- Updated contract address to `0x8B576e5177b52e56fcF7f51d132234844CA3ccB6`
- Documented rotating tournament schedule bug
- Added "Known Issues & Limitations" section
- Added "Autonomous Day Initialization System" documentation
- Added "Multi-Day Rewards System" architecture
- Updated development status to Phase 2 Complete
- Added Development Roadmap with priorities
- Converted Day 0 status to historical example
- Verified 13 characters and 5 backgrounds
- Added Lessons Learned section for V2
- Added Quick Start Guide for developers
- Added troubleshooting section

**v2.0 - October 21, 2025**
- Initial deployment documentation
- Contract addresses and architecture
- Frontend implementation details
- Word bank system documentation

**v1.0 - October 2025**
- Original design specification
- Theoretical economics and mechanics