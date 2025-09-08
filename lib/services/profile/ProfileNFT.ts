import { ethers } from 'ethers'
import type { ProfileData, ProfileCreationResult } from '../../types/profile'
import { CONTRACTS, PROFILE_NFT_ABI } from '../../web3/contracts'

export class ProfileNFTService {
  private contractAddress = CONTRACTS.PROFILE_NFT
  private provider: ethers.BrowserProvider | null = null
  private contract: ethers.Contract | null = null

  async initialize(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not found')
    }

    this.provider = new ethers.BrowserProvider(window.ethereum)
    this.contract = new ethers.Contract(
      this.contractAddress,
      PROFILE_NFT_ABI,
      this.provider
    )
  }

  async createBasicProfile(profileData: ProfileData, address: string): Promise<ProfileCreationResult> {
    try {
      if (!this.provider || !this.contract) {
        await this.initialize()
      }

      const signer = await this.provider!.getSigner()
      const userAddress = await signer.getAddress()
      const contractWithSigner = this.contract!.connect(signer)

      console.log("=== CONTRACT DEBUG INFO ===")
      console.log("Contract address:", this.contractAddress)
      console.log("User address:", userAddress)
      console.log("Passed address:", address)
      
      try {
        const tokenQualifierAddr = await this.contract!.tokenQualifier()
        console.log("TokenQualifier address:", tokenQualifierAddr)
      } catch (e: any) {
        console.log("Error getting TokenQualifier:", e.message)
      }
      
      try {
        const profileCount = await this.contract!.balanceOf(userAddress)
        console.log("User profile count:", profileCount.toString())
      } catch (e: any) {
        console.log("Error getting profile count:", e.message)
      }

      console.log("Available contract functions:")
      const contractInterface = this.contract!.interface
      const fragments = contractInterface.fragments
      fragments.forEach((fragment: any) => {
        if (fragment.type === 'function') {
          console.log("  -", fragment.name)
        }
      })

      console.log("=== END DEBUG INFO ===")

      // TEST: Try without fee payment first
      console.log("=== ATTEMPTING TRANSACTION WITHOUT FEE ===")
      try {
        const tx = await (contractWithSigner as any).createBasicProfile(
          profileData.displayName || '',
          profileData.bio || '',
          profileData.location || '',
          profileData.avatarUrl || ''
        )
        console.log("Transaction sent (no fee):", tx.hash)
        
        const receipt = await tx.wait()
        console.log("Transaction confirmed:", receipt.transactionHash)
        
        const profileId = receipt.logs?.[0]?.topics?.[3] || '1'
        
        return {
          success: true,
          profileId,
          did: `did:pkh:eip155:545:${userAddress.toLowerCase()}`,
          transactionHash: receipt.transactionHash
        }
        
      } catch (error: any) {
        console.log("Transaction failed without fee:", error.message)
        
        // TEST: Try with fee payment
        console.log("=== ATTEMPTING TRANSACTION WITH 3 FLOW FEE ===")
        try {
          const txWithFee = await (contractWithSigner as any).createBasicProfile(
            profileData.displayName || '',
            profileData.bio || '',
            profileData.location || '',
            profileData.avatarUrl || '',
            { value: ethers.parseEther('3') }
          )
          console.log("Transaction sent (with fee):", txWithFee.hash)
          
          const receiptWithFee = await txWithFee.wait()
          console.log("Transaction confirmed:", receiptWithFee.transactionHash)
          
          const profileId = receiptWithFee.logs?.[0]?.topics?.[3] || '1'
          
          return {
            success: true,
            profileId,
            did: `did:pkh:eip155:545:${userAddress.toLowerCase()}`,
            transactionHash: receiptWithFee.transactionHash
          }
          
        } catch (feeError: any) {
          console.error("Transaction failed with fee:", feeError.message)
          return {
            success: false,
            error: feeError.message
          }
        }
      }

    } catch (error: any) {
      console.error("=== DETAILED TRANSACTION ERROR ===")
      console.error("Full error:", error)
      console.error("Error message:", error.message)
      console.error("Error code:", error.code)
      
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      }
    }
  }

  async getProfileCount(userAddress: string): Promise<number> {
    if (!this.contract) {
      await this.initialize()
    }

    try {
      const count = await this.contract!.balanceOf(userAddress)
      return Number(count)
    } catch (error: any) {
      console.error('Error getting profile count:', error)
      return 0
    }
  }

  async canCreateProfile(userAddress: string): Promise<boolean> {
    const count = await this.getProfileCount(userAddress)
    return count === 0
  }
}

export const profileNFTService = new ProfileNFTService()