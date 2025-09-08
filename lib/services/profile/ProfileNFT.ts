import { parseEther, formatEther } from 'viem'
import { writeContract, readContract, waitForTransactionReceipt } from 'wagmi/actions'
import { wagmiConfig } from '../../web3/providers'
import { CONTRACTS, CONFIG } from '../../web3/contracts'
import { PROFILENFT_ABI } from '../../web3/generated-abis'
import type { ProfileData, ProfileCreationResult, Profile } from '../../types/profile'

export class ProfileNFTService {
  private contractAddress = CONTRACTS.PROFILENFT

  /**
   * Create a basic Tier 0 profile
   */
  async createBasicProfile(
    profileData: ProfileData,
    userAddress: string,
    canBypassFee: boolean = false
  ): Promise<ProfileCreationResult> {
    try {
      // Generate DID
      const did = `did:pkh:eip155:${CONFIG.CHAIN_ID}:${userAddress}`
      
      // Prepare profile data for contract (must match ABI structure)
      const contractData = {
        displayName: profileData.displayName,
        bio: profileData.bio,
        location: profileData.location,
        avatarUrl: profileData.avatarUrl,
        did: did
      }

      // Determine fee (3 FLOW or 0 if qualified)
      const feeAmount = canBypassFee ? parseEther('0') : parseEther('3')

      console.log('Creating profile with data:', contractData)
      console.log('Fee amount:', formatEther(feeAmount), 'FLOW')

      // Write contract transaction
      const hash = await writeContract(wagmiConfig, {
        address: this.contractAddress,
        abi: PROFILENFT_ABI,
        functionName: 'createBasicProfile',
        args: [contractData],
        value: feeAmount,
        account: userAddress as `0x${string}`
      })

      console.log('Transaction submitted:', hash)

      // Wait for confirmation
      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
        confirmations: 1
      })

      console.log('Transaction confirmed:', receipt)

      // Extract profile ID from transaction receipt
      const profileId = this.extractProfileIdFromReceipt(receipt)

      return {
        success: true,
        profileId,
        did,
        transactionHash: hash
      }

    } catch (error: any) {
      console.error('Profile creation error:', error)
      
      // Parse common error messages
      let errorMessage = 'Unknown error occurred'
      
      if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient FLOW balance. You need at least 3 FLOW plus gas fees.'
      } else if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user.'
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection to Flow EVM testnet.'
      } else if (error.shortMessage) {
        errorMessage = error.shortMessage
      } else if (error.message) {
        errorMessage = error.message
      }

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Extract profile ID from transaction receipt
   */
  private extractProfileIdFromReceipt(receipt: any): string {
    try {
      // Look for Transfer event logs
      const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      
      for (const log of receipt.logs) {
        if (log.topics[0] === transferTopic && log.address.toLowerCase() === this.contractAddress.toLowerCase()) {
          const tokenId = BigInt(log.topics[3]).toString()
          console.log('Extracted profile ID:', tokenId)
          return tokenId
        }
      }
      
      console.warn('No Transfer event found, using timestamp fallback')
      return Date.now().toString()
      
    } catch (error) {
      console.error('Error extracting profile ID:', error)
      return Date.now().toString()
    }
  }

  /**
   * Generate DID for user address
   */
  generateDID(userAddress: string): string {
    return `did:pkh:eip155:${CONFIG.CHAIN_ID}:${userAddress}`
  }

  /**
   * Get creation fee for display
   */
  getCreationFeeFormatted(): string {
    return '3'
  }
}

export const profileNFTService = new ProfileNFTService()