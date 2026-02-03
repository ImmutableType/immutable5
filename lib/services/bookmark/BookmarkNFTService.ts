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
  private readOnlyContract: ethers.Contract | null = null;

  // Accepts optional provider to support both MetaMask and Flow Wallet
  async initialize(provider?: ethers.BrowserProvider): Promise<void> {
    if (provider) {
      // Use provided provider (from unified wallet hook)
      console.log('BookmarkNFTService: Using provided provider (unified wallet)');
      this.provider = provider;
    } else {
      // Fall back to window.ethereum for backward compatibility
      console.log('BookmarkNFTService: Using window.ethereum provider');
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Wallet provider not available - please connect wallet first');
      }
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
    
    const signer = await this.provider.getSigner();
    this.contract = new ethers.Contract(CONTRACTS.BOOKMARK_NFT, BOOKMARK_NFT_ABI, signer);
    
    // Also create read-only contract for public data
    await this.initializeReadOnly();
  }

  async initializeReadOnly(): Promise<void> {
    // Use Flow EVM RPC for read-only operations
    const readOnlyProvider = new ethers.JsonRpcProvider('https://mainnet.evm.nodes.onflow.org');
    this.readOnlyContract = new ethers.Contract(CONTRACTS.BOOKMARK_NFT, BOOKMARK_NFT_ABI, readOnlyProvider);
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
    const contract = this.readOnlyContract || this.contract;
    if (!contract) {
      await this.initializeReadOnly();
      if (!this.readOnlyContract) throw new Error('Contract not initialized');
    }
    
    try {
      console.log('Fetching bookmarks for address:', userAddress);
      console.log('Using contract:', CONTRACTS.BOOKMARK_NFT);
      
      const tokenIds = await (this.readOnlyContract || this.contract!).getUserBookmarks(userAddress);
      console.log('Raw token IDs from contract:', tokenIds);
      
      // Convert BigInt to string if needed
      const stringIds = tokenIds.map((id: any) => id.toString());
      console.log('Converted token IDs:', stringIds);
      
      return stringIds;
    } catch (error) {
      console.error('Error fetching user bookmarks:', error);
      throw error;
    }
  }

  async getBookmark(tokenId: string): Promise<BookmarkNFT> {
    const contract = this.readOnlyContract || this.contract;
    if (!contract) {
      await this.initializeReadOnly();
      if (!this.readOnlyContract) throw new Error('Contract not initialized');
    }
    
    try {
      console.log('Fetching bookmark for token ID:', tokenId);
      const bookmark = await (this.readOnlyContract || this.contract!).getBookmark(tokenId);
      console.log('Raw bookmark data:', bookmark);
      
      return {
        tokenId,
        title: bookmark[0], // title is first element
        url: bookmark[1],   // url is second element  
        description: bookmark[2], // description is third element
        creator: bookmark[3], // creator is fourth element
        createdAt: Number(bookmark[4]) // createdAt is fifth element
      };
    } catch (error) {
      console.error('Error fetching bookmark:', error);
      throw error;
    }
  }

  async isQualified(userAddress: string): Promise<boolean> {
    const contract = this.readOnlyContract || this.contract;
    if (!contract) {
      await this.initializeReadOnly();
      if (!this.readOnlyContract) throw new Error('Contract not initialized');
    }
    
    try {
      return await (this.readOnlyContract || this.contract!).isQualified(userAddress);
    } catch (error) {
      console.error('Error checking qualification:', error);
      return false;
    }
  }

  async getRemainingDailyMints(userAddress: string): Promise<number> {
    const contract = this.readOnlyContract || this.contract;
    if (!contract) {
      await this.initializeReadOnly();
      if (!this.readOnlyContract) throw new Error('Contract not initialized');
    }
    
    try {
      const remaining = await (this.readOnlyContract || this.contract!).getRemainingDailyMints(userAddress);
      return Number(remaining);
    } catch (error) {
      console.error('Error fetching remaining mints:', error);
      return 20; // Default daily limit
    }
  }

  async totalBookmarks(): Promise<number> {
    const contract = this.readOnlyContract || this.contract;
    if (!contract) {
      await this.initializeReadOnly();
      if (!this.readOnlyContract) throw new Error('Contract not initialized');
    }
    
    try {
      const total = await (this.readOnlyContract || this.contract!).totalBookmarks();
      console.log('Total bookmarks from contract:', total);
      return Number(total);
    } catch (error) {
      console.error('Error fetching total bookmarks:', error);
      return 0;
    }
  }
}