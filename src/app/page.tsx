'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual wallet and profile checks
    const checkUserStatus = async () => {
      // Simulate checks - replace with real implementation
      const hasWallet = false; // await walletService.isConnected()
      const hasProfile = false; // await profileService.hasProfile(address)
      
      if (!hasWallet || !hasProfile) {
        router.push('/onboard');
      } else {
        router.push('/reader');
      }
      
      setIsLoading(false);
    };

    checkUserStatus();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading ImmutableType...</p>
        </div>
      </div>
    );
  }

  return null; // Will redirect before rendering
}