```markdown
# FROTH Daily Comic Challenge - Complete Rules & Implementation Guide

**Version:** 1.1  
**Date:** October 17, 2025  
**Status:** In Development - Frontend Complete, Assets In Progress

---

## Overview

A daily creative competition where users create comic strips using randomly-generated character/background templates. Winners are determined by community voting, with prizes distributed in FROTH tokens.

---

## Core Mechanics

### Daily Cycle (Miami Time - EST/EDT)

- **8:00 PM**: New day begins
  - New template generated (4 random characters + 1 random background)
  - Submissions open
  - Previous day's voting window closes
  
- **11:59 PM**: Submissions close
  - No new entries accepted
  - Voting continues
  
- **12:00 AM (Midnight)**: Voting closes
  - Competition ends
  - Winner determination triggered (permissionless - anyone can call)
  - Rewards become claimable

### Entry Rules

- **Cost**: 100 FROTH per entry
- **Optional Tip**: Users can add extra FROTH (goes into same 60/20/20 split)
- **Multiple Entries**: Allowed (users can submit unlimited entries per day)
- **Template**: Same for all users that day
  - 4 random characters (different per panel)
  - 1 random background (same across all 4 panels) ← **Updated**
- **User Input**: 4 text captions only (max 50 characters each)
- **Submission Window**: 8:00 PM - 11:59 PM Miami time

### Voting Rules

- **Cost**: 1 BUFFAFLOW per vote (configurable by admin)
- **Max Votes**: 100 BUFFAFLOW per wallet per submission (configurable by admin)
- **Vote Destination**: BUFFAFLOW sent to treasury wallet
- **Voting Window**: 8:00 PM - 12:00 AM Miami time (overlaps with submissions)
- **Vote on Own Entry**: Allowed
- **Multiple Submissions**: Can vote on different submissions
- **Payout**: Only votes on winning submission(s) receive rewards

---

## Economics (60/20/20 Split)

### Fee Distribution

Every entry fee (100 FROTH + optional tip) is split:

- **60%** → Treasury Contract
  - Held until manual conversion to FVIX
  - Accumulated across all days
  - Manually moved by admin when threshold reached

- **20%** → Creator Prize Pool
  - Distributed to winning comic creator(s)
  - Split equally if multiple winners (tie)
  - Claimable after day finalization

- **20%** → Voter Prize Pool
  - Distributed to voters of winning comic(s)
  - Proportional to votes cast on winner
  - Claimable after day finalization

### Treasury Wallets

**Single Treasury Address**: `0x00000000000000000000000228B74E66CBD624Fc`

- FROTH (60% of entry fees) → Treasury
- BUFFAFLOW (all vote payments) → Treasury
- Manual withdrawal/conversion by admin

### Example Economics

**Day #47 with 30 entries:**
- Total collected: 30 × 100 = 3,000 FROTH
- Treasury: 1,800 FROTH (60%)
- Creator pool: 600 FROTH (20%)
- Voter pool: 600 FROTH (20%)

**Winning comic gets 200 votes from 10 voters:**
- Alice: 50 votes → (50/200) × 600 = 150 FROTH
- Bob: 40 votes → (40/200) × 600 = 120 FROTH
- Others: Proportional shares

**Creator gets:**
- 600 FROTH (if single winner)
- 300 FROTH each (if two-way tie)

---

## Winner Determination

### Standard Winner (Single)

- Submission with highest vote count wins
- Creator receives 20% pool
- All voters of that submission split 20% pool proportionally

### Tie Scenario

**If multiple submissions have same highest vote count:**

- **Creator Prize**: Split equally among tied creators
- **Voter Prize**: All voters of ALL tied submissions share the 20% pool
  - Total votes = sum of votes on all tied submissions
  - Each vote worth: (voter pool) / (total votes on tied submissions)

### Edge Cases

**No Submissions:**
- Prize pool rolls to next day
- 60% still goes to treasury
- New day starts with rolled-over 20%+20% pools

**No Votes:**
- Winner cannot be determined
- Prize pool rolls to next day

**Single Submission:**
- Automatically wins with any votes
- Normal prize distribution

---

## Claim System

### Claimable Rewards

After day finalization:
- Rewards are **allocated** (not automatically sent)
- Users must **manually claim** via UI
- Each user pays own gas to claim (~$0.0001 on Flow EVM)

### Claim Interface

**Location**: `/froth-comics` page only (not on profile)

**Static Button**: "Check My Rewards"
- No automatic RPC calls on page load
- User clicks → modal opens → blockchain query
- Shows breakdown by day
- "Claim All" or individual day claims

**Modal Display:**
```
Your FROTH Rewards
─────────────────────
Day #47 - Winner: 2,500 FROTH
Day #46 - Voter: 450 FROTH
─────────────────────
Total: 2,950 FROTH

