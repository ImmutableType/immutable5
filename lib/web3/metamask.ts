import { MetaMaskSDK } from '@metamask/sdk'

// Single shared SDK instance for the entire application
export const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "ImmutableType",
    url: typeof window !== 'undefined' ? window.location.href : 'https://app.immutabletype.com'
  },
  useDeeplink: true,
  preferDesktop: false,
  checkInstallationImmediately: false
})