// lib/services/FrothComicDailyService.ts
import { ethers } from 'ethers';
import FrothComicDailyABI from '../contracts/FrothComicDaily.json';
import ERC20ABI from '../contracts/ERC20.json';
import type { 
  DailyTemplate, 
  ComicSubmission, 
  ClaimableRewards,
  SubmissionMetadata 
} from '../types/frothComic';

// Get contract addresses with validation
const FROTH_COMIC_ADDRESS = process.env.NEXT_PUBLIC_FROTH_COMIC_ADDRESS;
const FROTH_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_FROTH_TOKEN;
const BUFFAFLOW_ADDRESS = process.env.NEXT_PUBLIC_BUFFAFLOW_ADDRESS;
const FLOW_EVM_RPC = process.env.NEXT_PUBLIC_FLOW_EVM_RPC_URL || 'https://mainnet.evm.nodes.onflow.org';

// Validate addresses on service initialization
if (!FROTH_COMIC_ADDRESS) {
  console.error('❌ NEXT_PUBLIC_FROTH_COMIC_ADDRESS is not set!');
}
if (!FROTH_TOKEN_ADDRESS) {
  console.error('❌ NEXT_PUBLIC_FROTH_TOKEN is not set!');
}
if (!BUFFAFLOW_ADDRESS) {
  console.error('❌ NEXT_PUBLIC_BUFFAFLOW_ADDRESS is not set!');
}

console.log('FrothComicDaily Contract Address:', FROTH_COMIC_ADDRESS);
console.log('FROTH Token Address:', FROTH_TOKEN_ADDRESS);
console.log('BUFFAFLOW Token Address:', BUFFAFLOW_ADDRESS);

export class FrothComicDailyService {
  private contract: ethers.Contract | null = null;
  private readOnlyContract: ethers.Contract | null = null;
  private frothToken: ethers.Contract | null = null;
  private buffaflowToken: ethers.Contract | null = null;

  /**
   * Initialize service with user's wallet for write operations
   */
  async initialize(signer: ethers.Signer): Promise<void> {
    if (!FROTH_COMIC_ADDRESS) {
      throw new Error('FROTH_COMIC_ADDRESS not configured - check environment variables');
    }
    if (!FROTH_TOKEN_ADDRESS) {
      throw new Error('FROTH_TOKEN_ADDRESS not configured - check environment variables');
    }
    if (!BUFFAFLOW_ADDRESS) {
      throw new Error('BUFFAFLOW_ADDRESS not configured - check environment variables');
    }

    this.contract = new ethers.Contract(
      FROTH_COMIC_ADDRESS,
      FrothComicDailyABI.abi,
      signer
    );

    this.frothToken = new ethers.Contract(
      FROTH_TOKEN_ADDRESS,
      ERC20ABI.abi,
      signer
    );

    this.buffaflowToken = new ethers.Contract(
      BUFFAFLOW_ADDRESS,
      ERC20ABI.abi,
      signer
    );

    console.log('✅ FrothComicDailyService initialized with wallet');
  }

  /**
   * Initialize read-only access for public data
   */
  async initializeReadOnly(): Promise<void> {
    if (!FROTH_COMIC_ADDRESS) {
      throw new Error('FROTH_COMIC_ADDRESS not configured - check environment variables');
    }

    const provider = new ethers.JsonRpcProvider(FLOW_EVM_RPC);
    
    this.readOnlyContract = new ethers.Contract(
      FROTH_COMIC_ADDRESS,
      FrothComicDailyABI.abi,
      provider
    );

    console.log('✅ FrothComicDailyService initialized (read-only)');
  }

