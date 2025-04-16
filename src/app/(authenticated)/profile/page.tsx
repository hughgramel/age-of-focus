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
    return <div className="min-h-screen bg-[#0B1423] flex items-center justify-center">
      <div className="text-[#FFD700] text-xl">Loading...</div>
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-[#FFD700]">Account Settings</h1>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-500/50 text-green-200 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Profile Section */}
      <section className="bg-[#162033] p-6 rounded-lg border border-[#FFD700]/25">
        <h2 className="text-xl font-semibold mb-4 text-[#FFD700]">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full rounded-md bg-[#0B1423] border border-[#FFD700]/25 text-white px-3 py-2"
            />
          </div>
          <div className="text-gray-400 text-sm">
            <p>Email: {user.email}</p>
            <p>Account created: {user.createdAt.toLocaleDateString()}</p>
            <p>Last login: {user.lastLogin.toLocaleDateString()}</p>
          </div>
          <button
            onClick={handleUpdateProfile}
            className="px-4 py-2 bg-[#1C2942] text-[#FFD700] rounded hover:bg-[#243756] transition-colors"
          >
            Update Profile
          </button>
        </div>
      </section>

      {/* Email Section */}
      <section className="bg-[#162033] p-6 rounded-lg border border-[#FFD700]/25">
        <h2 className="text-xl font-semibold mb-4 text-[#FFD700]">Update Email</h2>
        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">New Email</label>
            <input
              type="email"
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
              className="mt-1 block w-full rounded-md bg-[#0B1423] border border-[#FFD700]/25 text-white px-3 py-2"
              placeholder="Enter your new email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Current Password</label>
            <input
              type="password"
              value={emailForm.password}
              onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
              className="mt-1 block w-full rounded-md bg-[#0B1423] border border-[#FFD700]/25 text-white px-3 py-2"
              placeholder="Enter your current password"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1C2942] text-[#FFD700] rounded hover:bg-[#243756] transition-colors"
          >
            Update Email
          </button>
        </form>
      </section>

      {/* Password Section */}
      <section className="bg-[#162033] p-6 rounded-lg border border-[#FFD700]/25">
        <h2 className="text-xl font-semibold mb-4 text-[#FFD700]">Change Password</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="mt-1 block w-full rounded-md bg-[#0B1423] border border-[#FFD700]/25 text-white px-3 py-2"
              placeholder="Enter your current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="mt-1 block w-full rounded-md bg-[#0B1423] border border-[#FFD700]/25 text-white px-3 py-2"
              placeholder="Enter your new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="mt-1 block w-full rounded-md bg-[#0B1423] border border-[#FFD700]/25 text-white px-3 py-2"
              placeholder="Confirm your new password"
            />
          </div>
          <p className="text-sm text-gray-400">Password must be at least 6 characters long</p>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1C2942] text-[#FFD700] rounded hover:bg-[#243756] transition-colors"
          >
            Update Password
          </button>
        </form>
      </section>

      {/* Delete Account Section */}
      <section className="bg-[#162033] p-6 rounded-lg border border-red-500/25">
        <h2 className="text-xl font-semibold mb-4 text-red-500">Delete Account</h2>
        <p className="text-gray-300 mb-4">
          This action cannot be undone. Please type "DELETE" to confirm.
        </p>
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={deleteForm.password}
              onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
              className="mt-1 block w-full rounded-md bg-[#0B1423] border border-red-500/25 text-white px-3 py-2"
              placeholder="Enter your password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Type "DELETE" to confirm</label>
            <input
              type="text"
              value={deleteForm.confirmation}
              onChange={(e) => setDeleteForm({ ...deleteForm, confirmation: e.target.value })}
              className="mt-1 block w-full rounded-md bg-[#0B1423] border border-red-500/25 text-white px-3 py-2"
              placeholder='Type "DELETE" to confirm'
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete Account
          </button>
        </form>
      </section>
    </div>
  );
} 