[Claim All]  [Close]
```

### Claim Mechanics

- **No expiration**: Rewards claimable indefinitely
- **Batch claiming**: Can claim multiple days in one transaction
- **One-time claim**: Each day can only be claimed once per address
- **Gas paid by claimer**: User pays transaction cost

---

## Template Generation System

### Daily Template Structure

Each day generates:

**4 Character IDs** (0-9):
- Randomly selected from 10 total characters
- Different character per panel
- Examples: FROTH Cat, BUFFAFLOW, Moon Cat, Typing Cat

**1 Background ID** (0-4): ← **Updated**
- Randomly selected from 5 total backgrounds
- **Same background across all 4 panels**
- Rotates daily: Day ID % 5
- Examples: West, White, City, Space, Dark Space

### Randomness Source

```solidity
function _random(uint256 seed) internal view returns (uint256) {
    return uint256(keccak256(abi.encodePacked(
        block.timestamp,
        block.prevrandao,
        currentDay,
        seed
    )));
}

// Background selection
uint8 background = uint8(currentDay % 5);  // Cycles through 0-4
```

---

## Smart Contract Architecture

### Key State Variables

```solidity
uint256 public currentDay;
mapping(uint256 => DailyTemplate) public dailyTemplates;
mapping(uint256 => Submission[]) public daySubmissions;
mapping(uint256 => mapping(address => uint256)) public claimableRewards;
mapping(uint256 => mapping(address => bool)) public hasClaimed;
uint256 public treasuryCollected;

