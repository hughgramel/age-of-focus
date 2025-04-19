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
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-[#FFD700] text-xl">Loading...</div>
    </div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="backdrop-blur-sm bg-[#0B1423]/70 rounded-xl p-8 border border-[#FFD700]/30 shadow-2xl mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#FFD700] text-center mb-6">Account Settings</h1>

        {error && (
          <div className="bg-red-900/30 backdrop-blur-sm border border-red-500/50 text-red-200 px-6 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/30 backdrop-blur-sm border border-green-500/50 text-green-200 px-6 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Profile Section */}
        <section className="bg-[#162033]/90 p-6 rounded-lg border border-[#FFD700]/40 shadow-lg mb-6">
          <h2 className="text-xl font-serif font-semibold mb-4 text-[#FFD700]">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="block w-full rounded-md bg-[#0B1423]/80 border border-[#FFD700]/30 text-white px-4 py-2.5 focus:border-[#FFD700]/60 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/50 transition-all"
              />
            </div>
            <div className="text-gray-300 text-sm mt-4 border-t border-gray-700/50 pt-4">
              <p><span className="text-gray-400">Email:</span> {user.email}</p>
              <p><span className="text-gray-400">Account created:</span> {user.createdAt.toLocaleDateString()}</p>
              <p><span className="text-gray-400">Last login:</span> {user.lastLogin.toLocaleDateString()}</p>
            </div>
            <button
              onClick={handleUpdateProfile}
              className="px-6 py-2.5 bg-[#1C2942]/90 text-[#FFD700] rounded-lg border border-[#FFD700]/40 hover:bg-[#243756] transition-all duration-200 font-serif tracking-wide hover:border-[#FFD700]/70 hover:translate-y-[-1px] shadow-md"
            >
              Update Profile
            </button>
          </div>
        </section>

        {/* Email Section */}
        <section className="bg-[#162033]/90 p-6 rounded-lg border border-[#FFD700]/40 shadow-lg mb-6">
          <h2 className="text-xl font-serif font-semibold mb-4 text-[#FFD700]">Update Email</h2>
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">New Email</label>
              <input
                type="email"
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                className="block w-full rounded-md bg-[#0B1423]/80 border border-[#FFD700]/30 text-white px-4 py-2.5 focus:border-[#FFD700]/60 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/50 transition-all"
                placeholder="Enter your new email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
              <input
                type="password"
                value={emailForm.password}
                onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                className="block w-full rounded-md bg-[#0B1423]/80 border border-[#FFD700]/30 text-white px-4 py-2.5 focus:border-[#FFD700]/60 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/50 transition-all"
                placeholder="Enter your current password"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1C2942]/90 text-[#FFD700] rounded-lg border border-[#FFD700]/40 hover:bg-[#243756] transition-all duration-200 font-serif tracking-wide hover:border-[#FFD700]/70 hover:translate-y-[-1px] shadow-md"
            >
              Update Email
            </button>
          </form>
        </section>

        {/* Password Section */}
        <section className="bg-[#162033]/90 p-6 rounded-lg border border-[#FFD700]/40 shadow-lg mb-6">
          <h2 className="text-xl font-serif font-semibold mb-4 text-[#FFD700]">Change Password</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="block w-full rounded-md bg-[#0B1423]/80 border border-[#FFD700]/30 text-white px-4 py-2.5 focus:border-[#FFD700]/60 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/50 transition-all"
                placeholder="Enter your current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="block w-full rounded-md bg-[#0B1423]/80 border border-[#FFD700]/30 text-white px-4 py-2.5 focus:border-[#FFD700]/60 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/50 transition-all"
                placeholder="Enter your new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="block w-full rounded-md bg-[#0B1423]/80 border border-[#FFD700]/30 text-white px-4 py-2.5 focus:border-[#FFD700]/60 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/50 transition-all"
                placeholder="Confirm your new password"
              />
            </div>
            <p className="text-sm text-gray-400 italic">Password must be at least 6 characters long</p>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1C2942]/90 text-[#FFD700] rounded-lg border border-[#FFD700]/40 hover:bg-[#243756] transition-all duration-200 font-serif tracking-wide hover:border-[#FFD700]/70 hover:translate-y-[-1px] shadow-md"
            >
              Update Password
            </button>
          </form>
        </section>

        {/* Delete Account Section */}
        <section className="bg-[#2C1B1B]/90 p-6 rounded-lg border border-red-500/40 shadow-lg">
          <h2 className="text-xl font-serif font-semibold mb-4 text-red-400">Delete Account</h2>
          <p className="text-gray-300 mb-4">
            This action cannot be undone. Please type "DELETE" to confirm.
          </p>
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Your Password</label>
              <input
                type="password"
                value={deleteForm.password}
                onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                className="block w-full rounded-md bg-[#0B1423]/80 border border-red-500/30 text-white px-4 py-2.5 focus:border-red-500/60 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                placeholder="Enter your password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Type "DELETE" to confirm</label>
              <input
                type="text"
                value={deleteForm.confirmation}
                onChange={(e) => setDeleteForm({ ...deleteForm, confirmation: e.target.value })}
                className="block w-full rounded-md bg-[#0B1423]/80 border border-red-500/30 text-white px-4 py-2.5 focus:border-red-500/60 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                placeholder="Type DELETE"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-900/80 text-white rounded-lg border border-red-500/40 hover:bg-red-800 transition-all duration-200 font-serif tracking-wide hover:border-red-500/70 shadow-md"
            >
              Delete Account
            </button>
          </form>
        </section>
      </div>
    </div>
  );
} 