import { BookmarkNFTService, BookmarkNFT } from '../bookmark/BookmarkNFTService';

export interface MintedBookmarkCollection {
  id: string;
  tokenId: string;
  title: string;
  bookmarks: MintedBookmark[];
  mintedAt: number;
  mintedBy: string;
  transactionHash: string;
  ipfsHash?: string;
}

export interface MintedBookmark {
  tokenId: string;
  title: string;
  url: string;
  description: string;
  creator: string;
  mintedAt: number;
}

export class MintedBookmarkService {
  private bookmarkNFTService: BookmarkNFTService;

  constructor() {
    this.bookmarkNFTService = new BookmarkNFTService();
  }

  async initialize(): Promise<void> {
    await this.bookmarkNFTService.initialize();
  }

    // ADD THIS METHOD HERE:
    async initializeReadOnly(): Promise<void> {
      await this.bookmarkNFTService.initializeReadOnly();
    }

  async getUserMintedBookmarks(userAddress: string): Promise<MintedBookmark[]> {
    try {
      const tokenIds = await this.bookmarkNFTService.getUserBookmarks(userAddress);
      const mintedBookmarks: MintedBookmark[] = [];

      for (const tokenId of tokenIds) {
        const bookmark = await this.bookmarkNFTService.getBookmark(tokenId);
        mintedBookmarks.push({
          tokenId: bookmark.tokenId,
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description,
          creator: bookmark.creator,
          mintedAt: bookmark.createdAt
        });
      }

      return mintedBookmarks.sort((a, b) => b.mintedAt - a.mintedAt);
    } catch (error) {
      console.error('Error fetching user minted bookmarks:', error);
      return [];
    }
  }

  async getTotalBookmarksCount(): Promise<number> {
    try {
      return await this.bookmarkNFTService.totalBookmarks();
    } catch (error) {
      console.error('Error fetching total bookmarks count:', error);
      return 0;
    }
  }

  async isUserQualified(userAddress: string): Promise<boolean> {
    try {
      return await this.bookmarkNFTService.isQualified(userAddress);
    } catch (error) {
      console.error('Error checking user qualification:', error);
      return false;
    }
  }

  async getUserRemainingMints(userAddress: string): Promise<number> {
    try {
      return await this.bookmarkNFTService.getRemainingDailyMints(userAddress);
    } catch (error) {
      console.error('Error fetching remaining mints:', error);
      return 0;
    }
  }

  async getBookmarkByTokenId(tokenId: string): Promise<MintedBookmark | null> {
    try {
      const bookmark = await this.bookmarkNFTService.getBookmark(tokenId);
      return {
        tokenId: bookmark.tokenId,
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        creator: bookmark.creator,
        mintedAt: bookmark.createdAt
      };
    } catch (error) {
      console.error('Error fetching bookmark by token ID:', error);
      return null;
    }
  }
}