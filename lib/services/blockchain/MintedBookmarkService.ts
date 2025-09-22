import { ethers, Contract, JsonRpcProvider } from 'ethers'
import { CONTRACTS, PROFILE_NFT_ABI } from '../../web3/contracts'
import type { MintedBookmarkCollection, MintedBookmarkDisplayData } from '../../types/mintedBookmark'

export class MintedBookmarkService {
  private contractAddress = CONTRACTS.PROFILE_NFT
  private provider: JsonRpcProvider | null = null
  private contract: Contract | null = null

  async initialize(): Promise<void> {
    // Use public RPC for reading minted bookmark data
    this.provider = new ethers.JsonRpcProvider('https://mainnet.evm.nodes.onflow.org')
    this.contract = new ethers.Contract(
      this.contractAddress,
      PROFILE_NFT_ABI,
      this.provider
    )
  }

  async getMintedBookmarksByProfile(profileId: string): Promise<MintedBookmarkDisplayData> {
    if (!this.contract) {
      await this.initialize()
    }

    try {
      // Get profile owner address from the ProfileNFT contract
      const profileOwner = await this.contract!.ownerOf(profileId)
      
      // For now, return empty collections since we haven't implemented bookmark collection contracts yet
      // This provides the data structure for the UI components
      const collections: MintedBookmarkCollection[] = []
      
      // TODO: Query bookmark collection events from blockchain
      // TODO: Parse IPFS metadata for bookmark collections
      // TODO: Filter by profile owner address
      
      return {
        collections,
        totalCount: collections.length,
        profileOwner: profileOwner.toLowerCase()
      }
      
    } catch (error: unknown) {
      const err = error as Error
      console.error('Error fetching minted bookmarks:', err)
      throw new Error(`Failed to get minted bookmarks: ${err.message}`)
    }
  }

  async getMintedBookmarkById(collectionId: string): Promise<MintedBookmarkCollection | null> {
    if (!this.contract) {
      await this.initialize()
    }

    try {
      // TODO: Implement single collection retrieval
      // TODO: Query specific collection metadata from IPFS
      return null
      
    } catch (error: unknown) {
      console.error('Error fetching minted bookmark collection:', error)
      return null
    }
  }

  formatMintDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  generateCollectionUrl(collectionId: string): string {
    return `/collections/${collectionId}`
  }
}

export const mintedBookmarkService = new MintedBookmarkService()