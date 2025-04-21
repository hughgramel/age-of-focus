'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UpdateEmailForm {
  newEmail: string;
  password: string;
}

interface UpdatePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface DeleteAccountForm {
  password: string;
  confirmation: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, updateEmail, updatePassword, deleteAccount, logout } = useAuth();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [emailForm, setEmailForm] = useState<UpdateEmailForm>({ newEmail: '', password: '' });
  const [passwordForm, setPasswordForm] = useState<UpdatePasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [deleteForm, setDeleteForm] = useState<DeleteAccountForm>({ password: '', confirmation: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update display name state when user data loads
  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      setError(null);
      await updateProfile(displayName, user?.photoURL || null);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
      console.error('Profile update error:', err);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.newEmail || !emailForm.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError(null);
      await updateEmail(emailForm.newEmail, emailForm.password);
      setSuccess('Email updated successfully. Please verify your new email.');
      setEmailForm({ newEmail: '', password: '' });
    } catch (err) {
      setError('Failed to update email. Please check your password and try again.');
      console.error('Email update error:', err);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      setError(null);
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Failed to update password. Please check your current password and try again.');
      console.error('Password update error:', err);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteForm.confirmation !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion');
      return;
    }

    try {
      setError(null);
      await deleteAccount(deleteForm.password);
      await logout();
      router.push('/signin');
    } catch (err) {
      setError('Failed to delete account. Please check your password and try again.');
      console.error('Account deletion error:', err);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-[#0B1423] text-xl [font-family:var(--font-mplus-rounded)]">Loading...</div>
    </div>;
  }

  return (
    <div className="max-w-3xl w-full mx-auto p-6 bg-white min-h-screen">
      <div className="bg-white rounded-xl p-8 border-2 border-[#67b9e7]/30 shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)] mb-8">
        <h1 className="text-3xl font-bold text-[#0B1423] text-center mb-6 [font-family:var(--font-mplus-rounded)]">Account Settings</h1>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 px-6 py-3 rounded-lg mb-6 [font-family:var(--font-mplus-rounded)]">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-300 text-green-700 px-6 py-3 rounded-lg mb-6 [font-family:var(--font-mplus-rounded)]">
            {success}
          </div>
        )}

        {/* Profile Section */}
        <section className="bg-white p-6 rounded-lg border-2 border-[#67b9e7]/30 shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)] mb-6">
          <h2 className="text-xl font-semibold mb-4 text-[#0B1423] [font-family:var(--font-mplus-rounded)]">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0B1423]/70 mb-1 [font-family:var(--font-mplus-rounded)]">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="block w-full rounded-md bg-white border-2 border-[#67b9e7]/30 text-[#0B1423] px-4 py-2.5 focus:border-[#67b9e7] focus:outline-none focus:ring-1 focus:ring-[#67b9e7]/50 transition-all [font-family:var(--font-mplus-rounded)]"
              />
            </div>
            <div className="text-[#0B1423]/70 text-sm mt-4 border-t border-[#67b9e7]/20 pt-4 [font-family:var(--font-mplus-rounded)]">
              <p><span className="text-[#0B1423]/50">Email:</span> {user.email}</p>
              <p><span className="text-[#0B1423]/50">Account created:</span> {user.createdAt.toLocaleDateString()}</p>
              <p><span className="text-[#0B1423]/50">Last login:</span> {user.lastLogin.toLocaleDateString()}</p>
            </div>
            <button
              onClick={handleUpdateProfile}
              className="px-6 py-2.5 bg-white text-[#0B1423] rounded-lg border-2 border-[#67b9e7]/40 hover:border-[#67b9e7] hover:bg-gray-50 transition-all duration-200 [font-family:var(--font-mplus-rounded)] tracking-wide shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)]"
            >
              Update Profile
            </button>
          </div>
        </section>

        {/* Email Section */}
        <section className="bg-white p-6 rounded-lg border-2 border-[#67b9e7]/30 shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)] mb-6">
          <h2 className="text-xl font-semibold mb-4 text-[#0B1423] [font-family:var(--font-mplus-rounded)]">Change Email</h2>
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0B1423]/70 mb-1 [font-family:var(--font-mplus-rounded)]">New Email</label>
              <input
                type="email"
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                className="block w-full rounded-md bg-white border-2 border-[#67b9e7]/30 text-[#0B1423] px-4 py-2.5 focus:border-[#67b9e7] focus:outline-none focus:ring-1 focus:ring-[#67b9e7]/50 transition-all [font-family:var(--font-mplus-rounded)]"
                placeholder="Enter your new email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B1423]/70 mb-1 [font-family:var(--font-mplus-rounded)]">Password</label>
              <input
                type="password"
                value={emailForm.password}
                onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                className="block w-full rounded-md bg-white border-2 border-[#67b9e7]/30 text-[#0B1423] px-4 py-2.5 focus:border-[#67b9e7] focus:outline-none focus:ring-1 focus:ring-[#67b9e7]/50 transition-all [font-family:var(--font-mplus-rounded)]"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-white text-[#0B1423] rounded-lg border-2 border-[#67b9e7]/40 hover:border-[#67b9e7] hover:bg-gray-50 transition-all duration-200 [font-family:var(--font-mplus-rounded)] tracking-wide shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)]"
            >
              Update Email
            </button>
          </form>
        </section>

        {/* Password Section */}
        <section className="bg-white p-6 rounded-lg border-2 border-[#67b9e7]/30 shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)] mb-6">
          <h2 className="text-xl font-semibold mb-4 text-[#0B1423] [font-family:var(--font-mplus-rounded)]">Change Password</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0B1423]/70 mb-1 [font-family:var(--font-mplus-rounded)]">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="block w-full rounded-md bg-white border-2 border-[#67b9e7]/30 text-[#0B1423] px-4 py-2.5 focus:border-[#67b9e7] focus:outline-none focus:ring-1 focus:ring-[#67b9e7]/50 transition-all [font-family:var(--font-mplus-rounded)]"
                placeholder="Enter your current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B1423]/70 mb-1 [font-family:var(--font-mplus-rounded)]">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="block w-full rounded-md bg-white border-2 border-[#67b9e7]/30 text-[#0B1423] px-4 py-2.5 focus:border-[#67b9e7] focus:outline-none focus:ring-1 focus:ring-[#67b9e7]/50 transition-all [font-family:var(--font-mplus-rounded)]"
                placeholder="Enter your new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B1423]/70 mb-1 [font-family:var(--font-mplus-rounded)]">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="block w-full rounded-md bg-white border-2 border-[#67b9e7]/30 text-[#0B1423] px-4 py-2.5 focus:border-[#67b9e7] focus:outline-none focus:ring-1 focus:ring-[#67b9e7]/50 transition-all [font-family:var(--font-mplus-rounded)]"
                placeholder="Confirm your new password"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-white text-[#0B1423] rounded-lg border-2 border-[#67b9e7]/40 hover:border-[#67b9e7] hover:bg-gray-50 transition-all duration-200 [font-family:var(--font-mplus-rounded)] tracking-wide shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)]"
            >
              Update Password
            </button>
          </form>
        </section>

        {/* Delete Account Section */}
        <section className="bg-white p-6 rounded-lg border-2 border-red-300 shadow-[4px_4px_0px_0px_rgba(220,38,38,0.2)]">
          <h2 className="text-xl font-semibold mb-4 text-red-600 [font-family:var(--font-mplus-rounded)]">Delete Account</h2>
          <p className="text-[#0B1423]/70 mb-4 [font-family:var(--font-mplus-rounded)]">
            This action cannot be undone. Please type "DELETE" to confirm.
          </p>
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0B1423]/70 mb-1 [font-family:var(--font-mplus-rounded)]">Your Password</label>
              <input
                type="password"
                value={deleteForm.password}
                onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                className="block w-full rounded-md bg-white border-2 border-red-300/30 text-[#0B1423] px-4 py-2.5 focus:border-red-300 focus:outline-none focus:ring-1 focus:ring-red-300/50 transition-all [font-family:var(--font-mplus-rounded)]"
                placeholder="Enter your password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B1423]/70 mb-1 [font-family:var(--font-mplus-rounded)]">Type "DELETE" to confirm</label>
              <input
                type="text"
                value={deleteForm.confirmation}
                onChange={(e) => setDeleteForm({ ...deleteForm, confirmation: e.target.value })}
                className="block w-full rounded-md bg-white border-2 border-red-300/30 text-[#0B1423] px-4 py-2.5 focus:border-red-300 focus:outline-none focus:ring-1 focus:ring-red-300/50 transition-all [font-family:var(--font-mplus-rounded)]"
                placeholder="Type DELETE"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-white text-red-600 rounded-lg border-2 border-red-300 hover:border-red-400 hover:bg-red-50 transition-all duration-200 [font-family:var(--font-mplus-rounded)] tracking-wide shadow-[4px_4px_0px_0px_rgba(220,38,38,0.2)]"
            >
              Delete Account
            </button>
          </form>
        </section>
      </div>
    </div>
  );
} 