  /**
   * Get current day ID - reads directly from storage slot 8
   */
  async getCurrentDay(): Promise<number> {
    const provider = new ethers.JsonRpcProvider(FLOW_EVM_RPC);
    
    // genesisTimestamp is in storage slot 8
    const genesisHex = await provider.getStorage(FROTH_COMIC_ADDRESS!, 8);
    const genesisTimestamp = parseInt(genesisHex, 16);
    
    if (genesisTimestamp === 0) {
      return 0;
    }
    
    const TOURNAMENT_DURATION = 20 * 60 * 60 + 5 * 60; // 20 hours 5 minutes in seconds
    const now = Math.floor(Date.now() / 1000);
    
    if (now < genesisTimestamp) {
      return 0;
    }
    
    return Math.floor((now - genesisTimestamp) / TOURNAMENT_DURATION);
  }

/**
 * Get daily template data for a specific day
 * For uninitialized days, calculates expected open/close times
 */
async getDailyTemplate(dayId: number): Promise<DailyTemplate> {
  const contract = this.contract || this.readOnlyContract;
  if (!contract) throw new Error('Service not initialized');

  const template = await contract.getDailyTemplate(dayId);

  // If template is uninitialized (opensAt = 0), calculate expected times
  if (template[3] === BigInt(0)) {
    const provider = new ethers.JsonRpcProvider(FLOW_EVM_RPC);
    const genesisHex = await provider.getStorage(FROTH_COMIC_ADDRESS!, 8);
    const genesisTimestamp = parseInt(genesisHex, 16);
    
    const TOURNAMENT_DURATION = 20 * 60 * 60 + 5 * 60; // 20h 5min
    const OVERLAP_BUFFER = 5 * 60; // 5 min
    
    // Calculate expected times for this day
    const dayStart = genesisTimestamp + (dayId * TOURNAMENT_DURATION);
    const opensAt = BigInt(dayStart - OVERLAP_BUFFER);
    const closesAt = BigInt(dayStart + TOURNAMENT_DURATION);
    
    return {
      characterIds: [0, 0, 0, 0], // Will be randomized on first submit
      backgroundId: 0,
      openTime: opensAt,
      closeTime: closesAt,
      creatorPool: template[6] || BigInt(0),
      voterPool: template[7] || BigInt(0),
      totalEntries: template[5] || BigInt(0),
      finalized: template[11] || false
    };
  }

  // Template is initialized, return actual data
  return {
    characterIds: template[1].map((id: bigint) => Number(id)),
    backgroundId: Number(template[2]),
    openTime: template[3],
    closeTime: template[4],
    creatorPool: template[6],
    voterPool: template[7],
    totalEntries: template[5],
    finalized: template[11]
  };
}

/**
 * Get all submission token IDs for a specific day
 */
async getDaySubmissions(dayId: number): Promise<string[]> {
  const contract = this.contract || this.readOnlyContract;
  if (!contract) throw new Error('Service not initialized');

  const tokenIds = await contract.getDaySubmissions(dayId);
  return tokenIds.map((id: bigint) => id.toString());
}

  /**
   * Get detailed submission data by token ID
   * ✅ FIXED: Updated for new uint256[][] wordIndices format
   */
  async getSubmission(tokenId: string): Promise<ComicSubmission> {
    const contract = this.contract || this.readOnlyContract;
    if (!contract) throw new Error('Service not initialized');

    const submission = await contract.getSubmission(tokenId);

    // Submission struct order after upgrade:
    // 0: tokenId, 1: creator, 2: dayId, 3: characterIds, 
    // 4: backgroundId, 5: wordIndices, 6: votes, 7: timestamp, 8: exists

    return {
      creator: submission[1],
      wordIndices: submission[5].map((panel: bigint[]) => 
        panel.map((idx: bigint) => Number(idx))
      ),
      votes: submission[6],
      timestamp: submission[7],
      characterIds: submission[3].map((id: bigint) => Number(id)),
      backgroundId: Number(submission[4])
    };
  }

  /**
   * Get all submissions with metadata for a day
   */
  async getDaySubmissionsWithMetadata(dayId: number): Promise<SubmissionMetadata[]> {
    const tokenIds = await this.getDaySubmissions(dayId);
    
    const submissions = await Promise.all(
      tokenIds.map(async (tokenId) => {
        const data = await this.getSubmission(tokenId);
        return {
          tokenId,
          creator: data.creator,
          votes: Number(data.votes),
          characterIds: data.characterIds,
          backgroundId: data.backgroundId,
          wordIndices: data.wordIndices,
          timestamp: Number(data.timestamp)
        };
      })
    );

    return submissions;
  }

  /**
   * Check entry fee amount
   */
  async getEntryFee(): Promise<bigint> {
    const contract = this.contract || this.readOnlyContract;
    if (!contract) throw new Error('Service not initialized');

    return await contract.entryFee();
  }

  /**
   * Check vote cost per vote
   */
  async getVoteCost(): Promise<bigint> {
    const contract = this.contract || this.readOnlyContract;
    if (!contract) throw new Error('Service not initialized');

    return await contract.voteCost();
  }