// Configurable parameters
uint256 public voteCost = 1 * 10**18;           // 1 BUFFAFLOW per vote
uint256 public maxVotesPerSubmission = 100;     // Max votes per wallet
uint256 public entryFee = 100 * 10**18;         // 100 FROTH base fee
```

### Updated Template Struct

```solidity
struct DailyTemplate {
    uint256 dayId;
    uint8[4] characters;    // 4 different characters
    uint8 background;       // SINGLE background (not array) ← Updated
    uint256 prizePool;
    uint256 submissionDeadline;
    uint256 votingDeadline;
    address winner;
    uint256 winningTokenId;
    bool finalized;
}
```

### Core Functions

**submitEntry(string[4] captions, uint256 tipAmount)**
- Transfer FROTH (100 + tip)
- Split fees 60/20/20
- Mint submission NFT
- Store caption data on-chain

**vote(uint256 tokenId, uint256 voteAmount)**
- Transfer BUFFAFLOW to treasury (voteAmount × voteCost)
- Increment submission vote count
- Track voter's contribution
- Enforce max votes limit

**finalizeDay(uint256 dayId)**
- Permissionless (anyone can call after midnight)
- Find submission(s) with highest votes
- Calculate claimableRewards for creator(s)
- Calculate claimableRewards for voters proportionally
- Generate next day's template
- Emit events

**claimRewards(uint256 dayId)**
- Check claimableRewards[dayId][msg.sender]
- Transfer FROTH to user
- Mark as claimed

**claimMultipleDays(uint256[] dayIds)**
- Batch claim for gas efficiency
- Sum all unclaimed amounts
- Single transfer

---

## Asset System

### Asset Format & Storage

**Format**: SVG files (500x500px, will scale to 380x380px)
**Storage**: Off-chain for Forte Hacks bounty, on-chain upgrade planned for future
**Location**: `public/assets/comics/`

### Asset Creation Status

#### Backgrounds (5 total) - 100% Complete ✅

```
public/assets/comics/backgrounds/
├── 0-west.svg ✅ Created & Tested (loads correctly)
├── 1-white.svg ✅ Created & Tested (loads correctly)
├── 2-city.svg ✅ Created & Tested (loads correctly)
├── 3-space.svg ✅ Created & Tested (loads correctly)
└── 4-darkspace.svg ✅ Created & Tested (loads correctly)
```

**Background Rotation Logic:**
- Day #1: Background 0 (west)
- Day #2: Background 1 (white)
- Day #3: Background 2 (city)
- Day #4: Background 3 (space)
- Day #5: Background 4 (darkspace)
- Day #6: Background 0 (cycles back)

#### Characters (10 total) - 0% Complete ⏳

```
public/assets/comics/characters/
├── 0-froth-cat.svg ⏳ TO DO
├── 1-buffaflow.svg ⏳ TO DO
├── 2-moon-cat.svg ⏳ TO DO
├── 3-typing-cat.svg ⏳ TO DO
├── 4-rich-cat.svg ⏳ TO DO
├── 5-party-cat.svg ⏳ TO DO
├── 6-sleeping-cat.svg ⏳ TO DO
├── 7-sad-cat.svg ⏳ TO DO
├── 8-excited-cat.svg ⏳ TO DO
└── 9-zen-cat.svg ⏳ TO DO
```

**Asset Requirements:**
- Size: 500x500px (will scale to 380x380)
- Format: SVG with transparent background
- Character should be centered with ~100px margin at bottom for text bubble
- Keep file size under 50KB

### Asset Generation Strategy

**Phase 1 (Current - Forte Hacks):**
- Create in Canva/Figma
- Export as SVG
- Store in `public/assets/`
- Frontend loads directly
- Contract stores IDs only

**Phase 2 (Future - Full Decentralization):**
- Compress SVGs using RLE or similar
- Store on-chain (Nouns-style)
- Generate images via `tokenURI()`
- No external dependencies

---

## Frontend Development Status

### Completed ✅

**Page Structure:**
- Route: `app/(client)/froth-comics/page.tsx`
- Responsive layout (desktop horizontal, mobile vertical planned)
- Integration with existing ImmutableType navigation

**Carousel Component:**
- Navigate through today's submissions with arrow buttons
- Large prominent arrows on desktop (left: -60px, right: -60px)
- Displays comic with creator info and vote count
- "View All Submissions" button opens modal

**Template Display:**
- Shows locked template for the day
- 4 characters + 1 background
- All 4 panels use same background

**Create Entry Section:**
- 4 text input fields (50 char max each)
- Live preview updates as user types
- Cost breakdown (60/20/20 split)
- Mint button with wallet connection check
- Disabled state when no captions entered

**Modal Components:**
- "View All Submissions" modal with vertical list
- Close button and click-outside-to-close
- Shows all submissions for current day

**SVG Rendering:**
- Dynamic SVG generation in React
- Loads backgrounds from `/public/assets/`
- Character placeholders (colorful circles with labels)
- Speech bubble with caption text
- 4-panel horizontal strip layout

### In Progress ⏳

**Character Assets:**
- 10 character SVGs need to be created
- Replace placeholder circles with actual artwork

**Smart Contract:**
- Solidity contract needs to be written
- Deploy to Flow EVM Mainnet
- No testnet testing (no test tokens available)

**Contract Integration:**
- Connect frontend to deployed contract
- Wire up submitEntry function
- Wire up vote function
- Wire up claimRewards function

**API Route:**
- Create `/api/comic-image/[tokenId]` endpoint
- Read contract data
- Assemble SVG from stored assets
- Return image for NFT display

### Not Started 🔜

**Claims System:**
- "Check My Rewards" button functionality
- Claims modal with breakdown
- Contract query for claimable amounts
- Claim transaction handling

**Voting Interface:**
- Vote button on submissions
- BUFFAFLOW approval
- Vote amount input (1-100)
- Vote transaction handling

**Historical View:**
- Browse past days (Phase 2)
- Filter by day number
- View past winners

**Leaderboards:**
- Most wins
- Most votes earned
- Top voters
- Saved for Phase 2

---

## NFT Metadata

Each submission is an ERC721 NFT with:

- **Token ID**: Unique sequential ID
- **Day ID**: Which day it was created
- **Creator**: Minter's address
- **Captions**: 4 text strings (on-chain)
- **Character IDs**: 4 integers (on-chain)
- **Background ID**: 1 integer (on-chain) ← **Updated**
- **Votes**: Current vote count
- **Timestamp**: When minted

### tokenURI Implementation

**For Forte Hacks (Hybrid Approach):**

```solidity
function tokenURI(uint256 tokenId) public view returns (string memory) {
    Submission memory submission = submissions[tokenId];
    
    string memory imageUrl = string(abi.encodePacked(
        "https://app.immutabletype.com/api/comic-image/",
        toString(tokenId)
    ));
    
    string memory json = string(abi.encodePacked(
        '{"name":"FROTH Comic #', toString(tokenId),
        '","description":"A daily comic competition entry",',
        '"image":"', imageUrl, '",',
        '"attributes":[',
          '{"trait_type":"Day","value":', toString(submission.dayId), '},',
          '{"trait_type":"Votes","value":', toString(submission.votes), '}',
        ']}'
    ));
    
    return string(abi.encodePacked(
        "data:application/json;base64,",
        Base64.encode(bytes(json))
    ));
}
```

---

## Technical Specifications

### Smart Contracts

**Network**: Flow EVM Mainnet (Chain ID: 747)

**Contract Addresses**:
- FrothComicDaily: TBD (to be deployed)
- FROTH Token: `0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA`
- BUFFAFLOW Token: `0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798`
- Treasury Wallet: `0x00000000000000000000000228B74E66CBD624Fc`

**Dependencies**:
- OpenZeppelin ERC721
- OpenZeppelin ERC20 (for token interfaces)
- OpenZeppelin Ownable (for admin functions)
- OpenZeppelin ReentrancyGuard (for claim functions)

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

---

## Development Timeline

### Week 1: Asset Creation & Contract (Current)
- [x] Frontend page structure
- [x] Background SVGs (5/5 complete)
- [ ] Character SVGs (0/10 complete) ← **Next Priority**
- [ ] Smart contract development
- [ ] Contract deployment to Flow EVM Mainnet

### Week 2: Integration & Testing
- [ ] Connect frontend to contract
- [ ] Implement submitEntry flow
- [ ] Implement voting flow
- [ ] Implement claims flow
- [ ] API route for NFT images
- [ ] End-to-end testing

### Week 3: Polish & Launch
- [ ] Bug fixes
- [ ] UI polish
- [ ] Gas optimization
- [ ] Documentation
- [ ] Forte Hacks submission

---

## Launch Checklist

### Pre-Deployment

- [ ] Complete all 10 character SVGs
- [ ] Smart contract internal review
- [ ] Gas cost analysis for all functions
- [ ] Treasury wallet security verification
- [ ] Test mint flow with real FROTH/BUFFAFLOW

### Deployment Day

- [ ] Deploy FrothComicDaily contract to mainnet
- [ ] Verify contract on Flow EVM explorer
- [ ] Set initial configuration (vote cost, max votes, entry fee)
- [ ] Update frontend with deployed contract address
- [ ] Generate first day's template
- [ ] Test full user flow
- [ ] Announce launch

### Post-Launch Monitoring

- [ ] Daily finalization check (manual trigger initially)
- [ ] Monitor prize pool accumulation
- [ ] Track user participation metrics
- [ ] Review gas costs
- [ ] Gather user feedback

---

## Future Enhancements (Phase 2+)

### Advanced Features
- Historical gallery with day navigation
- Creator leaderboards
- Voter leaderboards
- NFT marketplace integration
- Social sharing with auto-generated images
- Mobile-optimized vertical layout

### Technical Upgrades
- Automated finalization bot
- Full on-chain SVG storage (Nouns-style)
- Chainlink Automation (if Flow EVM support added)
- Advanced analytics dashboard

### Community Features
- Themed weeks with special templates
- Collaborative comics (multiple creators)
- Community-submitted character designs
- Tournament brackets for top creators

---

## Open Questions & Decisions

### Resolved ✅

- ✅ Single background per day (all 4 panels same)
- ✅ Background rotation: Day ID % 5
- ✅ Entry fee: 100 FROTH (with optional tip)
- ✅ Vote cost: 1 BUFFAFLOW (configurable)
- ✅ Claims: Manual via modal (no auto-distribution)
- ✅ Asset format: SVG, off-chain for bounty
- ✅ Asset size: 500x500px (scales to 380x380)
- ✅ Finalization: Permissionless trigger after midnight

### To Be Determined

- Character art style and theme
- Exact SVG generation logic for on-chain rendering
- Mobile vertical layout implementation
- Social media preview card generation
- Analytics tracking approach

---

## Success Metrics

### Forte Hacks Bounty Goals

**Minimum Viable:**
- ✅ Working frontend with real assets
- ⏳ Deployed smart contract
- ⏳ Can mint a comic
- ⏳ Can vote on a comic
- ⏳ Can claim rewards

**Ideal Submission:**
- All of above plus:
- Multiple test users creating comics
- Full prize pool cycle working
- Clean, polished UI
- Live demo ready

### Post-Launch KPIs (30 days)

- 20+ submissions per day
- 50+ unique voters per day
- 80%+ claim rate for winners
- 50%+ repeat participant rate

---

## Resources & Documentation

### Code Repository
- GitHub: https://github.com/ImmutableType/immutable5
- Branch: main
- Frontend: `app/(client)/froth-comics/page.tsx`
- Assets: `public/assets/comics/`

### External Documentation
- Flow EVM Docs: https://developers.flow.com/evm
- FROTH Token Info: https://kittypunch.gitbook.io/kittypunch-docs/
- OpenZeppelin Contracts: https://docs.openzeppelin.com/

### Support
- Technical issues: Development team
- Asset creation: Design team
- Security concerns: Security review process

---

**End of Documentation**

*Version 1.1 - Updated October 17, 2025*
*This document reflects current implementation status and design decisions for FROTH Daily Comic Challenge.*
```

**Key Updates Made:**
1. ✅ Single background per day clearly documented
2. ✅ Asset status section with completion percentages
3. ✅ Background rotation logic explained
4. ✅ Frontend development status detailed
5. ✅ Updated template struct to show single background
6. ✅ Actual background filenames documented
7. ✅ Clear next steps for character creation
8. ✅ Bounty timeline and priorities

**Copy this entire markdown and paste into `froth-comics-rules.md`!**