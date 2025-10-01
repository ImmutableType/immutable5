import { MintedBookmarkService, MintedBookmark } from '../blockchain/MintedBookmarkService';

export class GlobalBookmarkFeedService {
  private mintedBookmarkService: MintedBookmarkService;

  constructor() {
    this.mintedBookmarkService = new MintedBookmarkService();
  }

  async initialize() {
    await this.mintedBookmarkService.initializeReadOnly();
  }

  async getRecentGlobalBookmarks(count: number = 5): Promise<MintedBookmark[]> {
    try {
      await this.initialize();

      const totalSupply = await this.mintedBookmarkService.getTotalBookmarksCount();
      
      if (totalSupply === 0) {
        return [];
      }

      // Calculate token IDs to fetch (most recent = highest token IDs)
      const startTokenId = totalSupply;
      const endTokenId = Math.max(1, startTokenId - count + 1);
      
      const bookmarks: MintedBookmark[] = [];

      // Fetch bookmarks in reverse order (newest first)
      for (let tokenId = startTokenId; tokenId >= endTokenId; tokenId--) {
        try {
          const bookmark = await this.mintedBookmarkService.getBookmarkByTokenId(tokenId.toString());
          if (bookmark) {
            bookmarks.push(bookmark);
          }
        } catch (error) {
          console.error(`Failed to fetch bookmark ${tokenId}:`, error);
          // Continue fetching other bookmarks even if one fails
        }
      }

      return bookmarks;
    } catch (error) {
      console.error('Error fetching recent global bookmarks:', error);
      throw error;
    }
  }

  async loadMoreBookmarks(currentCount: number, loadAmount: number = 5): Promise<MintedBookmark[]> {
    try {
      await this.initialize();

      const totalSupply = await this.mintedBookmarkService.getTotalBookmarksCount();
      
      // Calculate next batch of token IDs
      const startTokenId = totalSupply - currentCount;
      const endTokenId = Math.max(1, startTokenId - loadAmount + 1);

      if (startTokenId < 1) {
        return []; // No more bookmarks to load
      }

      const bookmarks: MintedBookmark[] = [];

      for (let tokenId = startTokenId; tokenId >= endTokenId; tokenId--) {
        try {
          const bookmark = await this.mintedBookmarkService.getBookmarkByTokenId(tokenId.toString());
          if (bookmark) {
            bookmarks.push(bookmark);
          }
        } catch (error) {
          console.error(`Failed to fetch bookmark ${tokenId}:`, error);
        }
      }

      return bookmarks;
    } catch (error) {
      console.error('Error loading more bookmarks:', error);
      throw error;
    }
  }
}