  /**
   * Submit a comic entry (requires ProfileNFT and 100 FROTH)
   */
  async submitEntry(wordIndices: number[][]): Promise<string> {
    if (!this.contract || !this.frothToken) {
      throw new Error('Service not initialized with wallet');
    }

    // Step 1: Get entry fee
    const entryFee = await this.getEntryFee();
    console.log(`📝 Entry fee: ${ethers.formatUnits(entryFee, 18)} FROTH`);

    // Step 2: Approve FROTH spending
    console.log('💰 Approving FROTH...');
    const approveTx = await this.frothToken.approve(FROTH_COMIC_ADDRESS, entryFee);
    await approveTx.wait();
    console.log('✅ FROTH approved');

    // Step 3: Submit entry
    console.log('🎨 Submitting entry...');
    const tx = await this.contract.submitEntry(wordIndices);
    const receipt = await tx.wait();

    // Extract token ID from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = this.contract!.interface.parseLog(log);
        return parsed?.name === 'EntrySubmitted';
      } catch {
        return false;
      }
    });

    if (event) {
      const parsed = this.contract.interface.parseLog(event);
      const tokenId = parsed?.args[0].toString();
      console.log(`✅ Entry submitted! Token ID: ${tokenId}`);
      return tokenId;
    }

    throw new Error('Failed to extract token ID from transaction');
  }

  /**
   * Get remaining votes available for a submission
   */
  async getRemainingVotes(tokenId: string, voterAddress: string): Promise<number> {
    const contract = this.contract || this.readOnlyContract;
    if (!contract) throw new Error('Service not initialized');

    const remaining = await contract.getRemainingVotes(tokenId, voterAddress);
    return Number(remaining);
  }

  /**
   * Vote on a submission (requires BUFFAFLOW)
   */
  async vote(tokenId: string, amount: number): Promise<void> {
    if (!this.contract || !this.buffaflowToken) {
      throw new Error('Service not initialized with wallet');
    }

    // Step 1: Get vote cost
    const voteCost = await this.getVoteCost();
    const totalCost = voteCost * BigInt(amount);
    console.log(`🗳️ Total cost: ${ethers.formatUnits(totalCost, 18)} BUFFAFLOW`);

    // Step 2: Approve BUFFAFLOW spending
    console.log('💰 Approving BUFFAFLOW...');
    const approveTx = await this.buffaflowToken.approve(FROTH_COMIC_ADDRESS, totalCost);
    await approveTx.wait();
    console.log('✅ BUFFAFLOW approved');

    // Step 3: Cast votes
    console.log(`🗳️ Casting ${amount} votes...`);
    const tx = await this.contract.vote(tokenId, amount);
    await tx.wait();
    console.log('✅ Votes cast successfully');
  }

  /**
   * Get claimable rewards for a user on a specific day
   */
  async getClaimableRewards(userAddress: string, dayId: number): Promise<ClaimableRewards> {
    const contract = this.contract || this.readOnlyContract;
    if (!contract) throw new Error('Service not initialized');

    const rewards = await contract.getClaimableRewards(userAddress, dayId);

    return {
      creatorReward: rewards[0],
      voterReward: rewards[1],
      voterClaimed: rewards[2]
    };
  }

  /**
   * Claim creator reward for a specific day
   */
  async claimCreatorReward(dayId: number): Promise<void> {
    if (!this.contract) {
      throw new Error('Service not initialized with wallet');
    }

    console.log(`🏆 Claiming creator reward for day ${dayId}...`);
    const tx = await this.contract.claimCreatorReward(dayId);
    await tx.wait();
    console.log('✅ Creator reward claimed');
  }

  /**
   * Claim voter reward for a specific day
   */
  async claimVoterReward(dayId: number): Promise<void> {
    if (!this.contract) {
      throw new Error('Service not initialized with wallet');
    }

    console.log(`🗳️ Claiming voter reward for day ${dayId}...`);
    const tx = await this.contract.claimVoterReward(dayId);
    await tx.wait();
    console.log('✅ Voter reward claimed');
  }

  /**
   * Claim rewards for multiple days at once
   */
  async claimMultipleDays(dayIds: number[]): Promise<void> {
    if (!this.contract) {
      throw new Error('Service not initialized with wallet');
    }

    console.log(`🎁 Claiming rewards for ${dayIds.length} days...`);
    const tx = await this.contract.claimMultipleDays(dayIds);
    await tx.wait();
    console.log('✅ All rewards claimed');
  }

  /**
   * Check if voting is currently open for a day
   */
  async isVotingOpen(dayId: number): Promise<boolean> {
    const template = await this.getDailyTemplate(dayId);
    const now = BigInt(Math.floor(Date.now() / 1000));
    
    return now >= template.closeTime && !template.finalized;
  }

  /**
   * Check if submissions are currently open for a day
   */
  async isSubmissionOpen(dayId: number): Promise<boolean> {
    const template = await this.getDailyTemplate(dayId);
    const now = BigInt(Math.floor(Date.now() / 1000));
    
    return now >= template.openTime && now < template.closeTime;
  }

  /**
   * Get time remaining until close (in seconds)
   */
  async getTimeUntilClose(dayId: number): Promise<number> {
    const template = await this.getDailyTemplate(dayId);
    const now = BigInt(Math.floor(Date.now() / 1000));
    const remaining = template.closeTime - now;
    
    return Number(remaining > BigInt(0) ? remaining : BigInt(0));
  }
}

// Export singleton instance
export const frothComicService = new FrothComicDailyService();