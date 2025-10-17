import { ethers, Contract, BrowserProvider } from 'ethers'
import { MMSDK } from '../../web3/metamask'
import { CONTRACTS, TOKEN_QUALIFIER_ABI, BUFFAFLOW_ABI } from '../../web3/contracts'
import type { QualificationStatus } from '../../types/profile'

// FORTE HACKS - Add FROTH constants
const FROTH_ADDRESS = "0xb73bf8e6a4477a952e0338e6cc00cc0ce5ad04ba";
const FROTH_ABI = ["function balanceOf(address) view returns (uint256)"];

export class TokenQualifierService {
  private provider: BrowserProvider | null = null

  async initialize(): Promise<void> {
    // Use shared MetaMask SDK instance
    const sdkProvider = MMSDK.getProvider()
    
    if (!sdkProvider) {
      throw new Error('MetaMask provider not available - please connect wallet first')
    }
    
    this.provider = new ethers.BrowserProvider(sdkProvider)
  }

  // Add timeout wrapper for contract calls
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Contract call timeout after ${timeoutMs}ms`))
      }, timeoutMs)

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeout))
    })
  }

  async checkQualification(userAddress: string): Promise<QualificationStatus> {
    try {
      if (!this.provider) {
        await this.initialize()
      }

      console.log('Checking BUFFAFLOW qualification for:', userAddress)

      // CRITICAL CHANGE: Use the new isQualified function on deployed contract
      const tokenQualifierContract = new ethers.Contract(
        CONTRACTS.TOKEN_QUALIFIER,
        TOKEN_QUALIFIER_ABI,
        this.provider
      )

      // Call the fixed isQualified function
      const isQualified = await this.withTimeout(
        tokenQualifierContract.isQualified(userAddress),
        8000
      )

      console.log('Contract isQualified result:', isQualified); // ADD THIS LINE


      // FORTE HACKS - BOUNTY PENDING
      // Temporary FROTH integration for hackathon demo
      // Full contract integration pending bounty evaluation
      // TO REMOVE: Delete this FROTH block and update UI text

      // FORTE HACKS - BOUNTY PENDING
// Temporary FROTH integration for hackathon demo
// Full contract integration pending bounty evaluation
// TO REMOVE: Delete this FROTH block and update UI text

console.log("FROTH CHECK: Starting FROTH qualification check...");

let frothQualified = false;
if (!isQualified) {
  console.log("FROTH CHECK: Contract not qualified, checking FROTH balance...");
  try {
    const frothContract = new ethers.Contract(FROTH_ADDRESS, FROTH_ABI, this.provider);
    console.log("FROTH CHECK: Contract created, calling balanceOf...");
    const frothBalance = await this.withTimeout(
      frothContract.balanceOf(userAddress),
      5000
    );
    console.log("FROTH CHECK: Raw balance:", frothBalance.toString());
    const requiredFroth = ethers.parseUnits("100", 18); // 100 FROTH tokens
    
    if (frothBalance >= requiredFroth) {
      console.log("✅ User qualified with FROTH tokens:", ethers.formatUnits(frothBalance, 18));
      frothQualified = true;
    } else {
      console.log("FROTH CHECK: Insufficient FROTH balance:", ethers.formatUnits(frothBalance, 18), "FROTH");
    }
  } catch (error) {
    console.log("FROTH check failed:", error);
  }
}
      // END FORTE HACKS

      // Still check BUFFAFLOW for display purposes
      const buffaflowContract = new ethers.Contract(
        CONTRACTS.BUFFAFLOW,
        BUFFAFLOW_ABI,
        this.provider
      )

      // Check token balance for display
      console.log('Checking token balance for display...')
      let formattedBalance = 'N/A'
      let nftCount = 0
      
      try {
        const tokenBalance = await this.withTimeout(
          buffaflowContract.balanceOf(userAddress),
          8000
        )
        formattedBalance = ethers.formatEther(tokenBalance)
        console.log('Token balance:', formattedBalance)
      } catch (error) {
        console.log('Token balance check failed:', error)
      }

      // Try to check NFT balance for display
      try {
        console.log('Checking NFT balance for display...')
        const nftBalance = await this.withTimeout(
          buffaflowContract.erc721BalanceOf(userAddress),
          5000
        )
        nftCount = Number(nftBalance)
        console.log('NFT count:', nftCount)
      } catch (error) {
        console.log('NFT balance check failed:', error)
        nftCount = 0
      }

      // FORTE HACKS - Include FROTH qualification in the result
      const finalQualified = isQualified || frothQualified;

      console.log('Qualification result:', {
        isQualified: finalQualified,
        canBypassFee: finalQualified,
        contractQualified: isQualified,
        frothQualified: frothQualified
      })

      return {
        isQualified: finalQualified,
        tokenBalance: formattedBalance,
        nftCount,
        canBypassFee: finalQualified
      }

    } catch (error) {
      console.error('Error checking qualification:', error)
      
      // Return safe fallback - user will pay fee
      return {
        isQualified: false,
        tokenBalance: 'Check failed',
        nftCount: 0,
        canBypassFee: false
      }
    }
  }

  getQualificationThreshold(): string {
    return '100'
  }

  getQualificationRequirements(): string {
    // FORTE HACKS - Updated for FROTH support
    return 'Hold 100+ $BUFFAFLOW tokens OR 100+ $FROTH tokens OR any $BUFFAFLOW NFT'
  }

  isBuffaflowBypassAvailable(): boolean {
    return true
  }
}

export const tokenQualifierService = new TokenQualifierService()// Force redeploy: Thu Oct 16 12:36:09 EDT 2025
