import { MetaMaskSDK } from '@metamask/sdk'

// Single shared SDK instance with proper configuration
export const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "ImmutableType",
    url: typeof window !== 'undefined' ? window.location.href : 'https://app.immutabletype.com'
  },
  useDeeplink: true,
  preferDesktop: false,
  checkInstallationImmediately: false,
  // Enable logging to see connection issues
  logging: {
    developerMode: true
  }
})