export interface MintedBookmark {
    url: string
    title: string
    description?: string
    favicon?: string
    addedAt: number
  }
  
  export interface MintedBookmarkCollection {
    id: string
    tokenId: string
    title: string
    description?: string
    bookmarks: MintedBookmark[]
    mintedAt: number
    mintedBy: string
    transactionHash: string
    ipfsHash?: string
    isActive: boolean
  }
  
  export interface MintedBookmarkDisplayData {
    collections: MintedBookmarkCollection[]
    totalCount: number
    profileOwner: string
  }