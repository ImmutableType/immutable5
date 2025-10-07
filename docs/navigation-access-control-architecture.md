# ImmutableType Navigation & Access Control Architecture
**FUTURE VISION - NOT IMPLEMENTED**
**Version 1.0 - Planned for Phase 6+**
**Date: October 3, 2025**

## Status: Planning Document Only

This document describes the FUTURE navigation and access control model for the journalism platform features. The current Phase 5 implementation (identity verification + bookmarks) uses a simpler navigation:

**Current Navigation (Phase 5):**
- Logo → Home
- About (placeholder)
- My Profile (if connected + has profile)
- Wallet connection status

**This Document Describes (Phase 6+):**
- Geography-based content access
- Publisher tokens for journalists
- Launchpad, Newsstand, Leaderboard
- Content filtering by location

# ImmutableType Navigation & Access Control Architecture
**Version 1.0 - Navigation Rebuild & Geography-Based Access Model**
**Date: October 3, 2025**

## Executive Summary

This document defines the navigation structure and access control model for the ImmutableType platform. The architecture implements a geography-first approach where users' primary location determines their content access, publishing rights, and engagement capabilities. This replaces the previous navigation system that made excessive RPC calls on every page load.

## Core Architectural Principles

### 1. Static Navigation
- Navigation components make **zero RPC calls**
- All data loading happens at the page level, not in layout components
- Geography token detection occurs client-side on wallet connection
- Eliminates performance bottlenecks from previous architecture

### 2. Geography-First Model
- Users declare a primary geography in their ProfileNFT
- Primary geography gates token purchases and determines default content
- One geography per user (MVP), secondary geographies backlogged
- National content available to all users regardless of geography

### 3. Three-Tier Access Control
1. **Publisher Token** (Verified Journalists) - Can publish articles
2. **Primary Geography Token** - Full engagement in one location
3. **Secondary Geography Token** (Future) - Read/engage in additional locations

### 4. Mobile-First Design
- Clean, minimal navigation suitable for small screens
- Bottom nav bar on mobile, left sidebar on desktop
- Tab-based content filtering within pages
- Touch-optimized interactions

## Navigation Structure

### Primary Navigation

```
┌─────────────────────┐
│ [ImmutableType Logo]│  ← Links to /reader (Home)
├─────────────────────┤
│ Home                │  ← User's content feed
│ Launchpad           │  ← Story funding hub
│   - News Proposals  │     Community-driven stories
│   - Journalist Fund │     Journalists seeking funding
│ The Newsstand       │  ← Token shop (all commerce)
│ Leaderboard         │  ← Performance metrics
│ Featured            │  ← Curated content (personalized)
├─────────────────────┤
│ Explore             │  ← Discovery without tokens
├─────────────────────┤
│ About               │  ← Platform information
│   - About           │
│   - For Journalists │
│   - For Readers     │
│   - Mission         │
│   - FAQ             │
│   - Help Guide      │     (includes MetaMask setup)
│   - Tip/Donate      │
│   - Roadmap         │
├─────────────────────┤
│ [Avatar] My Profile │  ← Links to user's profile
│ [Wallet: 0x123...] │  ← Connection status only
└─────────────────────┘
```

### Navigation Changes from Previous Architecture

**Removed:**
- ❌ "My Dashboard" section with RPC calls (moves to profile page)
- ❌ Separate "Publish" link (accessed via Profile → Publish tab)
- ❌ MetaMask instructions from main nav (moved to About → Help)

**Renamed:**
- ✏️ "Marketplace" → "The Newsstand"

**Added:**
- ➕ "My Profile" link with avatar near bottom
- ➕ "Launchpad" consolidates proposals and journalist funding
- ➕ "Explore" as top-level item for discovery

## Access Control Model

### User Types & Permissions

#### Regular User - Primary Geography Only (Miami)

**Can:**
- ✅ Read Miami articles
- ✅ Create Miami proposals
- ✅ Fund Miami proposals
- ✅ Fund national proposals
- ✅ Engage in Miami governance (vote, tip, comment)

**Cannot:**
- ❌ Publish articles (requires Publisher Token)
- ❌ Read other geography articles (requires secondary token)
- ❌ Fund other geography proposals

#### Regular User - With Secondary Geography (Future Feature)

**Can:**
- ✅ All primary geography capabilities
- ✅ Read secondary geography articles (NYC)
- ✅ Fund secondary geography proposals (NYC)

**Cannot:**
- ❌ Create proposals in secondary geography
- ❌ Publish articles (requires Publisher Token)

#### Verified Journalist - Primary Geography (Miami)

