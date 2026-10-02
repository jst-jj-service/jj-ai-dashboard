'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ApiClient } from '../../../lib/api-client';
import { useAuth } from '../../../lib/auth-context';
import { formatDate } from '../../../lib/utils';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Ticket,
  Plus,
  Download,
  Copy,
  Check,
  Sparkles,
  Coins,
  RefreshCw,
  Search,
  Eye,
  Ban,
  UserCheck,
  Trash2,
  X,
  AlertCircle,
  Activity,
  Layers,
  Zap,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
  KeyRound
} from 'lucide-react';

interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  quota: {
    totalTokens: number;
    usedTokens: number;
    remainingTokens: number;
    cachedTokens: number;
    totalTokensFormatted: string;
    usedTokensFormatted: string;
    remainingTokensFormatted: string;
    cachedTokensFormatted: string;
  };
  apiKeysCount: number;
  requestCount: number;
}

export default function AdminPage() {
  const { user: currentAdmin } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab State: 'dashboard' | 'users' | 'cdk'
  const initialTab = searchParams.get('tab') === 'users' ? 'users' : (searchParams.get('tab') === 'cdk' ? 'cdk' : 'dashboard');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'cdk'>(initialTab);

  // Local-only admin check
  const [isLocalAdmin, setIsLocalAdmin] = useState<boolean | null>(null);

  // System Stats State
  const [stats, setStats] = useState<any>(null);
  const [recentSystemLogs, setRecentSystemLogs] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users State
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [creditModalUser, setCreditModalUser] = useState<UserRecord | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(1_000_000);
  const [submittingCredit, setSubmittingCredit] = useState(false);
  const [detailUser, setDetailUser] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleteModalUser, setDeleteModalUser] = useState<UserRecord | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserRecord | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [submittingResetPass, setSubmittingResetPass] = useState(false);

  // CDK State
  const [cdks, setCdks] = useState<any[]>([]);
  const [loadingCdks, setLoadingCdks] = useState(false);
  const [generatingCdk, setGeneratingCdk] = useState(false);
  const [cdkCount, setCdkCount] = useState(1);
  const [cdkTokenQuota, setCdkTokenQuota] = useState(1_000_000);
  const [cdkTier, setCdkTier] = useState('Starter (1M)');
  const [cdkExpiresInDays, setCdkExpiresInDays] = useState<number | undefined>(undefined);
  const [newlyGeneratedBatch, setNewlyGeneratedBatch] = useState<any[] | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [cdkFilter, setCdkFilter] = useState<'all' | 'unredeemed' | 'redeemed'>('all');
  const [cdkSearch, setCdkSearch] = useState('');

  // Feedback messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Verify local administration environment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const isLocal =
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '::1' ||
        host.endsWith('.local') ||
        host.startsWith('192.168.') ||
        host.startsWith('10.') ||
        host.startsWith('172.') ||
        process.env.NODE_ENV === 'development';

      setIsLocalAdmin(currentAdmin?.role === 'ADMIN' && isLocal);
    }
  }, [currentAdmin]);

  // Sync tab with URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'users') {
      setActiveTab('users');
    } else if (tabParam === 'cdk') {
      setActiveTab('cdk');
    } else {
      setActiveTab('dashboard');
    }
  }, [searchParams]);

  const switchTab = (tab: 'dashboard' | 'users' | 'cdk') => {
    setActiveTab(tab);
    router.push(`/dashboard/admin?tab=${tab}`);
  };

  // Fetch Stats & Dashboard Data
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const [statsRes, usageRes] = await Promise.all([
        ApiClient.admin.getStats(),
        ApiClient.usage.getDashboard()
      ]);
      if (statsRes.data) {
        setStats(statsRes.data);
      }
      if (usageRes.data?.recentLogs) {
        setRecentSystemLogs(usageRes.data.recentLogs);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load system stats');
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await ApiClient.admin.getUsers(userSearch);
      if (res.data?.users) {
        setUsers(res.data.users);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch CDKs
  const fetchCdks = async () => {
    setLoadingCdks(true);
    try {
      const res = await ApiClient.cdk.adminList();
      if (res.data?.cdks) {
        setCdks(res.data.cdks);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load CDKs');
    } finally {
      setLoadingCdks(false);
    }
  };

  // Load appropriate data when tab or admin changes
  useEffect(() => {
    if (isLocalAdmin) {
      if (activeTab === 'dashboard') {
        fetchStats();
      } else if (activeTab === 'users') {
        fetchUsers();
      } else if (activeTab === 'cdk') {
        fetchCdks();
      }
    }
  }, [isLocalAdmin, activeTab]);

  // User Actions
  const handleToggleUserStatus = async (user: UserRecord) => {
    if (user.id === currentAdmin?.id) {
      setErrorMsg('You cannot deactivate your own administrator account.');
      return;
    }

    try {
      const res = await ApiClient.admin.updateUserStatus(user.id, !user.isActive);
      if (res.data?.success) {
        setSuccessMsg(res.data.message);
        setTimeout(() => setSuccessMsg(null), 3000);
        await fetchUsers();
      } else {
        setErrorMsg(res.error || 'Failed to update user status');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating user status');
    }
  };

  const handleOpenAddCredit = (user: UserRecord) => {
    setCreditModalUser(user);
    setCreditAmount(1_000_000);
    setErrorMsg(null);
  };

  const handleSubmitAddCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditModalUser || creditAmount <= 0) return;

    setSubmittingCredit(true);
    setErrorMsg(null);
    try {
      const res = await ApiClient.admin.addCredits(creditModalUser.id, creditAmount);
      if (res.data?.success) {
        setSuccessMsg(res.data.message);
        setTimeout(() => setSuccessMsg(null), 3000);
        setCreditModalUser(null);
        await fetchUsers();
      } else {
        setErrorMsg(res.error || 'Failed to add credits');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error adding credits');
    } finally {
      setSubmittingCredit(false);
    }
  };

  const handleOpenUserDetails = async (user: UserRecord) => {
    setLoadingDetail(true);
    try {
      const res = await ApiClient.admin.getUser(user.id);
      if (res.data) {
        setDetailUser(res.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load user details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!deleteModalUser) return;
    if (deleteModalUser.id === currentAdmin?.id) {
      setErrorMsg('You cannot delete your own administrator account.');
      return;
    }

    setSubmittingDelete(true);
    setErrorMsg(null);
    try {
      const res = await ApiClient.admin.deleteUser(deleteModalUser.id);
      if (res.data?.success) {
        setSuccessMsg(`User ${deleteModalUser.email} has been deleted.`);
        setTimeout(() => setSuccessMsg(null), 3000);
        setDeleteModalUser(null);
        await fetchUsers();
      } else {
        setErrorMsg(res.error || 'Failed to delete user');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting user');
    } finally {
      setSubmittingDelete(false);
    }
  };

  const handleSubmitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || !newPasswordVal || newPasswordVal.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    setSubmittingResetPass(true);
    setErrorMsg(null);
    try {
      const res = await ApiClient.admin.resetUserPassword(resetPasswordUser.id, newPasswordVal);
      if (res.data?.success) {
        setSuccessMsg(res.data.message || `Password reset for ${resetPasswordUser.email}`);
        setTimeout(() => setSuccessMsg(null), 3000);
        setResetPasswordUser(null);
        setNewPasswordVal('');
      } else {
        setErrorMsg(res.error || 'Failed to reset password');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error resetting password');
    } finally {
      setSubmittingResetPass(false);
    }
  };

  // CDK Filtering & Export
  const filteredCdks = useMemo(() => {
    return cdks.filter(c => {
      const matchesFilter =
        cdkFilter === 'all' ||
        (cdkFilter === 'unredeemed' && !c.isRedeemed) ||
        (cdkFilter === 'redeemed' && c.isRedeemed);
      const matchesSearch =
        !cdkSearch ||
        c.code.toLowerCase().includes(cdkSearch.toLowerCase()) ||
        c.tier?.toLowerCase().includes(cdkSearch.toLowerCase()) ||
        c.redemption?.userEmail?.toLowerCase().includes(cdkSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [cdks, cdkFilter, cdkSearch]);

  const handleExportCdksCsv = () => {
    if (filteredCdks.length === 0) return;
    const headers = ['CDK Code', 'Tokens', 'Tier', 'Status', 'Redeemed By', 'Created At'];
    const rows = filteredCdks.map(c => [
      `"${c.code}"`,
      c.tokenQuota,
      `"${c.tier || 'Standard'}"`,
      c.isRedeemed ? 'Redeemed' : 'Available',
      `"${c.redemption?.userEmail || ''}"`,
      `"${new Date(c.createdAt).toISOString()}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cdks-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // CDK Actions
  const handleGenerateCdk = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setGeneratingCdk(true);

    try {
      const res = await ApiClient.cdk.adminGenerate({
        count: cdkCount,
        tokenQuota: cdkTokenQuota,
        tier: cdkTier,
        expiresInDays: cdkExpiresInDays ? Number(cdkExpiresInDays) : undefined
      });

      if (res.data?.cdks) {
        setNewlyGeneratedBatch(res.data.cdks);
        setSuccessMsg(`Generated ${res.data.cdks.length} CDK key(s) successfully!`);
        setTimeout(() => setSuccessMsg(null), 4000);
        await fetchCdks();
      } else {
        setErrorMsg(res.error || 'Failed to generate CDK keys');
      }
    } catch {
      setErrorMsg('An error occurred during CDK generation');
    } finally {
      setGeneratingCdk(false);
    }
  };

  const handleQuickGenerateCdk = async (quota: number, tier: string) => {
    setErrorMsg(null);
    setGeneratingCdk(true);

    try {
      const res = await ApiClient.cdk.adminGenerate({
        count: 1,
        tokenQuota: quota,
        tier: tier
      });

      if (res.data?.cdks && res.data.cdks.length > 0) {
        const cdk = res.data.cdks[0];
        setNewlyGeneratedBatch(res.data.cdks);
        navigator.clipboard.writeText(cdk.code);
        setCopiedCode(cdk.code);
        setSuccessMsg(`✓ Generated and Copied to Clipboard: ${cdk.code}! Ready to paste directly into WhatsApp for customer.`);
        setTimeout(() => setSuccessMsg(null), 5000);
        await fetchCdks();
      } else {
        setErrorMsg(res.error || 'Failed to generate CDK key');
      }
    } catch {
      setErrorMsg('An error occurred during CDK generation');
    } finally {
      setGeneratingCdk(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleExportCsv = async () => {
    try {
      const blob = await ApiClient.cdk.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cdk-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to export CSV');
    }
  };

  // Non-local or non-admin access gate
  if (isLocalAdmin === false) {
    return (
      <div className="p-8 text-center bg-surface border border-rose-500/30 rounded-2xl max-w-lg mx-auto mt-16 space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Local Administrator Access Only</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          This administration dashboard is strictly restricted. For security, administrative features and user management can only be accessed when running locally on localhost by authorized administrators.
        </p>
        <div className="pt-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 rounded-xl bg-surfaceBorder hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Return to User Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-7">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <span>Admin Control Center</span>
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              LOCAL ADMIN
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage user balances, generate CDK activation vouchers, and monitor upstream channel routing.
          </p>
        </div>

        {/* 3 Main Admin Navigation Tabs */}
        <div className="flex items-center gap-1 bg-surface border border-surfaceBorder rounded-xl p-1 self-start md:self-auto shadow-sm">
          <button
            onClick={() => switchTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-surfaceHover'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => switchTab('users')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-surfaceHover'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Users & Credit</span>
          </button>

          <button
            onClick={() => switchTab('cdk')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'cdk'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-surfaceHover'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Generate Credit (CDK)</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: ADMIN DASHBOARD */}
      {/* ========================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface border border-surfaceBorder space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Registered Users</span>
              <div className="text-2xl font-bold font-mono text-white">{stats?.totalUsers ?? '...'}</div>
              <div className="text-[11px] text-emerald-400">{stats?.activeUsers ?? 0} active accounts</div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-surfaceBorder space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active API Keys</span>
              <div className="text-2xl font-bold font-mono text-white">{stats?.activeApiKeys ?? '...'}</div>
              <div className="text-[11px] text-slate-400">{stats?.totalApiKeys ?? 0} total created</div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-surfaceBorder space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tokens Allocated</span>
              <div className="text-2xl font-bold font-mono text-amber-300">{stats?.totalTokensRedeemedFormatted ?? '...'}</div>
              <div className="text-[11px] text-slate-400">{stats?.totalTokensUsedFormatted ?? '0'} tokens consumed</div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-surfaceBorder space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Requests</span>
              <div className="text-2xl font-bold font-mono text-primary-400">{stats?.totalRequests ?? '...'}</div>
              <div className="text-[11px] text-slate-400">{stats?.redeemedCdks ?? 0} CDKs redeemed</div>
            </div>
          </div>

          {/* Upstream Channels Status (6 Pools) */}
          <div className="bg-surface rounded-2xl border border-surfaceBorder p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-surfaceBorder pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary-400" />
                <h2 className="text-base font-bold text-white">Active Upstream Routing Pools (6 Channels)</h2>
              </div>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Pools Operational</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[
                { name: 'GPT Starter (Welfare)', multiplier: '0.16x', models: 'Astra, Sol, GPT-4o-mini', desc: 'Lowest cost promotional pool' },
                { name: 'GPT Plus', multiplier: '0.325x', models: 'GPT-4o, ChatGPT-4o', desc: 'Cursor IDE coding workhorse' },
                { name: 'GPT Pro', multiplier: '0.45x', models: 'Sol Reasoning, Terra', desc: 'Deep STEM reasoning logic' },
                { name: 'GPT Pro VIP', multiplier: '0.45x', models: 'Astra Flagship, o1, o3-mini', desc: 'Frontier reasoning tier' },
                { name: 'Claude Opus 5', multiplier: '0.24x', models: 'Claude Opus 5, Sonnet 5', desc: 'Deep writing & comprehension' },
                { name: 'Claude Max', multiplier: '3.00x', models: 'Claude 3.7 Sonnet, Claude Code', desc: 'Claude Code CLI native thinking' },
              ].map(pool => (
                <div key={pool.name} className="p-3.5 rounded-xl bg-background/80 border border-surfaceBorder/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{pool.name}</span>
                    <span className="text-xs font-mono font-bold text-amber-300">{pool.multiplier}</span>
                  </div>
                  <div className="text-[11px] font-mono text-primary-400">{pool.models}</div>
                  <div className="text-[10px] text-slate-500">{pool.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => switchTab('cdk')}
              className="p-4 rounded-xl bg-surface hover:bg-surfaceHover border border-surfaceBorder text-left space-y-1.5 transition-all group"
            >
              <div className="flex items-center justify-between text-amber-400">
                <Ticket className="w-5 h-5" />
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-sm font-bold text-white">Generate Credit Key (CDK)</div>
              <p className="text-xs text-slate-400">Create a 1M, 5M, or 20M token activation code to copy & send to WhatsApp buyer.</p>
            </button>

            <button
              onClick={() => switchTab('users')}
              className="p-4 rounded-xl bg-surface hover:bg-surfaceHover border border-surfaceBorder text-left space-y-1.5 transition-all group"
            >
              <div className="flex items-center justify-between text-primary-400">
                <Users className="w-5 h-5" />
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-sm font-bold text-white">Manage Users & Credit</div>
              <p className="text-xs text-slate-400">Add tokens directly to any user account or toggle account status.</p>
            </button>

            <button
              onClick={handleExportCsv}
              className="p-4 rounded-xl bg-surface hover:bg-surfaceHover border border-surfaceBorder text-left space-y-1.5 transition-all group"
            >
              <div className="flex items-center justify-between text-emerald-400">
                <Download className="w-5 h-5" />
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-sm font-bold text-white">Export CDK Inventory (CSV)</div>
              <p className="text-xs text-slate-400">Download complete inventory of all generated keys, status, and redemptions.</p>
            </button>
          </div>

          {/* Recent System Usage Audit */}
          <div className="bg-surface rounded-2xl border border-surfaceBorder overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-surfaceBorder flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary-400" />
                <h3 className="text-sm font-bold text-white">Recent Gateway Activity (System Audit)</h3>
              </div>
              <button
                onClick={fetchStats}
                className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 font-medium"
              >
                <RefreshCw className={`w-3 h-3 ${loadingStats ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {recentSystemLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No recent proxy requests logged in the system.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-background/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-surfaceBorder">
                    <tr>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Model</th>
                      <th className="py-3 px-4">Tokens</th>
                      <th className="py-3 px-4">Routing Pool</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surfaceBorder/60 text-slate-300">
                    {recentSystemLogs.slice(0, 10).map((l: any) => (
                      <tr key={l.id} className="hover:bg-background/30 transition-colors">
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{formatDate(l.createdAt)}</td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-200">{l.model}</td>
                        <td className="py-3 px-4 font-mono text-amber-300">{l.totalTokensFormatted || l.totalTokens}</td>
                        <td className="py-3 px-4 text-primary-300 font-mono text-[11px]">{l.upstreamGroup || 'Standard'}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{l.requestDurationMs}ms</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${l.statusCode === 200 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {l.statusCode}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MANAGE USERS & CREDIT */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-5">
          {/* User Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface border border-surfaceBorder p-4 rounded-xl">
            <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user by email, name, or ID..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-20 py-2 rounded-lg bg-background border border-surfaceBorder text-slate-100 text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md transition-colors"
              >
                Search
              </button>
            </form>

            <button
              onClick={() => { setUserSearch(''); fetchUsers(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surfaceBorder hover:bg-surfaceHover text-slate-300 text-xs font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
              <span>Reset</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-surface border border-surfaceBorder rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-background/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-surfaceBorder">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">User Profile</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Remaining Balance</th>
                    <th className="py-3.5 px-4 font-semibold">Activity</th>
                    <th className="py-3.5 px-4 font-semibold">Joined</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surfaceBorder/60">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <span>Loading users...</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No registered users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map(u => {
                      const isCurrent = u.id === currentAdmin?.id;
                      return (
                        <tr key={u.id} className="hover:bg-surfaceHover/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                                {(u.name || u.email).slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-slate-100">{u.email}</span>
                                  {u.role === 'ADMIN' && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                      ADMIN
                                    </span>
                                  )}
                                  {isCurrent && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary-500/20 text-primary-300 border border-primary-500/30">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  {u.name || 'Unnamed'} &bull; <span className="font-mono text-slate-500">{u.id}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${u.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                              <span>{u.isActive ? 'Active' : 'Disabled'}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-mono text-xs font-bold text-amber-300">
                              {u.quota.remainingTokensFormatted}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Used: {u.quota.usedTokensFormatted}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-xs text-slate-300 font-medium">
                              {u.apiKeysCount} API Keys
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {u.requestCount} requests
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-400">
                            {formatDate(u.createdAt)}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Add Credit button */}
                              <button
                                onClick={() => handleOpenAddCredit(u)}
                                title="Add Token Credits"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 font-semibold text-xs transition-colors"
                              >
                                <Coins className="w-3.5 h-3.5" />
                                <span>+ Credit</span>
                              </button>

                              {/* View Details */}
                              <button
                                onClick={() => handleOpenUserDetails(u)}
                                title="View User Profile"
                                className="p-1.5 rounded-lg border border-surfaceBorder bg-surface hover:bg-surfaceHover text-slate-300 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => {
                                  setResetPasswordUser(u);
                                  setNewPasswordVal('');
                                  setErrorMsg(null);
                                }}
                                title="Reset User Password"
                                className="p-1.5 rounded-lg border border-surfaceBorder bg-surface hover:bg-surfaceHover text-amber-300 transition-colors"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Status */}
                              {!isCurrent && (
                                <button
                                  onClick={() => handleToggleUserStatus(u)}
                                  title={u.isActive ? 'Deactivate' : 'Activate'}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    u.isActive
                                      ? 'border-slate-600 bg-surface text-slate-400 hover:text-rose-300 hover:border-rose-500/30'
                                      : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                                  }`}
                                >
                                  {u.isActive ? <Ban className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                </button>
                              )}

                              {/* Delete User */}
                              {!isCurrent && (
                                <button
                                  onClick={() => setDeleteModalUser(u)}
                                  title="Delete Account"
                                  className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: GENERATE CREDIT (CDK) */}
      {/* ========================================================= */}
      {activeTab === 'cdk' && (
        <div className="space-y-6">
          {/* Generation Card */}
          <div className="bg-surface rounded-2xl border border-surfaceBorder p-6 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400">
                <Ticket className="w-5 h-5" />
                <h2 className="text-base font-bold text-white">Generate Credit Activation Keys (CDK)</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Create unique CDK keys to copy and deliver to customers who request a top-up on WhatsApp (0178241445).
              </p>
            </div>

            {/* 1-Click Quick Generate & Auto-Copy to Clipboard */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>1-Click Quick Generate & Auto-Copy Key</span>
                </div>
                <span className="text-[11px] text-amber-200/80">Click once to generate & immediately copy to clipboard for WhatsApp buyer</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { quota: 1_000_000, label: 'Starter', desc: '1,000,000 tokens' },
                  { quota: 5_000_000, label: 'Pro', desc: '5,000,000 tokens' },
                  { quota: 10_000_000, label: 'Team', desc: '10,000,000 tokens' },
                  { quota: 20_000_000, label: 'Enterprise', desc: '20,000,000 tokens' }
                ].map(p => (
                  <button
                    key={p.quota}
                    type="button"
                    disabled={generatingCdk}
                    onClick={() => handleQuickGenerateCdk(p.quota, p.label)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    <span className="text-xs font-extrabold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      <span>{p.label}</span>
                    </span>
                    <span className="text-[10px] text-slate-900/80 font-mono mt-0.5">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGenerateCdk} className="space-y-6">
              <div className="border-t border-surfaceBorder pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Custom Batch Generator</h3>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Token Package Tier
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { quota: 1_000_000, label: 'Starter (1M Tokens)' },
                    { quota: 5_000_000, label: 'Pro (5M Tokens)' },
                    { quota: 10_000_000, label: 'Team (10M Tokens)' },
                    { quota: 20_000_000, label: 'Enterprise (20M Tokens)' }
                  ].map(p => (
                    <button
                      key={p.quota}
                      type="button"
                      onClick={() => {
                        setCdkTokenQuota(p.quota);
                        setCdkTier(p.label);
                      }}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        cdkTokenQuota === p.quota
                          ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                          : 'bg-background/80 border-surfaceBorder text-slate-300 hover:bg-surfaceBorder/60'
                      }`}
                    >
                      <div className="text-xs font-bold">{p.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{p.quota.toLocaleString()} tokens</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Number of Keys to Generate</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={cdkCount}
                    onChange={e => setCdkCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-background border border-surfaceBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Exact Token Quota per Key</label>
                  <input
                    type="number"
                    min={1000}
                    step={100000}
                    required
                    value={cdkTokenQuota}
                    onChange={e => setCdkTokenQuota(parseInt(e.target.value) || 0)}
                    className="w-full bg-background border border-surfaceBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expires in Days (Optional)</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Never expires"
                    value={cdkExpiresInDays || ''}
                    onChange={e => setCdkExpiresInDays(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full bg-background border border-surfaceBorder rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={generatingCdk}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>{generatingCdk ? 'Generating...' : `Generate ${cdkCount} CDK Key${cdkCount > 1 ? 's' : ''}`}</span>
              </button>
            </form>
          </div>

          {/* Newly Generated CDK Box with Copy Button */}
          {newlyGeneratedBatch && newlyGeneratedBatch.length > 0 && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-2 border-amber-500/40 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Ready to Deliver: Generated {newlyGeneratedBatch.length} CDK Key{newlyGeneratedBatch.length > 1 ? 's' : ''}!</span>
                </div>
                <span className="text-xs text-amber-200/80">Click Copy to send to customer on WhatsApp</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {newlyGeneratedBatch.map(c => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 font-mono text-sm text-white"
                  >
                    <span className="tracking-wider font-bold text-amber-200">{c.code}</span>
                    <button
                      onClick={() => copyToClipboard(c.code)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                    >
                      {copiedCode === c.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode === c.code ? 'Copied CDK!' : 'Copy CDK'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Table */}
          <div className="bg-surface rounded-2xl border border-surfaceBorder overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-surfaceBorder flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Ticket className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">All Generated CDKs ({filteredCdks.length})</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search CDKs or emails..."
                    value={cdkSearch}
                    onChange={e => setCdkSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-background border border-surfaceBorder text-slate-200 text-xs focus:outline-none focus:border-amber-500 w-44"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center p-0.5 rounded-lg bg-background border border-surfaceBorder text-xs">
                  <button
                    type="button"
                    onClick={() => setCdkFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      cdkFilter === 'all' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setCdkFilter('unredeemed')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      cdkFilter === 'unredeemed' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Available
                  </button>
                  <button
                    type="button"
                    onClick={() => setCdkFilter('redeemed')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      cdkFilter === 'redeemed' ? 'bg-slate-500/20 text-slate-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Redeemed
                  </button>
                </div>

                {/* Export CSV */}
                <button
                  onClick={handleExportCdksCsv}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-background hover:bg-surfaceBorder border border-surfaceBorder text-slate-200 text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {loadingCdks ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading CDKs...</div>
            ) : filteredCdks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No CDKs found matching your filter.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-background/60 text-slate-400 border-b border-surfaceBorder font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">CDK Code</th>
                      <th className="px-5 py-3.5">Quota</th>
                      <th className="px-5 py-3.5">Tier</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Redeemed By</th>
                      <th className="px-5 py-3.5">Created</th>
                      <th className="px-5 py-3.5 text-right">Copy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surfaceBorder/60 text-slate-300">
                    {filteredCdks.map(c => {
                      const isAvailable = !c.isRedeemed && (!c.expiresAt || new Date(c.expiresAt).getTime() > Date.now());
                      const isExpired = !c.isRedeemed && c.expiresAt && new Date(c.expiresAt).getTime() <= Date.now();

                      return (
                        <tr key={c.id} className="hover:bg-background/40 transition-colors">
                          <td className="px-5 py-3.5 font-mono font-medium text-white">{c.code}</td>
                          <td className="px-5 py-3.5 font-bold font-mono text-amber-300">{c.tokenQuotaFormatted}</td>
                          <td className="px-5 py-3.5 text-slate-400">{c.tier}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                c.isRedeemed
                                  ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                  : isExpired
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              }`}
                            >
                              {c.isRedeemed ? 'REDEEMED' : isExpired ? 'EXPIRED' : 'AVAILABLE'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-400">
                            {c.redeemedByEmail || '-'}
                          </td>
                          <td className="px-5 py-3.5 text-slate-400">{formatDate(c.createdAt)}</td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => copyToClipboard(c.code)}
                              title="Copy CDK Code"
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-surfaceBorder rounded-lg transition-colors"
                            >
                              {copiedCode === c.code ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Credits Modal */}
      {creditModalUser && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface border border-surfaceBorder rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <Coins className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Add Token Credits</h3>
              </div>
              <button onClick={() => setCreditModalUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Add token quota balance directly to <strong className="text-white">{creditModalUser.email}</strong>.
              Current remaining: <span className="text-amber-300 font-mono font-bold">{creditModalUser.quota.remainingTokensFormatted}</span>.
            </p>

            <form onSubmit={handleSubmitAddCredit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Quick Presets</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1_000_000, 5_000_000, 10_000_000, 50_000_000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCreditAmount(amt)}
                      className={`py-1.5 text-xs font-mono font-medium rounded-lg border transition-all ${
                        creditAmount === amt
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                          : 'border-surfaceBorder hover:bg-surfaceHover text-slate-300'
                      }`}
                    >
                      +{amt >= 1_000_000 ? `${amt / 1_000_000}M` : amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Exact Token Amount</label>
                <input
                  type="number"
                  min={1}
                  step={100000}
                  value={creditAmount}
                  onChange={e => setCreditAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-surfaceBorder text-slate-100 font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreditModalUser(null)}
                  className="px-4 py-2 rounded-lg border border-surfaceBorder text-xs text-slate-300 hover:bg-surfaceHover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCredit || creditAmount <= 0}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold disabled:opacity-50"
                >
                  {submittingCredit ? 'Crediting...' : `Add ${(creditAmount).toLocaleString()} Tokens`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {detailUser && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface border border-surfaceBorder rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surfaceBorder pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary-400" />
                  <span>{detailUser.user.email}</span>
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  ID: <span className="font-mono text-slate-500">{detailUser.user.id}</span> &bull; Role: {detailUser.user.role}
                </div>
              </div>
              <button onClick={() => setDetailUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-background border border-surfaceBorder rounded-xl p-3">
                <div className="text-[11px] text-slate-400">Total Tokens</div>
                <div className="text-base font-bold text-slate-100 font-mono mt-1">
                  {detailUser.quota.totalTokensFormatted}
                </div>
              </div>
              <div className="bg-background border border-surfaceBorder rounded-xl p-3">
                <div className="text-[11px] text-slate-400">Tokens Consumed</div>
                <div className="text-base font-bold text-rose-400 font-mono mt-1">
                  {detailUser.quota.usedTokensFormatted}
                </div>
              </div>
              <div className="bg-background border border-surfaceBorder rounded-xl p-3">
                <div className="text-[11px] text-slate-400">Remaining Balance</div>
                <div className="text-base font-bold text-amber-300 font-mono mt-1">
                  {detailUser.quota.remainingTokensFormatted}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                API Keys ({detailUser.apiKeysCount})
              </h4>
              {detailUser.apiKeys?.length === 0 ? (
                <div className="text-xs text-slate-500 py-1">No API keys created yet.</div>
              ) : (
                <div className="space-y-2">
                  {detailUser.apiKeys.map((k: any) => (
                    <div
                      key={k.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-surfaceBorder text-xs"
                    >
                      <div>
                        <div className="font-medium text-slate-200">{k.name}</div>
                        <div className="font-mono text-[11px] text-slate-500">{k.keyPrefix}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${k.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {k.isActive ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailUser(null)}
                className="px-4 py-2 rounded-lg bg-surfaceHover border border-surfaceBorder text-xs text-slate-300 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface border border-surfaceBorder rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Delete User Account?</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">{deleteModalUser.email}</strong>? All their API keys and quotas will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalUser(null)}
                className="px-3.5 py-2 rounded-lg border border-surfaceBorder text-xs text-slate-300 hover:bg-surfaceHover"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                disabled={submittingDelete}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold disabled:opacity-50"
              >
                {submittingDelete ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface border border-surfaceBorder rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <KeyRound className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Reset User Password</h3>
              </div>
              <button onClick={() => setResetPasswordUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Enter a new password for <strong className="text-white">{resetPasswordUser.email}</strong>.
            </p>

            <form onSubmit={handleSubmitResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={newPasswordVal}
                  onChange={e => setNewPasswordVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-surfaceBorder text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordUser(null)}
                  className="px-3.5 py-2 rounded-lg border border-surfaceBorder text-xs text-slate-300 hover:bg-surfaceHover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResetPass}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold disabled:opacity-50"
                >
                  {submittingResetPass ? 'Resetting...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
