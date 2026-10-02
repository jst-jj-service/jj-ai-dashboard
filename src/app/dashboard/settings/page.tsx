'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { ApiClient } from '../../../lib/api-client';
import { formatDate } from '../../../lib/utils';
import {
  Settings,
  Lock,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  Key,
  Terminal,
  Copy,
  Check
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [copiedUrl, setCopiedUrl] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await ApiClient.auth.changePassword({
        currentPassword,
        newPassword
      });

      if (res.data?.success) {
        setPasswordSuccess('Your password has been successfully updated.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'An error occurred while updating your password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const copyBaseUrl = () => {
    const isRemote = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const url = process.env.NEXT_PUBLIC_API_URL || (isRemote ? 'https://jj-ai-gateway.onrender.com' : 'http://localhost:3001');
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-primary-400" />
          <span>Account Settings & Security</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account credentials, security preferences, and view system integration parameters.
        </p>
      </div>

      {/* Account Details Card */}
      <div className="bg-surface border border-surfaceBorder rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-primary-400">
          <User className="w-5 h-5" />
          <h2 className="text-base font-bold text-slate-100">Account Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-3.5 rounded-xl bg-background border border-surfaceBorder">
            <div className="text-xs text-slate-400">Email Address</div>
            <div className="text-slate-100 font-medium mt-1">{user?.email || 'Loading...'}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-surfaceBorder">
            <div className="text-xs text-slate-400">Display Name</div>
            <div className="text-slate-100 font-medium mt-1">{user?.name || 'Not provided'}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-surfaceBorder">
            <div className="text-xs text-slate-400">Role & Access</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                user?.role === 'ADMIN'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
              }`}>
                {user?.role || 'USER'}
              </span>
              <span className="text-xs text-slate-400">Full Gateway Access</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-surfaceBorder">
            <div className="text-xs text-slate-400">Account ID</div>
            <div className="text-slate-400 font-mono text-xs mt-1 truncate">{user?.id || '—'}</div>
          </div>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="bg-surface border border-surfaceBorder rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-primary-400">
          <Lock className="w-5 h-5" />
          <h2 className="text-base font-bold text-slate-100">Change Password</h2>
        </div>

        {passwordError && (
          <div className="flex items-center justify-between p-3.5 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
            <button onClick={() => setPasswordError(null)} className="text-rose-400 hover:text-rose-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {passwordSuccess && (
          <div className="flex items-center justify-between p-3.5 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
            <button onClick={() => setPasswordSuccess(null)} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2 rounded-lg bg-background border border-surfaceBorder text-slate-100 text-sm focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2 rounded-lg bg-background border border-surfaceBorder text-slate-100 text-sm focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-3.5 py-2 rounded-lg bg-background border border-surfaceBorder text-slate-100 text-sm focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={updatingPassword}
              className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Gateway API Endpoint Information */}
      <div className="bg-surface border border-surfaceBorder rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-primary-400">
          <Terminal className="w-5 h-5" />
          <h2 className="text-base font-bold text-slate-100">Gateway API Connection</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Point any OpenAI-compatible SDK (Python, Node.js, LangChain, Cursor, etc.) to your custom gateway base URL.
        </p>

        <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-surfaceBorder text-xs font-mono text-slate-200">
          <span>{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}</span>
          <button
            onClick={copyBaseUrl}
            className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors cursor-pointer"
          >
            {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
