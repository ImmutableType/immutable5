import { ethers, Contract, BrowserProvider, TransactionReceipt, ContractTransactionResponse, JsonRpcProvider } from 'ethers'
import { MMSDK } from '../../web3/metamask'
import type { ProfileData, ProfileCreationResult } from '../../types/profile'
import { CONTRACTS, PROFILE_NFT_ABI } from '../../web3/contracts'

interface ProfileDisplayData {
  tier: number
  did: string
  displayName: string
  bio: string
  location: string
  avatarUrl: string
  createdAt: number
  isActive: boolean
}

export class ProfileNFTService {
  private contractAddress = CONTRACTS.PROFILE_NFT
  private provider: BrowserProvider | JsonRpcProvider | null = null
  private contract: Contract | null = null
  private isReadOnly = false

  // Read-only initialization for public profile viewing
  async initializeReadOnly(): Promise<void> {
    console.log('ProfileNFT: Initializing read-only service...')
    
    // Use public RPC for read-only operations
    this.provider = new ethers.JsonRpcProvider('https://mainnet.evm.nodes.onflow.org')
    this.contract = new ethers.Contract(
      this.contractAddress,
      PROFILE_NFT_ABI,
      this.provider
    )
    this.isReadOnly = true
    
    console.log('ProfileNFT: Read-only service initialized successfully')
  }

  // Wallet-connected initialization for profile management
  async initialize(): Promise<void> {
    console.log('ProfileNFT: Initializing service...')
    
    const sdkProvider = MMSDK.getProvider()
    console.log('ProfileNFT: SDK provider available:', !!sdkProvider)
    
    if (!sdkProvider) {
      throw new Error('MetaMask provider not available - please connect wallet first')
    }
    
    // Test if provider is actually functional
    try {
      const accounts = await sdkProvider.request({ method: 'eth_accounts' }) as string[]
      console.log('ProfileNFT: Provider accounts check:', accounts)
      
      if (accounts.length === 0) {
        throw new Error('No accounts connected - please reconnect wallet')
      }
    } catch (error) {
      console.error('ProfileNFT: Provider test failed:', error)
      throw new Error('Provider connection test failed - please reconnect wallet')
    }
    
    this.provider = new ethers.BrowserProvider(sdkProvider)
    this.contract = new ethers.Contract(
      this.contractAddress,
      PROFILE_NFT_ABI,
      this.provider
    )
    this.isReadOnly = false
    
    console.log('ProfileNFT: Service initialized successfully')
  }

  async getProfile(profileId: string): Promise<ProfileDisplayData> {
    if (!this.contract) {
      // Default to read-only mode for profile viewing
      await this.initializeReadOnly()
    }

    try {
      const profileData = await this.contract!.getProfile(profileId)
      return {
        tier: Number(profileData.tier),
        did: profileData.did,
        displayName: profileData.displayName,
        bio: profileData.bio,
        location: profileData.location,
        avatarUrl: profileData.avatarUrl,
        createdAt: Number(profileData.createdAt),
        isActive: profileData.isActive
      }
    } catch (error: unknown) {
      const err = error as Error
      throw new Error(`Failed to get profile: ${err.message}`)
    }
  }

  // Get current connected wallet address (only works if wallet-connected)
  async getCurrentAddress(): Promise<string | null> {
    if (this.isReadOnly || !this.provider || this.provider instanceof JsonRpcProvider) {
      return null
    }
    
    try {
      const signer = await (this.provider as BrowserProvider).getSigner()
      return await signer.getAddress()
    } catch {
      return null
    }
  }

  // Check if current user owns a specific profile
  async isProfileOwner(profileId: string): Promise<boolean> {
    if (this.isReadOnly || !this.contract || !this.provider || this.provider instanceof JsonRpcProvider) {
      return false
    }

    try {
      const currentAddress = await this.getCurrentAddress()
      if (!currentAddress) return false

      const ownerAddress = await this.contract.ownerOf(profileId)
      return currentAddress.toLowerCase() === ownerAddress.toLowerCase()
    } catch {
      return false
    }
  }

  // NEW: Check if an address has a profile
  async hasProfile(address: string): Promise<boolean> {
    if (!this.contract) {
      await this.initializeReadOnly()
    }

    try {
      const profileId = await this.contract!.addressToProfileId(address)
      return Number(profileId) > 0
    } catch (error) {
      console.error('Error checking if user has profile:', error)
      return false
    }
  }

  // NEW: Get profile by wallet address
  async getProfileByAddress(address: string): Promise<{ profileId: string } | null> {
    if (!this.contract) {
      await this.initializeReadOnly()
    }

    try {
      const profileId = await this.contract!.addressToProfileId(address)
      const id = Number(profileId)
      
      if (id === 0) {
        return null // No profile exists
      }
      
      return { profileId: id.toString() }
    } catch (error) {
      console.error('Error getting profile by address:', error)
      return null
    }
  }

