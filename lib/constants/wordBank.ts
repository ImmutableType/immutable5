// Daily word bank - 100 PG-13 words available to all users for free
export const DAILY_WORDS: string[] = [
    // Verbs & Connectors (25)
    "is", "was", "will", "can", "should", "must", "could", "would", "did", "does",
    "the", "a", "an", "and", "but", "or", "so", "then", "when", "where",
    "if", "because", "although", "while", "until",
    
    // Action Verbs (20)
    "run", "jump", "fly", "swim", "dance", "sing", "laugh", "cry", "shout", "whisper",
    "eat", "drink", "sleep", "wake", "find", "lose", "give", "take", "make", "break",
    
    // Descriptive Adjectives (20)
    "big", "small", "happy", "sad", "fast", "slow", "hot", "cold", "bright", "dark",
    "loud", "quiet", "tall", "short", "old", "new", "strong", "weak", "soft", "hard",
    
    // Common Nouns (15)
    "cat", "dog", "bird", "fish", "tree", "flower", "water", "fire", "wind",
    "house", "car", "phone", "book", "door", "window",
    
    // Character Types (10)
    "robot", "alien", "wizard", "dragon", "knight", "pirate", "ninja", "ghost", "hero", "friend",
    
    // Dramatic Adverbs (10)
    "suddenly", "quietly", "loudly", "quickly", "slowly", "carefully", "wildly", "madly", "barely", "nearly"
  ];
  
  // Word packs for Phase 2 (currently locked/purchasable)
  export const WORD_PACKS: WordPack[] = [
    {
      id: "sci-fi",
      name: "Sci-Fi Pack",
      description: "Futuristic tech and space adventure words",
      price: "15 FLOW",
      wordCount: 150,
      words: [], // Will be populated in Phase 2
      preview: ["spaceship", "laser", "teleport", "hologram", "asteroid", "galaxy", "cyborg", "quantum", "android", "wormhole"],
      isOwned: false
    },
    {
      id: "fantasy",
      name: "Fantasy Pack",
      description: "Magical realms and mythical creatures",
      price: "10 FLOW",
      wordCount: 120,
      words: [], // Will be populated in Phase 2
      preview: ["spell", "wand", "potion", "enchant", "dungeon", "sword", "shield", "castle", "prophecy", "rune"],
      isOwned: false
    },
    {
      id: "memes",
      name: "Meme Pack",
      description: "Internet culture and viral phrases",
      price: "8 FLOW",
      wordCount: 80,
      words: [], // Will be populated in Phase 2
      preview: ["stonks", "wen", "moon", "rekt", "hodl", "cope", "based", "cringe", "poggers", "ratio"],
      isOwned: false
    },
    {
      id: "western",
      name: "Western Pack",
      description: "Cowboys, outlaws, and frontier life",
      price: "12 FLOW",
      wordCount: 100,
      words: [], // Will be populated in Phase 2
      preview: ["sheriff", "outlaw", "saloon", "lasso", "wagon", "ranch", "showdown", "tumble", "gold", "frontier"],
      isOwned: false
    },
    {
      id: "sports",
      name: "Sports Pack",
      description: "Athletic action and competition",
      price: "10 FLOW",
      wordCount: 110,
      words: [], // Will be populated in Phase 2
      preview: ["goal", "score", "champion", "trophy", "victory", "defeat", "team", "coach", "stadium", "tournament"],
      isOwned: false
    }
  ];
  
  // Import type for TypeScript
  import type { WordPack } from '../types/comic';