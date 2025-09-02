'use client';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-client';
import Image from 'next/image';

export default function AuthButton() {
  const { user, loading } = useAuth();

  async function handleGoogleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error('Error signing in with Google:', error.message);
      alert('Error signing in with Google. Please try again.');
    }
  }

  async function handleEmailSignIn() {
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
    <div className="flex gap-2">
      <button
        onClick={handleGoogleSignIn}
        className="flex items-center gap-2 px-4 py-2 rounded bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </button>
      <button
        onClick={handleEmailSignIn}
        className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      >
        Email
      </button>
    </div>
  );
}