  private extractProfileIdFromReceipt(receipt: TransactionReceipt): string {
    try {
      // Look for ProfileCreated event in logs
      for (const log of receipt.logs || []) {
        try {
          const parsedLog = this.contract!.interface.parseLog({
            topics: log.topics,
            data: log.data
          })
          
          if (parsedLog && parsedLog.name === 'ProfileCreated') {
            const profileId = parsedLog.args.profileId || parsedLog.args.tokenId
            if (profileId) {
              return profileId.toString()
            }
          }
        } catch {
          continue
        }
      }
      
      // Fallback: Extract from Transfer event
      for (const log of receipt.logs || []) {
        if (log.topics.length >= 4 && log.topics[0].includes('ddf252ad')) {
          const tokenId = log.topics[3]
          if (tokenId) {
            return BigInt(tokenId).toString()
          }
        }
      }
      
      // Final fallback
      return Date.now().toString()
      
    } catch (error) {
      console.error('Profile ID extraction failed:', error)
      return Date.now().toString()
    }
  }

  async createBasicProfile(profileData: ProfileData, address: string): Promise<ProfileCreationResult> {
    try {
      console.log('=== PROFILE CREATION DEBUG START ===')
      console.log('1. Profile data received:', profileData)
      console.log('2. Expected user address:', address)

      // Force re-initialization to ensure fresh provider
      console.log('3. Forcing provider re-initialization...')
      this.provider = null
      this.contract = null
      
      await this.initialize()
      
      console.log('4. Testing network connection...')
      const network = await this.provider!.getNetwork()
      console.log('5. Connected to network:', network.chainId, network.name)
      
      if (network.chainId !== BigInt(747)) {
        return {
          success: false,
          error: `Wrong network: ${network.chainId}. Please switch to Flow EVM Mainnet (747).`
        }
      }

      console.log('6. Getting signer...')
      const signer = await (this.provider as unknown as BrowserProvider).getSigner()
      const userAddress = await signer.getAddress()
      console.log('7. Signer address:', userAddress)

      if (userAddress.toLowerCase() !== address.toLowerCase()) {
        return {
          success: false,
          error: `Address mismatch: expected ${address}, got ${userAddress}`
        }
      }

      const contractWithSigner = this.contract!.connect(signer)
      console.log('8. Contract connected to signer')

      // Try transaction without fee first
      try {
        console.log('9. Attempting transaction WITHOUT fee...')
        const tx = await (contractWithSigner as any).createBasicProfile(
          profileData.displayName || '',
          profileData.bio || '',
          profileData.location || '',
          profileData.avatarUrl || ''
        ) as ContractTransactionResponse
        
        console.log('10. Transaction sent (no fee):', tx.hash)
        const receipt = await tx.wait() as TransactionReceipt
        console.log('11. Transaction confirmed:', receipt.hash)
        
        return {
          success: true,
          profileId: this.extractProfileIdFromReceipt(receipt),
          did: `did:pkh:eip155:747:${userAddress.toLowerCase()}`,
          transactionHash: receipt.hash
        }
        
      } catch (error: unknown) {
        const err = error as Error
        console.log('12. No-fee transaction failed:', err.message)
        console.log('13. Attempting transaction WITH 3 FLOW fee...')
        
        const txWithFee = await (contractWithSigner as any).createBasicProfile(
          profileData.displayName || '',
          profileData.bio || '',
          profileData.location || '',
          profileData.avatarUrl || '',
          { value: ethers.parseEther('3') }
        ) as ContractTransactionResponse
        
        console.log('14. Transaction sent (with fee):', txWithFee.hash)
        const receiptWithFee = await txWithFee.wait() as TransactionReceipt
        console.log('15. Transaction confirmed:', receiptWithFee.hash)
        
        return {
          success: true,
          profileId: this.extractProfileIdFromReceipt(receiptWithFee),
          did: `did:pkh:eip155:747:${userAddress.toLowerCase()}`,
          transactionHash: receiptWithFee.hash
        }
      }

    } catch (error: unknown) {
      const err = error as Error
      console.error('=== PROFILE CREATION FAILED ===')
      console.error('Error details:', err)
      
      if (err.message.includes('user rejected')) {
        return {
          success: false,
          error: 'Transaction cancelled by user'
        }
      }
      
      if (err.message.includes('insufficient funds')) {
        return {
          success: false,
          error: 'Insufficient FLOW tokens for transaction fee'
        }
      }
      
      return {
        success: false,
        error: `Transaction failed: ${err.message}`
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
    } catch (error: unknown) {
      console.error('Error getting profile count:', error)
      return 0
    }
  }

  async canCreateProfile(userAddress: string): Promise<boolean> {
    const count = await this.getProfileCount(userAddress)
    return count === 0
  }
  
  generateDID(address: string): string {
    return `did:pkh:eip155:747:${address.toLowerCase()}`
  }
  
  getCreationFeeFormatted(): string {
    return "3 FLOW"
  }
}

export const profileNFTService = new ProfileNFTService()