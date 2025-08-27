'use client';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-client';
import Image from 'next/image';

export default function AuthButton() {
  const { user, loading } = useAuth();

  async function handleSignIn() {
    // For development, we'll use a magic link sent to email
    const email = prompt('Enter your email for a magic link:');
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error('Error signing in:', error.message);
      alert('Error sending magic link. Please try again.');
    } else {
      alert('Check your email for the magic link!');
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
  }

  if (loading) {
    return <button className="px-4 py-2 rounded bg-gray-200">Loading...</button>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {user.user_metadata?.avatar_url && (
          <Image
            src={user.user_metadata.avatar_url}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <div className="flex flex-col text-sm">
          <span className="font-medium">{user.user_metadata?.full_name}</span>
          <button
            onClick={handleSignOut}
            className="text-red-500 hover:text-red-600 text-left"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
    >
      Sign in with Email
    </button>
  );
}