**Can:**
- ✅ Publish Miami articles
- ✅ Publish national articles
- ✅ Create Miami proposals (primary only)
- ✅ Fund Miami + national proposals
- ✅ All regular user capabilities in Miami

**Cannot:**
- ❌ Publish in other geographies without secondary token
- ❌ Fund other geography proposals without tokens

#### Verified Journalist - With Secondary Geography (Future)

**Can:**
- ✅ Publish in primary and secondary geographies
- ✅ Publish national articles
- ✅ Create proposals in primary geography only
- ✅ Fund proposals in primary, secondary, and national

**Cannot:**
- ❌ Create proposals in secondary geography

### Token Types

#### Publisher Token (Journalist Credentials)
- **Acquisition:** Human-reviewed application process
- **Purpose:** Enables article publishing capability
- **Scope:** Can publish in any geography where user holds token
- **Geographic Limit:** Must designate one primary geography in profile
- **National Access:** Can publish national articles without geographic restriction

#### Geography Token (Primary)
- **Acquisition:** Purchase from The Newsstand
- **Requirement:** Must match user's profile geography
- **Purpose:** Full read/write access in one location
- **Capabilities:**
  - Read all articles in that geography
  - Create proposals in that geography
  - Fund proposals in that geography
  - Engage in local governance

#### Geography Token (Secondary) - Backlogged
- **Acquisition:** Future feature requiring profile update
- **Purpose:** Read/fund access in additional locations
- **Capabilities:**
  - Read articles in secondary geography
  - Fund proposals in secondary geography
- **Limitations:**
  - Cannot create proposals
  - Cannot publish articles (unless also holding Publisher Token)

#### National Token
- **Acquisition:** Available to all users
- **Purpose:** Access to non-geographic content
- **Scope:** Stories about national/global topics (UFOs, Epstein, etc.)

## The Newsstand - Token Shop

### Structure

```
The Newsstand
├─ Geography Tokens
│   └─ Based on your profile location
│       ├─ Miami Access Token - $X FLOW
│       └─ National Topics Access - $X FLOW
│       
│       Coming Soon:
│       Secondary geography coverage will allow 
│       access to additional cities.
│
├─ Article NFTs (Secondary Market)
│   └─ Buy/sell published articles
│       - No geographic restrictions
│       - Free market trading
│
├─ EMOJI Credits
│   └─ Platform currency
│
└─ Publisher Credentials
    └─ "Apply for Journalist Verification"
        Links to application/review process
```

### Geography Token Gating

**Profile Geography as Gatekeeper:**
- User sets primary geography during profile creation
- Can only purchase geography tokens matching profile location
- Miami profile → can only buy Miami token
- Future: Secondary geography field unlocks additional purchases

**Why This Matters:**
- Prevents gaming the system (NYC investors buying Miami tokens)
- Ensures local control of local narratives
- Aligns incentives (why choose Chicago if you want Miami content?)

**Changing Primary Geography:**
- Users can update profile location
- No restrictions in MVP (honor system)
- Future: Technical verification, cooldown periods, restrictions

### Secondary Market (Article NFTs)

**Open to Anyone:**
- No geographic restrictions on ownership
- Free market for published article NFTs
- Locals can acquire to preserve narrative control
- Outside investors can trade on secondary market

**Key Distinction:**
- Geography tokens control who can CREATE content
- Secondary market controls who can OWN published content
- These are intentionally separate markets

## Page-Level Content Filtering

### Home Page

**Tab Structure:**
```
[Miami] [National] [Explore]
```

**User with Miami Token:**
- **Miami Tab** (default): Miami-specific articles
- **National Tab**: Non-geographic content
- **Explore Tab**: Other cities (locked content with CTAs)

**User without Geography Token:**
- **Explore Tab** (default): Preview content
- **National Tab**: Full access to national content
- **Miami Tab**: Visible but shows "Buy Miami token" CTA

### Launchpad Page

**Tab Structure:**
```
[Miami Proposals] [National Proposals] [Browse All]
```

**User with Miami Token:**
- **Miami Tab** (default): Create + fund Miami proposals
- **National Tab**: Fund national proposals (create if journalist)
- **Browse All Tab**: Discovery only, locked proposals show "Requires [City] token"

**Funding Restrictions:**
- Can only fund proposals in geographies where you hold tokens
- Clicking "Fund" on NYC proposal without NYC token → "Requires NYC Token" error
- Direct to The Newsstand to purchase token

### Leaderboard Page

**Tab Structure:**
```
[Miami] [National] [Global]
```

