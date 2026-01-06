// lib/services/FrothComicService.ts
import { ethers } from 'ethers';

const CONTRACTS = {
  TOURNAMENT: process.env.NEXT_PUBLIC_FROTH_TOURNAMENT_ADDRESS!,
  COMIC_NFT: process.env.NEXT_PUBLIC_COMIC_NFT_ADDRESS!,
  FROTH: process.env.NEXT_PUBLIC_FROTH_TOKEN_ADDRESS || '0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA',
  BUFFAFLOW: process.env.NEXT_PUBLIC_BUFFAFLOW_ADDRESS!,
  PROFILE_NFT: process.env.NEXT_PUBLIC_PROFILE_NFT_ADDRESS!,
};

const TOURNAMENT_ABI = [
  "function getCurrentDay() view returns (uint256)",
  "function enterTournament(uint256 dayId)",
  "function getEntryCount(uint256 dayId, address user) view returns (uint256)",
  "function hasEntered(uint256 dayId, address user) view returns (bool)",
  "function vote(uint256 comicTokenId, uint256 buffaflowAmount)",
  "function claimVoterReward(uint256 dayId)",
  "function getCreatorReward(uint256 dayId, address user) view returns (uint256)",
  "function claimCreatorReward(uint256 dayId)",
  "function getDayInfo(uint256 dayId) view returns (uint256 startTime, uint256 endTime, uint256 finalizationTime, uint256 creatorPool, uint256 voterPool, uint256 totalVotes, bool submissionOpen, bool votingOpen, bool finalized, uint256 secondsUntilNextPhase)",
  "function getVoterReward(uint256 dayId, address user) view returns (uint256)",
  "function getUserVotesOnComic(uint256 comicTokenId, address user) view returns (uint256)",
  "function comicVotes(uint256 tokenId) view returns (uint256)",
  "function getDayWinners(uint256 dayId) view returns (tuple(address creator, uint256 tokenId, uint256 reward, uint256 rank)[])"
];

const COMIC_NFT_ABI = [
  "function mintComic(uint256 dayId, uint256[] characterIds, uint256 backgroundId, uint256 wordCloudId, uint256[][] wordIndices) returns (uint256)",
  "function getComic(uint256 tokenId) view returns (address creator, uint256 dayId, uint256 timestamp, uint256[] memory characterIds, uint256 backgroundId, uint256 wordCloudId, uint256[][] memory wordIndices)",
  "function getDayComics(uint256 dayId) view returns (uint256[])",
  "function getUserComicsForDay(uint256 dayId, address user) view returns (uint256)",
  "function totalSupply() view returns (uint256)"
];

const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

export interface DayInfo {
  startTime: Date;
  endTime: Date;
  finalizationTime: Date;
  creatorPool: string;
  voterPool: string;
  totalVotes: number;
  submissionOpen: boolean;
  votingOpen: boolean;
  finalized: boolean;
  secondsUntilNextPhase: number;
}

export interface Comic {
  tokenId: string;
  creator: string;
  dayId: number;
  timestamp: number;
  characterIds: number[];
  backgroundId: number;
  wordCloudId: number;
  wordIndices: number[][];
  votes: number;
}

export interface ComicSlotInfo {
  tournamentEntries: number;
  comicsSubmitted: number;
  comicsRemaining: number;
  maxAllowed: number;
}

export class FrothComicService {
  private signer: ethers.Signer | null = null;
  private tournament: ethers.Contract | null = null;
  private comicNFT: ethers.Contract | null = null;
  private frothToken: ethers.Contract | null = null;
  private buffaflowToken: ethers.Contract | null = null;
  
  private readOnlyProvider: ethers.JsonRpcProvider;
  private readOnlyTournament: ethers.Contract;
  private readOnlyComicNFT: ethers.Contract;
  
  constructor() {
    this.readOnlyProvider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_FLOW_EVM_RPC_URL
    );
    
