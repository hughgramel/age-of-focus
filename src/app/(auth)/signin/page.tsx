'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FirebaseError } from 'firebase/app';

type AuthMode = 'signin' | 'signup';

interface AuthForm {
  email: string;
  password: string;
  displayName?: string;
}

// Firebase error code to user-friendly message mapping with action guidance
const getErrorMessage = (error: FirebaseError, mode: AuthMode) => {
  const commonMessages: Record<string, { message: string; action?: string }> = {
    'auth/invalid-credential': {
      message: 'Invalid email or password.',
      action: mode === 'signin' ? 'Please try again or create a new account.' : undefined
    },
    'auth/user-not-found': {
      message: 'No account found with this email.',
      action: 'Would you like to create a new account?'
    },
    'auth/wrong-password': {
      message: 'Incorrect password.',
      action: 'Please try again or reset your password.'
    },
    'auth/email-already-in-use': {
      message: 'An account already exists with this email.',
      action: 'Please sign in instead.'
    },
    'auth/weak-password': {
      message: 'Password should be at least 6 characters long.',
      action: 'Please choose a stronger password.'
    },
    'auth/invalid-email': {
      message: 'Please enter a valid email address.',
    },
    'auth/network-request-failed': {
      message: 'Network error.',
      action: 'Please check your internet connection and try again.'
    },
    'auth/too-many-requests': {
      message: 'Too many failed attempts.',
      action: 'Please try again later or reset your password.'
    },
  };

  const errorInfo = commonMessages[error.code] || {
    message: 'An error occurred.',
    action: 'Please try again.'
  };

  return errorInfo;
};

export default function SignInPage() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; action?: string } | null>(null);
  const [form, setForm] = useState<AuthForm>({
    email: '',
    password: '',
    displayName: '',
  });

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(form.email, form.password);
      } else {
        if (!form.displayName) {
          throw new Error('Please enter a display name');
        }
        if (form.password.length < 6) {
          setError({
            message: 'Password is too short.',
            action: 'Password must be at least 6 characters long.'
          });
          return;
        }
        await signUp(form.email, form.password, form.displayName);
      }
      router.push('/dashboard');
    } catch (err) {
      console.error('Authentication error:', err);
      if (err instanceof FirebaseError) {
        setError(getErrorMessage(err, mode));
      } else if (err instanceof Error) {
        setError({ message: err.message });
      } else {
        setError({ 
          message: 'An unexpected error occurred',
          action: 'Please try again or contact support.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      console.error('Google sign-in error:', err);
      if (err instanceof FirebaseError) {
        setError(getErrorMessage(err, mode));
      } else {
        setError({ 
          message: 'An error occurred during Google sign-in',
          action: 'Please try again or use email sign-in.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // If user is already authenticated, show loading state
  if (user) {
    return <div className="min-h-screen bg-[#0B1423] flex items-center justify-center">
      <div className="text-[#FFD700] text-xl">Redirecting to dashboard...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#0B1423] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[#FFD700] mb-2 font-serif">Age of Focus</h1>
          <h2 className="text-xl text-gray-400">
            {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {mode === 'signup' && (
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required={mode === 'signup'}
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-[#FFD700]/25 bg-[#162033] text-white placeholder-gray-400 focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] focus:z-10 sm:text-sm"
                placeholder="Enter your display name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-[#FFD700]/25 bg-[#162033] text-white placeholder-gray-400 focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] focus:z-10 sm:text-sm"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-[#FFD700]/25 bg-[#162033] text-white placeholder-gray-400 focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] focus:z-10 sm:text-sm"
              placeholder={mode === 'signin' ? 'Enter your password' : 'Create a password'}
            />
            {mode === 'signup' && (
              <p className="mt-1 text-sm text-gray-400">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          {/* Error Message with Action Guidance */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-md p-4">
              <div className="text-red-200 text-sm font-medium">
                {error.message}
              </div>
              {error.action && (
                <div className="mt-1 text-red-200/80 text-sm">
                  {error.action}
                </div>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[#0B1423] bg-[#FFD700] hover:bg-[#FFD700]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700] ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Processing...' : mode === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#FFD700]/25"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#0B1423] text-gray-400">Or continue with</span>
          </div>
        </div>

        {/* Google Sign In */}
        <div>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 border border-[#FFD700]/25 rounded-md shadow-sm text-sm font-medium text-white bg-[#162033] hover:bg-[#1C2942] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700]"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
              setForm({ email: '', password: '', displayName: '' });
            }}
            className="text-[#FFD700] hover:text-[#FFD700]/80"
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
} 