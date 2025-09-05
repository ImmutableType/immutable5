import { Address, parseEther } from 'viem' // Remove formatEther import
import { writeContract, readContract, waitForTransactionReceipt } from 'wagmi/actions'
import { wagmiConfig } from '../../web3/providers'
import { CONTRACTS, CONFIG, PROFILE_NFT_ABI } from '../../web3/contracts'
import type { ProfileData, ProfileCreationResult, Profile } from '../../types/profile'

export class ProfileNFTService {
  private contractAddress: Address = CONTRACTS.PROFILE_NFT

  /**
   * Create a basic Tier 0 profile
   * Handles fee payment to treasury wallet (if enabled)
   */
  async createBasicProfile(
    profileData: ProfileData,
    userAddress: Address
  ): Promise<ProfileCreationResult> {
    try {
      // Generate DID
      const did = `did:pkh:eip155:${CONFIG.CHAIN_ID}:${userAddress}`
      
      // Prepare profile data for contract
      const contractData = {
        displayName: profileData.displayName,
        bio: profileData.bio,
        location: profileData.location,
        avatarUrl: profileData.avatarUrl
      }

      // Determine if we should pay fee
      const value = CONFIG.ENABLE_TREASURY_FEES ? parseEther('3') : parseEther('0')

      // Write contract transaction
      const hash = await writeContract(wagmiConfig, {
        address: this.contractAddress,
        abi: PROFILE_NFT_ABI,
        functionName: 'createBasicProfile',
        args: [contractData],
        value,
        account: userAddress
      })

      // Wait for confirmation
      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
        confirmations: 1
      })

      // Extract profile ID from logs
      const profileId = this.extractProfileIdFromLogs(receipt.logs)

      return {
        success: true,
        profileId,
        did,
        transactionHash: hash
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get profile data by ID (placeholder)
   */
  async getProfile(profileId: string): Promise<Profile | null> {
    try {
      // TODO: Implement after getting actual contract ABI
      return null
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  /**
   * Check if user owns a profile
   */
  async getUserProfile(userAddress: Address): Promise<Profile | null> {
    try {
      // Check balance first
      const balance = await readContract(wagmiConfig, {
        address: this.contractAddress,
        abi: PROFILE_NFT_ABI,
        functionName: 'balanceOf',
        args: [userAddress]
      })

      if (Number(balance) === 0) {
        return null
      }

      // TODO: Get actual profile data
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  /**
 * Extract profile ID from transaction logs
 */
private extractProfileIdFromLogs(_logs: unknown[]): string {
    // TODO: Implement log parsing after getting actual ABI
    // Look for Transfer event or ProfileCreated event
    return Date.now().toString() // Placeholder
  }

  /**
   * Generate DID for user address
   */
  generateDID(userAddress: Address): string {
    return `did:pkh:eip155:${CONFIG.CHAIN_ID}:${userAddress}`
  }

  /**
   * Get creation fee for display
   */
  getCreationFeeFormatted(): string {
    return CONFIG.ENABLE_TREASURY_FEES ? '3' : '0'
  }

  /**
   * Check if treasury fees are enabled
   */
  isFeeEnabled(): boolean {
    return CONFIG.ENABLE_TREASURY_FEES
  }
}

// Export singleton instance
export const profileNFTService = new ProfileNFTService()