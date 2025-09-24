import { ethers } from 'ethers';
import { CONTRACTS, BOOKMARK_NFT_ABI } from '../../web3/contracts';

export interface BookmarkData {
  title: string;
  url: string;
  description: string;
}

export interface BookmarkNFT {
  tokenId: string;
  title: string;
  url: string;
  description: string;
  creator: string;
  createdAt: number;
}

export class BookmarkNFTService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;

  async initialize(): Promise<void> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not available');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await this.provider.getSigner();
    this.contract = new ethers.Contract(CONTRACTS.BOOKMARK_NFT, BOOKMARK_NFT_ABI, signer);
  }

  async mintBookmarks(bookmarks: BookmarkData[]): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const titles = bookmarks.map(b => b.title);
    const urls = bookmarks.map(b => b.url);
    const descriptions = bookmarks.map(b => b.description);
    
    const mintFee = ethers.parseEther('0.025'); // 0.025 FLOW
    
    const tx = await this.contract.mintBookmarks(titles, urls, descriptions, {
      value: mintFee
    });
    
    return tx.hash;
  }

  async getUserBookmarks(userAddress: string): Promise<string[]> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getUserBookmarks(userAddress);
  }

  async getBookmark(tokenId: string): Promise<BookmarkNFT> {
    if (!this.contract) throw new Error('Contract not initialized');
    const bookmark = await this.contract.getBookmark(tokenId);
    
    return {
      tokenId,
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      creator: bookmark.creator,
      createdAt: Number(bookmark.createdAt)
    };
  }

  async isQualified(userAddress: string): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.isQualified(userAddress);
  }

  async getRemainingDailyMints(userAddress: string): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    const remaining = await this.contract.getRemainingDailyMints(userAddress);
    return Number(remaining);
  }

  async totalBookmarks(): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    const total = await this.contract.totalBookmarks();
    return Number(total);
  }
}