**User with Miami Token:**
- **Miami Tab** (default): Local journalists and contributors
- **National Tab**: Top journalists publishing national content
- **Global Tab**: Platform-wide metrics

### Explore Section

**Purpose:**
- Discovery without token requirements
- Browse all geographies (preview mode)
- National content (full access)
- Micropayment access to locked articles

**Content:**
- Trending across all cities
- Preview cards for locked content
- "Buy [City] token for full access" CTAs
- Search and filtering tools

## Profile System Integration

### Profile Display

```
John Smith
┌─────────────────────────────────────┐
│ [Avatar] John Smith                 │
│ 📍 Primary: Miami                    │
│ ✍️  Verified Journalist (if applicable)│
│ 👁️  Also Reading: [Secondary cities] │
│                                      │
│ EMOJI Balance: 1,234                │
│ Bookmarks: 56                       │
│ Curated: 23                         │
│ Rank: #142                          │
└─────────────────────────────────────┘
```

**Dashboard Metrics:**
- Moved from layout to profile page
- Only load RPC data when viewing profile
- Cache with React Query (5-10 minute stale time)

### Publishing Tab (Profile)

**Regular Users:**
```
Publish
├─ Create Proposal (in Miami)
├─ Manage Bookmarks
└─ "Article publishing requires journalist credentials"
```

**Verified Journalists:**
```
Publish
├─ Create Proposal (in Miami)
├─ Publish Article
│   └─ Options: Miami Local | National
├─ Manage Bookmarks
└─ Portfolio/Community Curation
```

## Technical Implementation

### Data Loading Strategy

**Problem in Previous Architecture:**
```typescript
// BAD: In layout.tsx
useEffect(() => {
  loadDashboardData() // Runs on EVERY route change
  // Makes 5+ RPC calls:
  // - EMOJI balance
  // - Bookmark count
  // - Community articles
  // - Portfolio articles
  // - Leaderboard score
}, [address, isConnected])
```

**Solution: Page-Level Loading**
```typescript
// GOOD: Only in pages that need it

// app/(client)/profile/[id]/page.tsx
export default function ProfilePage() {
  const { data } = useProfileStats() // Only loads here
}

// app/(client)/page.tsx (Home/Reader)
export default function HomePage() {
  const { articles } = useArticleFeed() // Only loads here
  // No profile stats needed
}
```

### Caching Strategy

**Use React Query for Smart Caching:**
```typescript
export function useProfileStats(address: string) {
  return useQuery({
    queryKey: ['profile-stats', address],
    queryFn: () => fetchProfileStats(address),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}
```

**Benefits:**
- Data fetched once per 5 minutes max
- Cached across component unmounts
- Background refetching
- No redundant RPC calls

### Geography Token Detection

**Client-Side on Wallet Connect:**
```typescript
// On wallet connection:
1. Read ProfileNFT for user's profile geography
2. Query MembershipTokens contract for token ownership
3. Cache results in React Query
4. Conditionally render navigation and content based on tokens
```

**No RPC Calls in Layout:**
- Token detection happens once on connection
- Results cached for session
- Navigation remains static
- Content filtering happens at page level

## Mobile Responsiveness

### Mobile View (< 768px)

```
┌─────────────────────┐
│   Top Bar           │
│   [Logo]  [Avatar]  │
├─────────────────────┤
│                     │
│   Content Area      │
│                     │
│   [Tabs if needed]  │
│   [Feed Content]    │
│                     │
├─────────────────────┤
│  🏠  🔍  📝  📊  👤  │  ← Bottom nav
└─────────────────────┘
```

**Bottom Navigation Icons:**
- 🏠 Home
- 🔍 Explore
- 📝 Launchpad
- 🛒 The Newsstand
- 👤 My Profile

### Desktop View (≥ 768px)

```
┌───────┬──────────────────┐
│       │                  │
│  Nav  │   Content Area   │
│       │                  │
│ Home  │   [Tabs]         │
│ Explr │   [Feed]         │
│ Launch│                  │
│ Shop  │                  │
│       │                  │
└───────┴──────────────────┘
```

**Fixed left sidebar (250px) + scrollable content**

## Implementation Phases

### Phase 1: Clean Up Layout (Week 1)
**Goal:** Remove RPC calls, update navigation text

- [ ] Remove `dashboardData` state from `layout.tsx`
- [ ] Delete `useEffect` making RPC calls
- [ ] Remove "My Dashboard" section JSX
- [ ] Rename "Marketplace" → "The Newsstand"
- [ ] Add "My Profile" link with avatar
- [ ] Move MetaMask instructions to About → Help
- [ ] Update navigation links and routing