    this.readOnlyTournament = new ethers.Contract(
      CONTRACTS.TOURNAMENT,
      TOURNAMENT_ABI,
      this.readOnlyProvider
    );
    
    this.readOnlyComicNFT = new ethers.Contract(
      CONTRACTS.COMIC_NFT,
      COMIC_NFT_ABI,
      this.readOnlyProvider
    );
  }
  
  async initialize(signer: ethers.Signer) {
    this.signer = signer;
    
    this.tournament = new ethers.Contract(
      CONTRACTS.TOURNAMENT,
      TOURNAMENT_ABI,
      signer
    );
    
    this.comicNFT = new ethers.Contract(
      CONTRACTS.COMIC_NFT,
      COMIC_NFT_ABI,
      signer
    );
    
    this.frothToken = new ethers.Contract(
      CONTRACTS.FROTH,
      ERC20_ABI,
      signer
    );
    
    this.buffaflowToken = new ethers.Contract(
      CONTRACTS.BUFFAFLOW,
      ERC20_ABI,
      signer
    );
  }
  
  // ===== READ-ONLY QUERIES =====
  
  async getCurrentDay(): Promise<number> {
    return Number(await this.readOnlyTournament.getCurrentDay());
  }
  
  async getDayInfo(dayId: number): Promise<DayInfo> {
    const info = await this.readOnlyTournament.getDayInfo(dayId);
    
    return {
      startTime: new Date(Number(info.startTime) * 1000),
      endTime: new Date(Number(info.endTime) * 1000),
      finalizationTime: new Date(Number(info.finalizationTime) * 1000),
      creatorPool: ethers.formatEther(info.creatorPool),
      voterPool: ethers.formatEther(info.voterPool),
      totalVotes: Number(ethers.formatEther(info.totalVotes)),
      submissionOpen: info.submissionOpen,
      votingOpen: info.votingOpen,
      finalized: info.finalized,
      secondsUntilNextPhase: Number(info.secondsUntilNextPhase)
    };
  }
  
  async hasEntered(dayId: number, address: string): Promise<boolean> {
    return await this.readOnlyTournament.hasEntered(dayId, address);
  }
  
  async getEntryCount(dayId: number, address: string): Promise<number> {
    return Number(await this.readOnlyTournament.getEntryCount(dayId, address));
  }
  
  async getUserComicsCount(dayId: number, address: string): Promise<number> {
    return Number(await this.readOnlyComicNFT.getUserComicsForDay(dayId, address));
  }
  
  async getComicSlotInfo(dayId: number, address: string): Promise<ComicSlotInfo> {
    const tournamentEntries = await this.getEntryCount(dayId, address);
    const comicsSubmitted = await this.getUserComicsCount(dayId, address);
    const maxAllowed = tournamentEntries * 5;
    const comicsRemaining = maxAllowed - comicsSubmitted;
    
    return {
      tournamentEntries,
      comicsSubmitted,
      comicsRemaining,
      maxAllowed
    };
  }




  
  async getVoterReward(dayId: number, address: string): Promise<string> {
    const reward = await this.readOnlyTournament.getVoterReward(dayId, address);
    return ethers.formatEther(reward);
  }

  async getCreatorReward(dayId: number, address: string): Promise<string> {
    const reward = await this.readOnlyTournament.getCreatorReward(dayId, address);
    return ethers.formatEther(reward);
  }
  
  async claimCreatorReward(dayId: number) {
    if (!this.tournament) {
      throw new Error('Tournament contract not initialized');
    }
  
    try {
      const tx = await this.tournament.claimCreatorReward(dayId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error claiming creator reward:', error);
      throw error;
    }
  }
  
  async getUserVotesOnComic(tokenId: string, address: string): Promise<string> {
    const votes = await this.readOnlyTournament.getUserVotesOnComic(tokenId, address);
    return ethers.formatEther(votes);
  }



  
  async getDayComics(dayId: number): Promise<Comic[]> {
    const tokenIds = await this.readOnlyComicNFT.getDayComics(dayId);
    const comics: Comic[] = [];
    
    for (const tokenId of tokenIds) {
      const [creator, day, timestamp, characterIds, backgroundId, wordCloudId, wordIndices] = 
        await this.readOnlyComicNFT.getComic(tokenId);
      const votes = await this.readOnlyTournament.comicVotes(tokenId);
      
      comics.push({
        tokenId: tokenId.toString(),
        creator,
        dayId: Number(day),
        timestamp: Number(timestamp),
        characterIds: characterIds.map((id: any) => Number(id)),
        backgroundId: Number(backgroundId),
        wordCloudId: Number(wordCloudId),
        wordIndices: wordIndices.map((panel: any) => panel.map((idx: any) => Number(idx))),
        votes: Number(ethers.formatEther(votes))
      });
    }
    
    return comics.sort((a, b) => b.votes - a.votes);
  }
  
  // ===== WRITE OPERATIONS =====
  
  async enterTournament(dayId: number) {
    if (!this.tournament || !this.frothToken) {
      throw new Error("Not initialized with signer");
    }
    
    const entryFee = ethers.parseEther("100");
    const allowance = await this.frothToken.allowance(
      await this.signer!.getAddress(),
      CONTRACTS.TOURNAMENT
    );
    
    if (allowance < entryFee) {
      const approveTx = await this.frothToken.approve(CONTRACTS.TOURNAMENT, entryFee);
      await approveTx.wait();
    }
    
    const tx = await this.tournament.enterTournament(dayId);
    await tx.wait();
  }
  
  async mintComic(
    dayId: number,
    characterIds: number[],
    backgroundId: number,
    wordCloudId: number,
    wordIndices: number[][]
  ): Promise<string> {
    if (!this.comicNFT) {
      throw new Error("Not initialized with signer");
    }
    
    const tx = await this.comicNFT.mintComic(dayId, characterIds, backgroundId, wordCloudId, wordIndices);
    const receipt = await tx.wait();
    
    const event = receipt.logs.find((log: any) => 
      log.topics[0] === ethers.id("ComicMinted(address,uint256,uint256,uint256[],uint256,uint256)")
    );
    
    if (event) {
      return ethers.toBigInt(event.topics[2]).toString();
    }
    
    throw new Error("Failed to get tokenId from mint transaction");
  }
  
  async vote(tokenId: string, buffaflowAmount: string) {
    if (!this.tournament || !this.buffaflowToken) {
      throw new Error("Not initialized with signer");
    }
    
    const amount = ethers.parseEther(buffaflowAmount);
    const allowance = await this.buffaflowToken.allowance(
      await this.signer!.getAddress(),
      CONTRACTS.TOURNAMENT
    );
    
    if (allowance < amount) {
      const approveTx = await this.buffaflowToken.approve(CONTRACTS.TOURNAMENT, amount);
      await approveTx.wait();
    }
    
    const tx = await this.tournament.vote(tokenId, amount);
    await tx.wait();
  }
  
  async claimVoterReward(dayId: number) {
    if (!this.tournament) {
      throw new Error("Not initialized with signer");
    }
    
    const tx = await this.tournament.claimVoterReward(dayId);
    await tx.wait();
  }
  
  async getFrothBalance(address: string): Promise<string> {
    const contract = new ethers.Contract(
      CONTRACTS.FROTH,
      ERC20_ABI,
      this.readOnlyProvider
    );
    
    const balance = await contract.balanceOf(address);
    return ethers.formatEther(balance);
  }
  
  async getBuffaflowBalance(address: string): Promise<string> {
    const contract = new ethers.Contract(
      CONTRACTS.BUFFAFLOW,
      ERC20_ABI,
      this.readOnlyProvider
    );
    
    const balance = await contract.balanceOf(address);
    return ethers.formatEther(balance);
  }
}

export const frothComicService = new FrothComicService();