'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // TODO: Implement wallet connection
    // await walletService.connect()
    // await walletService.switchToFlowEVM()
    
    // Simulate connection delay
    setTimeout(() => {
      router.push('/onboard/verify');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">ImmutableType</h1>
          <p className="mt-2 text-sm text-gray-600">beta</p>
          <p className="mt-4 text-lg text-gray-600">
            Connect your wallet and verify your Farcaster account to get started.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          <div className="text-sm text-gray-500 space-y-2">
            <p>Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>MetaMask or compatible wallet</li>
              <li>Active Farcaster account</li>
              <li>Wallet connected to your Farcaster profile</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}