/**
 * FROTH Daily Comic - Word Bank System
 * Based on authentic FROTH/KittyPunch/Flow community research
 * @version 2.0.0
 * @updated October 2025
 */

export interface WordPack {
    id: string;
    name: string;
    description: string;
    price: string;
    wordCount: number;
    isComplimentary?: boolean;
  }
  
  // ============================================================================
  // MAIN DAILY WORD BANK - 150+ AUTHENTIC FROTH COMMUNITY TERMS
  // ============================================================================
  
  export const DAILY_WORDS = [

      // Basic Verbs (12)
  "run", "jump", "fly", "swim", "dance", "fight", "build", "make",
  "take", "give", "find", "lose", "is", "will", "bounce",

    // Community & Greetings (12 words)
    "GM", "GN", "Fren", "Ser", "Anon", "WAGMI", "Family", "Builder", 
    "Trenches", "Community", "Vibes", "Squad",
    
    // Action Words - Trading & Gaming (25 words)
    "Ape", "Aping", "HODL", "Stack", "Pump", "Moon", "Mooning", "Flip",
    "Bag", "Bagging", "Stake", "Farm", "Mint", "Launch", "Swap", "Lock",
    "Build", "Race", "Play", "Collect", "Showcase", "Trade", "Earn",
    "Rip", "Pull", "Score", "Ride", "Punch",
    
    // Descriptive Words - States & Emotions (30 words)
    "Based", "Bullish", "Bearish", "Comfy", "Rekt", "Wrecked", "SAFU",
    "Legit", "Diamond", "Paper", "Degen", "Frothy", "Rare", "Epic",
    "Wild", "Smooth", "Choppy", "Frozen", "Liquid", "Volatile", "Consumer",
    "Chill", "Savage", "Whale", "Shrimp", "Chad", "Normie", "Transparent",
    "Decentralized", "Permissionless", "Composable",
    
    // FROTH & KittyPunch Specific (18 words)
    "Punch", "PunchSwap", "Kitty", "FVIX", "Protocol", "Trenches",
    "Vaults", "Farms", "Locks", "Convert", "Consumer", "Innovation",
    "Litany", "Utility", "DeFi", "Ecosystem", "Participation", "Froth",
    
    // Flow Blockchain Culture (15 words)
    "Flow", "Cadence", "Moment", "Float", "Resource", "Mainstream",
    "Family", "Emerald", "Set", "Challenge", "Pack", "Showcase",
    "Sports", "Collectible", "Gaming",
    
    // Market & Sentiment (20 words)
    "FOMO", "FUD", "ATH", "ATL", "Dip", "Dump", "Rally", "Crash",
    "Bull", "Bear", "Crab", "Pump", "Volatility", "LFG", "NGMI",
    "GMI", "Alpha", "Hopium", "Copium", "Signal",
    
    // Phrases & Expressions (12 terms)
    "To the Moon", "Wen Moon", "Diamond Hands", "Paper Hands",
    "Probably Nothing", "DYOR", "Few Understand", "IYKYK",
    "Buy the Dip", "Seems Legit", "Not Financial Advice", "This is the Way",
    
    // Comic-Specific Narrative (8 words)
    "Journey", "Quest",
    "Achievement", "Power-up", "Epic",
    
    // Tournament & Skill Game Positioning (10 words)
    "Tournament", "Skill", "Strategy", "Compete", "Winner",
    "Challenge", "Leaderboard", "Score", "Victory", "Champion"
  ];
  
  // ============================================================================
  // FROTH WORD PACK (Complimentary)
  // ============================================================================
  
  export const FROTH_WORD_PACK = [
    "Punch", "PunchSwap", "Kitty", "FVIX", "Protocol", "Trenches",
    "Vaults", "Farms", "Locks", "Convert", "Consumer", "Innovation",
    "Litany", "Utility", "DeFi", "Ecosystem", "Participation", "Froth"
  ];
  
  // ============================================================================
  // WORD PACKS CONFIGURATION
  // ============================================================================
  
  export const WORD_PACKS: WordPack[] = [
    {
      id: "froth-essentials",
      name: "FROTH Essentials",
      description: "Official KittyPunch ecosystem terms - Complimentary!",
      price: "FREE ✓",
      wordCount: 18,
      isComplimentary: true
    },
    {
      id: "degen-starter",
      name: "Degen Starter Pack",
      description: "Essential crypto slang and community classics",
      price: "500 FROTH",
      wordCount: 25
    },
    {
      id: "flow-culture",
      name: "Flow Culture Pack",
      description: "Flow blockchain-specific vocabulary",
      price: "500 FROTH",
      wordCount: 15
    },
    {
      id: "market-master",
      name: "Market Master Pack",
      description: "Trading and sentiment terminology",
      price: "750 FROTH",
      wordCount: 20
    },
    {
      id: "tournament-pro",
      name: "Tournament Pro Pack",
      description: "Competitive gaming vocabulary",
      price: "300 FROTH",
      wordCount: 10
    }
  ];