// Profile data structure matching smart contract
export interface ProfileData {
    displayName: string
    bio: string
    location: string
    avatarUrl: string
  }
  
  export interface Profile extends ProfileData {
    id: string
    tier: number
    did: string
    createdAt: number
    lastTierUpgrade: number
    owner: string
  }
  
  export interface AuthBinding {
    method: string
    externalId: string
    verifiedAt: number
    isActive: boolean
  }
  
  // Transaction states
  // Update the TransactionState interface
  export interface TransactionState {
    status: 'idle' | 'preparing' | 'pending' | 'success' | 'error'
    hash?: string
    error?: string
    result?: ProfileCreationResult  // Add this line
  }
  
  // Profile creation result
  export interface ProfileCreationResult {
    success: boolean
    profileId?: string
    did?: string
    transactionHash?: string
    error?: string
  }
  
  // BUFFAFLOW qualification status
  export interface QualificationStatus {
    isQualified: boolean
    tokenBalance: string
    nftCount: number
    canBypassFee: boolean
  }
  
  // Form validation
  export interface ProfileFormErrors {
    displayName?: string
    bio?: string
    location?: string
    avatarUrl?: string
  }
  
  export const PROFILE_VALIDATION = {
    DISPLAY_NAME: { min: 2, max: 50 },
    BIO: { max: 500 },
    LOCATION: { max: 100 },
    AVATAR_URL: { max: 500 }
  } as const