// lib/types/frothComic.ts

export interface DailyTemplate {
    characterIds: number[];    // Array of 4 character IDs
    backgroundId: number;       // Single background ID (0-4)
    openTime: bigint;          // Unix timestamp
    closeTime: bigint;         // Unix timestamp
    creatorPool: bigint;       // FROTH in creator pool
    voterPool: bigint;         // FROTH in voter pool
    totalEntries: bigint;      // Number of submissions
    finalized: boolean;        // Is day complete?
  }
  
  export interface ComicSubmission {
    creator: string;           // Address of creator
    wordIndices: number[][];   // Array of 4 panels with word indices
    votes: bigint;            // Total votes received
    timestamp: bigint;        // When submitted
    characterIds: number[];   // Characters used
    backgroundId: number;     // Background used
  }
  
  export interface ClaimableRewards {
    creatorReward: bigint;    // Amount if winner
    voterReward: bigint;      // Amount from voting
    voterClaimed: boolean;    // Already claimed?
  }
  
  export interface SubmissionMetadata {
    tokenId: string;
    creator: string;
    votes: number;
    characterIds: number[];
    backgroundId: number;
    wordIndices: number[][];
    timestamp: number;
  }