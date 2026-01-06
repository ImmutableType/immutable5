// Comic submission data structure
export interface ComicSubmission {
    characterIds: number[];      // 4 characters (one per panel)
    backgroundId: number;         // Single background for all panels
    wordIndices: number[][];      // 4 panels × up to 10 words each
    wordCloudId: number;          // Single word cloud style
  }
  
  // Panel data for UI state
  export interface PanelData {
    characterId: number;
    wordIndices: number[];        // Array of word indices for this panel
  }
  
  // Word pack structure (for future Phase 2)
  export interface WordPack {
    id: string;
    name: string;
    description: string;
    price: string;                // e.g., "15 FLOW"
    wordCount: number;
    words: string[];
    preview: string[];            // First 10 words for preview
    isOwned: boolean;
    contractAddress?: string;     // NFT contract address (future)
  }
  
  // Mocked submission for carousel display
  export interface MockSubmission {
    id: number;
    creator: string;
    votes: number;
    captions: string[];           // For backward compatibility with old mock data
    characterIds: number[];
    backgroundId: number;
    wordCloudId: number;
    wordIndices: number[][];      // New: word indices instead of captions
  }