### Phase 2: Profile Dashboard Enhancement (Week 1-2)
**Goal:** Move dashboard metrics to profile page

- [ ] Create dashboard metrics section in profile overview tab
- [ ] Implement `useProfileStats` hook with React Query
- [ ] Load EMOJI balance, bookmarks, curated count, rank
- [ ] Add loading states and error handling
- [ ] Test caching behavior

### Phase 3: Geography Token Detection (Week 2)
**Goal:** Read profile geography and token ownership

- [ ] Query ProfileNFT for user's profile geography on connect
- [ ] Query MembershipTokens for token ownership
- [ ] Cache results with React Query
- [ ] Display profile geography in profile header
- [ ] Implement token-based UI conditionals

### Phase 4: Content Filtering (Week 2-3)
**Goal:** Add geography-aware tabs to pages

- [ ] Add tabs to Home: `[Miami] [National] [Explore]`
- [ ] Add tabs to Launchpad: `[Miami] [National] [Browse All]`
- [ ] Add tabs to Leaderboard: `[Miami] [National] [Global]`
- [ ] Filter content based on tokens held
- [ ] Implement locked states with CTAs

### Phase 5: The Newsstand (Week 3)
**Goal:** Build token shop with geography gating

- [ ] Create Geography Token purchase interface
- [ ] Gate purchases by profile geography
- [ ] Show only Miami + National for MVP
- [ ] Display "Secondary geography coming soon" message
- [ ] Build Article NFT secondary marketplace
- [ ] Build EMOJI credit purchase interface

### Phase 6: Access Control (Week 3-4)
**Goal:** Implement proposal and publishing restrictions

- [ ] Implement proposal creation (primary geography only)
- [ ] Implement proposal funding (token-gated)
- [ ] Implement article publishing (Publisher Token + geography)
- [ ] Add clear error messages for locked actions
- [ ] Test all permission combinations

## Backlog - Future Features

### Secondary Geography Support
**Requirements:**
- Add `secondaryGeographies[]` field to ProfileNFT
- Update The Newsstand to allow secondary token purchases
- Implement read/fund access in secondary locations
- Restrict proposal creation to primary only

### Technical Location Verification
**Progressive Enhancement:**
- Start with honor system (self-declared)
- Add IP-based verification
- Implement proof of residency upload
- Integrate with identity verification services
- Build dispute resolution system

### Geography Change Restrictions
**Prevent Gaming:**
- Implement cooldown period (30-90 days)
- Add fee for geography changes
- Require verification before change
- Track history of geography changes

### City Expansion Beyond Miami
**Replication Model:**
- Create Chicago, NYC, LA geographies
- Issue geography tokens via The Newsstand
- Replicate content structures
- Build cross-city discovery tools

### National Content Refinement
**Access Models:**
- Define who can publish national content
- Implement reputation thresholds
- Add verification for national journalists
- Create national governance model

## Security Considerations

### Access Control Enforcement
- All geography checks happen on-chain (contract level)
- UI restrictions are UX enhancements, not security
- Smart contracts enforce actual permissions
- Token ownership is source of truth

### Anti-Gaming Measures
- Profile geography gates token purchases
- Primary geography limits proposal creation
- Publisher Token required for article publishing
- Secondary market unrestricted to prevent narrative control

### Privacy & Identity
- Wallet address is primary identity
- Profile geography is self-declared
- No personal information required (MVP)
- Future: Progressive enhancement with verification

## Success Metrics

### Performance
- Zero RPC calls in layout component
- Page load time < 2 seconds
- Cache hit rate > 80%
- Reduced blockchain queries by 70%+

### User Experience
- Clear understanding of token requirements
- Intuitive navigation structure
- Smooth onboarding for new users
- Low friction token acquisition

### Platform Health
- Active users per geography
- Token purchase conversion rate
- Proposal creation rate by geography
- Article publishing rate by geography

## Glossary

**Primary Geography:** The one location where a user has full engagement rights (create proposals, publish if journalist)

**Secondary Geography:** Additional locations where user has read/fund access (future feature)

**Publisher Token:** Credential issued to verified journalists enabling article publishing

**Geography Token:** NFT granting read/engage access to a specific location's content

**The Newsstand:** Platform's token shop for purchasing geography tokens, article NFTs, and EMOJI credits

**National Content:** Articles not tied to specific geography, available to all users

**Profile Geography:** Location declared in user's ProfileNFT, gates token purchases

---

**Document Status:** Draft for Review  
**Version:** 1.0  
**Last Updated:** October 3, 2025  
**Next Review:** After Phase 1 implementation