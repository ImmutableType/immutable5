import { useState, useEffect, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Address } from 'viem'
import { profileNFTService } from '../services/profile/ProfileNFT'
import { tokenQualifierService } from '../services/profile/TokenQualifier'
import type { 
  ProfileData, 
  ProfileCreationResult, 
  Profile, 
  TransactionState, 
  QualificationStatus,
  ProfileFormErrors 
} from '../types/profile'

export interface UseProfileReturn {
  // Wallet state
  isConnected: boolean
  address?: Address
  connect: () => void
  disconnect: () => void
  
  // Profile state
  userProfile: Profile | null
  isLoadingProfile: boolean
  
  // Creation state
  creationState: TransactionState
  isCreating: boolean
  
  // Qualification state
  qualificationStatus: QualificationStatus | null
  isCheckingQualification: boolean
  canBypassFee: boolean
  
  // Form validation
  formErrors: ProfileFormErrors
  
  // Actions
  createProfile: (profileData: ProfileData) => Promise<ProfileCreationResult>
  checkQualification: () => Promise<void>
  validateForm: (profileData: ProfileData) => ProfileFormErrors
  clearErrors: () => void
  generateDID: () => string | null
  
  // Helpers
  getCreationFee: () => string
  isFeeRequired: () => boolean
  getQualificationText: () => string
}

export function useProfile(): UseProfileReturn {
  // Wallet connection
  const { address, isConnected } = useAccount()
  const { connect: wagmiConnect, connectors } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()

  // State management
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [creationState, setCreationState] = useState<TransactionState>({ status: 'idle' })
  const [qualificationStatus, setQualificationStatus] = useState<QualificationStatus | null>(null)
  const [isCheckingQualification, setIsCheckingQualification] = useState(false)
  const [formErrors, setFormErrors] = useState<ProfileFormErrors>({})

  // Load user profile when wallet connects
  useEffect(() => {
    if (address && isConnected) {
      loadUserProfile()
      checkQualification()
    } else {
      setUserProfile(null)
      setQualificationStatus(null)
    }
  }, [address, isConnected])

  /**
   * Load user's existing profile
   */
  const loadUserProfile = useCallback(async () => {
    if (!address) return

    setIsLoadingProfile(true)
    try {
      const profile = await profileNFTService.getUserProfile(address)
      setUserProfile(profile)
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setIsLoadingProfile(false)
    }
  }, [address])

  /**
   * Check user's qualification for fee bypass
   */
  const checkQualification = useCallback(async () => {
    if (!address) return

    setIsCheckingQualification(true)
    try {
      const status = await tokenQualifierService.checkQualification(address)
      setQualificationStatus(status)
    } catch (error) {
      console.error('Error checking qualification:', error)
      setQualificationStatus({
        isQualified: false,
        tokenBalance: '0',
        nftCount: 0,
        canBypassFee: false
      })
    } finally {
      setIsCheckingQualification(false)
    }
  }, [address])

  /**
   * Validate profile form data
   */
  const validateForm = useCallback((profileData: ProfileData): ProfileFormErrors => {
    const errors: ProfileFormErrors = {}

    // Display name validation
    if (!profileData.displayName.trim()) {
      errors.displayName = 'Display name is required'
    } else if (profileData.displayName.length < 2) {
      errors.displayName = 'Display name must be at least 2 characters'
    } else if (profileData.displayName.length > 50) {
      errors.displayName = 'Display name must be less than 50 characters'
    }

    // Bio validation
    if (profileData.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters'
    }

    // Location validation
    if (profileData.location.length > 100) {
      errors.location = 'Location must be less than 100 characters'
    }

    // Avatar URL validation
    if (profileData.avatarUrl && profileData.avatarUrl.length > 500) {
      errors.avatarUrl = 'Avatar URL must be less than 500 characters'
    }

    // Basic URL validation if provided
    if (profileData.avatarUrl && profileData.avatarUrl.trim()) {
      try {
        new URL(profileData.avatarUrl)
      } catch {
        errors.avatarUrl = 'Please enter a valid URL'
      }
    }

    return errors
  }, [])

  /**
   * Create a new profile
   */
  const createProfile = useCallback(async (profileData: ProfileData): Promise<ProfileCreationResult> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' }
    }

    // Validate form first
    const errors = validateForm(profileData)
    setFormErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      return { success: false, error: 'Please fix form errors' }
    }

    // Check if user already has a profile
    if (userProfile) {
      return { success: false, error: 'You already have a profile' }
    }

    setCreationState({ status: 'preparing' })

    try {
      // Create the profile
      setCreationState({ status: 'pending' })
      const result = await profileNFTService.createBasicProfile(profileData, address)

      if (result.success) {
        setCreationState({ 
          status: 'success', 
          hash: result.transactionHash 
        })
        
        // Reload user profile
        await loadUserProfile()
        
        return result
      } else {
        setCreationState({ 
          status: 'error', 
          error: result.error 
        })
        return result
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setCreationState({ 
        status: 'error', 
        error: errorMessage 
      })
      return { success: false, error: errorMessage }
    }
  }, [address, userProfile, validateForm, loadUserProfile])

  /**
   * Connect wallet
   */
  const connect = useCallback(() => {
    const injectedConnector = connectors.find(connector => connector.id === 'injected')
    if (injectedConnector) {
      wagmiConnect({ connector: injectedConnector })
    }
  }, [wagmiConnect, connectors])

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(() => {
    wagmiDisconnect()
    setUserProfile(null)
    setQualificationStatus(null)
    setCreationState({ status: 'idle' })
    setFormErrors({})
  }, [wagmiDisconnect])

  /**
   * Clear form errors
   */
  const clearErrors = useCallback(() => {
    setFormErrors({})
    if (creationState.status === 'error') {
      setCreationState({ status: 'idle' })
    }
  }, [creationState.status])

  /**
   * Generate DID for current address
   */
  const generateDID = useCallback((): string | null => {
    if (!address) return null
    return profileNFTService.generateDID(address)
  }, [address])

  /**
   * Get creation fee formatted
   */
  const getCreationFee = useCallback((): string => {
    return profileNFTService.getCreationFeeFormatted()
  }, [])

  /**
   * Check if fee is required (not qualified for bypass)
   */
  const isFeeRequired = useCallback((): boolean => {
    return !qualificationStatus?.canBypassFee && profileNFTService.isFeeEnabled()
  }, [qualificationStatus?.canBypassFee])

  /**
   * Get qualification status text
   */
  const getQualificationText = useCallback((): string => {
    return tokenQualifierService.getQualificationRequirements()
  }, [])

  // Computed values
  const isCreating = creationState.status === 'preparing' || creationState.status === 'pending'
  const canBypassFee = qualificationStatus?.canBypassFee ?? false

  return {
    // Wallet state
    isConnected,
    address,
    connect,
    disconnect,
    
    // Profile state
    userProfile,
    isLoadingProfile,
    
    // Creation state
    creationState,
    isCreating,
    
    // Qualification state
    qualificationStatus,
    isCheckingQualification,
    canBypassFee,
    
    // Form validation
    formErrors,
    
    // Actions
    createProfile,
    checkQualification,
    validateForm,
    clearErrors,
    generateDID,
    
    // Helpers
    getCreationFee,
    isFeeRequired,
    getQualificationText
  }
}