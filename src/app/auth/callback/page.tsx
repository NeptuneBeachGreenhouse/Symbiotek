'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error during auth callback:', error.message);
      }
      router.replace('/');
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#ECF0F3] flex items-center justify-center">
      <div className="text-xl text-gray-600">Completing sign in...</div>
    </div>
  );
}
