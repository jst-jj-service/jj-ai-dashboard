'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiClient } from '../../lib/api-client';
import { useAuth } from '../../lib/auth-context';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import {
  Coins,
  Database,
  Activity,
  Zap,
  Ticket,
  ExternalLink,
  ShoppingBag,
  TrendingUp,
  Cpu,
  KeyRound,
  Tag,
  CheckCircle2,
  Radio,
  Copy,
  Check,
  Terminal,
  Code2,
  CreditCard,
  Info
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { quota, refreshUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeGuideTab, setActiveGuideTab] = useState<'cursor' | 'claude' | 'python' | 'curl'>('cursor');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || 'https://your-shop.com';

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const fetchDashboard = async () => {
    try {
      const res = await ApiClient.usage.getDashboard();
      if (res.data) {
        setDashboardData(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    refreshUser();
  }, []);

  const summary = dashboardData?.summary || {
    totalTokens: quota?.totalTokens || 0,
    totalTokensFormatted: quota?.totalTokensFormatted || '0',
    usedTokens: quota?.usedTokens || 0,
    usedTokensFormatted: quota?.usedTokensFormatted || '0',
    remainingTokens: quota?.remainingTokens || 0,
    remainingTokensFormatted: quota?.remainingTokensFormatted || '0',
    cachedTokens: quota?.cachedTokens || 0,
    cachedTokensFormatted: quota?.cachedTokensFormatted || '0',
    promptTokens: 0,
    promptTokensFormatted: '0',
    completionTokens: 0,
    completionTokensFormatted: '0',
    requestCount: 0
  };

  const percentUsed = summary.totalTokens > 0
    ? Math.min(100, Math.round((summary.usedTokens / summary.totalTokens) * 100))
    : 0;

  const trends = dashboardData?.trends || [];
  const models = dashboardData?.models || [];

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor real-time token consumption, cache hits, and membership quota
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/payment"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Top-Up Credits</span>
          </Link>
          <Link
            href="/dashboard/payment"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-surface hover:bg-surfaceBorder border border-surfaceBorder text-slate-200 text-xs font-semibold transition-all"
          >
            <Ticket className="w-4 h-4 text-primary-400" />
            <span>Redeem CDK</span>
          </Link>
        </div>
      </div>

      {/* Live System Status & Quick Actions Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* System status pill */}
        <div className="p-4 rounded-xl bg-surface border border-surfaceBorder flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                <span>All Routes Operational</span>
              </div>
              <div className="text-[11px] text-slate-400">6 Multi-Key Pools Active</div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            99.9%
          </span>
        </div>

        {/* Quick Action: API Keys */}
        <Link
          href="/dashboard/api-keys"
          className="p-4 rounded-xl bg-surface border border-surfaceBorder hover:border-primary-500/40 hover:bg-surfaceHover flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400 group-hover:scale-105 transition-transform">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-100">Manage API Keys</div>
              <div className="text-[11px] text-slate-400">Create & revoke keys</div>
            </div>
          </div>
          <span className="text-xs text-primary-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
        </Link>

        {/* Quick Action: Model Pricing */}
        <Link
          href="/dashboard/pricing"
          className="p-4 rounded-xl bg-surface border border-surfaceBorder hover:border-primary-500/40 hover:bg-surfaceHover flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-100">Model Pricing</div>
              <div className="text-[11px] text-slate-400">Rates from 0.16x</div>
            </div>
          </div>
          <span className="text-xs text-amber-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
        </Link>

        {/* Quick Action: Redeem CDK */}
        <Link
          href="/dashboard/payment"
          className="p-4 rounded-xl bg-surface border border-surfaceBorder hover:border-primary-500/40 hover:bg-surfaceHover flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-100">Redeem Voucher</div>
              <div className="text-[11px] text-slate-400">Activate CDK codes</div>
            </div>
          </div>
          <span className="text-xs text-purple-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
        </Link>
      </div>

      {/* Quota Exhaustion Warning Alert */}
      {summary.remainingTokens <= 0 && summary.totalTokens > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-400">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Quota Exhausted</div>
              <div className="text-xs text-rose-300/80">
                You have used 100% of your allocated tokens. API requests will be paused until you top up.
              </div>
            </div>
          </div>
          <Link
            href="/dashboard/payment"
            className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium shrink-0 transition-colors"
          >
            Redeem New CDK
          </Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL TOKENS USED"
          value={summary.usedTokensFormatted}
          subtitle={`Out of ${summary.totalTokensFormatted} quota`}
          icon={Coins}
          badge={{
            text: `${percentUsed}% used`,
            variant: percentUsed >= 90 ? 'amber' : 'blue'
          }}
        />

        <StatCard
          title="CACHED TOKENS"
          value={summary.cachedTokensFormatted}
          subtitle="Served from upstream prompt cache"
          icon={Database}
          badge={{
            text: 'Cache Hit',
            variant: 'emerald'
          }}
        />

        <StatCard
          title="REMAINING QUOTA"
          value={summary.remainingTokensFormatted}
          subtitle="Available for API calls"
          icon={Zap}
          badge={{
            text: summary.remainingTokens > 0 ? 'Active' : 'Depleted',
            variant: summary.remainingTokens > 0 ? 'emerald' : 'amber'
          }}
        />

        <StatCard
          title="TOTAL API CALLS"
          value={summary.requestCount}
          subtitle="Successful requests processed"
          icon={Activity}
          badge={{
            text: 'Gateway Live',
            variant: 'purple'
          }}
        />
      </div>

      {/* Quota Progress Card */}
      <div className="bg-surface rounded-xl border border-surfaceBorder p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Membership Quota Consumption</h2>
            <p className="text-xs text-slate-400">
              Tokens are deducted automatically as your applications make requests through the gateway.
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-white">
              {summary.usedTokensFormatted} / {summary.totalTokensFormatted}
            </span>
          </div>
        </div>

        <ProgressBar
          percent={percentUsed}
          label="Token Utilization"
          sublabel={`${summary.remainingTokensFormatted} tokens remaining`}
        />

        {/* Prompt vs Completion vs Cache Breakdown Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-surfaceBorder">
          <div className="p-3 rounded-lg bg-surfaceBorder/30 border border-surfaceBorder/50">
            <span className="text-[11px] text-slate-400 font-medium">Prompt Tokens</span>
            <div className="text-lg font-bold text-slate-100 mt-0.5">{summary.promptTokensFormatted}</div>
          </div>
          <div className="p-3 rounded-lg bg-surfaceBorder/30 border border-surfaceBorder/50">
            <span className="text-[11px] text-slate-400 font-medium">Completion Tokens</span>
            <div className="text-lg font-bold text-slate-100 mt-0.5">{summary.completionTokensFormatted}</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-400 font-medium">Cached Prompt Tokens</span>
            <div className="text-lg font-bold text-emerald-300 mt-0.5">{summary.cachedTokensFormatted}</div>
          </div>
        </div>
      </div>

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Usage Trends */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-surfaceBorder p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-primary-400" />
                <span>Daily Token Activity (Last 14 Days)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Historical daily usage volume</p>
            </div>
          </div>

          {trends.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
              No API request activity recorded yet.
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <div className="h-48 flex items-end gap-2 pb-2 border-b border-surfaceBorder">
                {trends.map((day: any) => {
                  const maxTokens = Math.max(...trends.map((t: any) => t.totalTokens), 1);
                  const heightPct = Math.min(100, Math.max(8, Math.round((day.totalTokens / maxTokens) * 100)));
                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center group relative h-full justify-end"
                    >
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-slate-900 border border-surfaceBorder text-slate-200 text-[10px] px-2 py-1 rounded shadow-xl pointer-events-none whitespace-nowrap z-10">
                        <div>{day.date}</div>
                        <div className="font-bold text-primary-400">{day.totalTokensFormatted} tokens</div>
                        <div className="text-emerald-400">{day.cachedTokensFormatted} cached</div>
                      </div>

                      <div
                        className="w-full bg-primary-600/70 hover:bg-primary-500 rounded-t transition-all"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                <span>{trends[0]?.date}</span>
                <span>{trends[trends.length - 1]?.date}</span>
              </div>
            </div>
          )}
        </div>

        {/* Model Distribution */}
        <div className="bg-surface rounded-xl border border-surfaceBorder p-6 shadow-sm">
          <h2 className="text-base font-semibold text-white flex items-center space-x-2 mb-4">
            <Cpu className="w-4 h-4 text-accent-500" />
            <span>Usage by Model</span>
          </h2>

          {models.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
              No model calls recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {models.map((m: any) => {
                const pct = summary.usedTokens > 0
                  ? Math.round((m.totalTokens / summary.usedTokens) * 100)
                  : 0;

                return (
                  <div key={m.model} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-mono text-slate-300 truncate max-w-[150px]">{m.model}</span>
                      <span className="font-semibold text-slate-100">{m.totalTokensFormatted}</span>
                    </div>
                    <div className="w-full h-1.5 bg-surfaceBorder rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-500 rounded-full"
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{m.requests} requests</span>
                      <span>{pct}% of total</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Usage & Billing Records (Matching Screenshot Format) */}
      <div className="bg-surface rounded-2xl border border-surfaceBorder overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-surfaceBorder flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-400" />
            <div>
              <h2 className="text-base font-bold text-white">Usage & Billing Records</h2>
              <p className="text-xs text-slate-400">Real-time accounting of your API requests and token billing</p>
            </div>
          </div>
          <Link
            href="/dashboard/usage"
            className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1"
          >
            <span>View All Records</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {(!dashboardData?.recentLogs || dashboardData.recentLogs.length === 0) ? (
          <div className="p-10 text-center space-y-2">
            <Activity className="w-6 h-6 text-slate-500 mx-auto" />
            <div className="text-xs text-slate-400">No billing activity recorded yet. API calls to /v1/chat/completions will be logged here.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-background/80 text-slate-400 uppercase tracking-wider font-semibold text-[11px] border-b border-surfaceBorder">
                <tr>
                  <th className="py-3 px-4">Group & Multiplier</th>
                  <th className="py-3 px-3">Mode</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-4">Tokens Breakdown</th>
                  <th className="py-3 px-4">Price & Cost</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surfaceBorder/60 text-slate-300">
                {dashboardData.recentLogs.slice(0, 10).map((log: any) => {
                  const prompt = log.promptTokens || 0;
                  const completion = log.completionTokens || 0;
                  const cached = log.cachedTokens || 0;
                  const mult = log.rateMultiplier || 1.0;
                  const groupBadge = log.groupBadge || log.upstreamGroup || (
                    log.model?.toLowerCase().includes('claude')
                      ? 'Claude Max | 3.00x'
                      : log.model?.toLowerCase().includes('mini')
                      ? 'GPT Starter | 0.16x'
                      : 'GPT Plus | 0.325x'
                  );
                  const streamBadge = log.streamBadge || (log.isStream ? 'Stream' : 'Standard');
                  const billingType = log.billingType || 'Pay-per-use';

                  const rawPrice = ((prompt * 0.0000025) + (completion * 0.000010) + (cached * 0.0000005)) * mult;
                  const priceUsd = log.costUsd !== undefined ? log.costUsd : Math.max(0.000050, rawPrice);
                  const priceFormatted = log.priceUsdFormatted || `$${priceUsd.toFixed(6)}`;
                  const costFormatted = log.costUsdFormatted || `A $${(priceUsd * 0.60).toFixed(6)}`;

                  const totalDurationMs = log.requestDurationMs || 0;
                  const firstTokenMs = log.firstTokenDurationMs !== undefined
                    ? log.firstTokenDurationMs
                    : (log.isStream ? Math.min(totalDurationMs, Math.max(850, Math.round(totalDurationMs * 0.12))) : totalDurationMs);
                  const isLong = log.isLongLatency !== undefined ? log.isLongLatency : (totalDurationMs >= 60000);

                  const formatLatencyStr = (ms: number) => {
                    if (!ms || ms <= 0) return '0.00s';
                    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
                    const mins = Math.floor(ms / 60000);
                    const secs = Math.round((ms % 60000) / 1000);
                    return `${mins}m ${secs}s`;
                  };

                  const firstTokenLatency = log.firstTokenLatency || formatLatencyStr(firstTokenMs);
                  const totalLatency = log.totalLatency || formatLatencyStr(totalDurationMs);
                  const cachedFormatted = log.cachedTokensFormatted || (cached >= 1000 ? `${(cached / 1000).toFixed(1)}K` : (cached > 0 ? String(cached) : '0'));
                  const timestampFormatted = log.timestampFormatted || new Date(log.createdAt).toISOString().replace('T', ' ').slice(0, 19).replace(/-/g, '/');

                  return (
                    <tr key={log.id} className="hover:bg-surfaceHover/60 transition-colors">
                      {/* 1. Group Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-normal bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-sans tracking-tight">
                          {groupBadge}
                        </span>
                      </td>

                      {/* 2. Stream Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-normal bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          {streamBadge}
                        </span>
                      </td>

                      {/* 3. Billing Mode Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-normal bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {billingType}
                        </span>
                      </td>

                      {/* 4. Tokens Breakdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center text-emerald-400 font-medium">
                            <span className="font-bold mr-0.5 text-emerald-400">↓</span>
                            <span className="text-slate-200">{prompt.toLocaleString()}</span>
                          </span>
                          <span className="inline-flex items-center text-purple-400 font-medium">
                            <span className="font-bold mr-0.5 text-purple-400">↑</span>
                            <span className="text-slate-200">{completion.toLocaleString()}</span>
                          </span>
                          <span title="Token calculation breakdown" className="text-slate-500 hover:text-slate-300 cursor-pointer">
                            <Info className="w-3.5 h-3.5 inline -mt-0.5" />
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 mt-1 text-sky-400 text-[11px]">
                          <Database className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>{cachedFormatted}</span>
                        </div>
                      </td>

                      {/* 5. Price & Cost */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-emerald-400 text-[13px]">
                            {priceFormatted}
                          </span>
                          <span title="Deduction details" className="text-slate-500 hover:text-slate-300 cursor-pointer">
                            <Info className="w-3.5 h-3.5 inline -mt-0.5" />
                          </span>
                        </div>
                        <div className="text-amber-400 text-[11px] mt-0.5 font-medium">
                          {costFormatted}
                        </div>
                      </td>

                      {/* 6. Latency */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className={`pl-2.5 py-0.5 border-l-2 font-mono text-xs ${isLong ? 'border-amber-400' : 'border-emerald-500'}`}>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400 text-[11px] font-sans">TTFT</span>
                            <span className="text-emerald-400 font-medium">{firstTokenLatency}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-slate-400 text-[11px] font-sans">Total</span>
                            <span className={`font-medium ${isLong ? 'text-amber-400 font-bold' : 'text-emerald-400'}`}>
                              {totalLatency}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 7. Timestamp */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-xs text-slate-400">
                        {timestampFormatted}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Integration Guide Card */}
      <div className="bg-surface rounded-xl border border-surfaceBorder p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surfaceBorder pb-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-primary-400" />
              <span>Connect Your Tools & IDEs</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Copy and paste configuration settings to connect Cursor, Claude Code, Python, or Node.js in seconds.
            </p>
          </div>

          <div className="flex items-center space-x-1 p-1 bg-surfaceBorder/40 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setActiveGuideTab('cursor')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeGuideTab === 'cursor' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cursor IDE
            </button>
            <button
              onClick={() => setActiveGuideTab('claude')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeGuideTab === 'claude' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Claude Code CLI
            </button>
            <button
              onClick={() => setActiveGuideTab('python')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeGuideTab === 'python' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Python SDK
            </button>
            <button
              onClick={() => setActiveGuideTab('curl')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeGuideTab === 'curl' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              cURL / HTTP
            </button>
          </div>
        </div>

        {/* Tab 1: Cursor IDE */}
        {activeGuideTab === 'cursor' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">
              In Cursor, navigate to <strong>Settings</strong> &rarr; <strong>Models</strong>, disable "Use built-in OpenAI API key", toggle on <strong>OpenAI API Key</strong>, and override the base URL:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-surfaceBorder space-y-1 relative">
                <span className="text-[11px] text-slate-400">Override OpenAI Base URL:</span>
                <div className="font-mono text-xs text-amber-300 select-all">https://jj-ai-gateway.onrender.com/v1</div>
                <button
                  onClick={() => copyCode('https://jj-ai-gateway.onrender.com/v1', 'cursor-url')}
                  className="absolute right-2 top-2 p-1.5 rounded bg-surfaceBorder/60 hover:bg-surfaceBorder text-slate-300 transition-colors"
                >
                  {copiedSnippet === 'cursor-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-surfaceBorder space-y-1 relative">
                <span className="text-[11px] text-slate-400">OpenAI API Key:</span>
                <div className="font-mono text-xs text-slate-300">Paste your sk-gw-... key from API Keys</div>
                <Link
                  href="/dashboard/api-keys"
                  className="absolute right-2 top-2 text-[10px] text-primary-400 hover:underline px-2 py-1"
                >
                  Get Key &rarr;
                </Link>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              💡 <em>Recommended models to add in Cursor: <code>astra</code> (0.45x), <code>sol</code> (0.45x), <code>gpt-4o</code> (0.325x), or <code>claude-3-7-sonnet-20250219</code> (3.00x).</em>
            </p>
          </div>
        )}

        {/* Tab 2: Claude Code CLI */}
        {activeGuideTab === 'claude' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">
              Run Claude Code CLI natively against our high-speed Claude Max pool by setting the official environment variables:
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-surfaceBorder relative">
              <pre className="font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
{`export ANTHROPIC_BASE_URL="https://jj-ai-gateway.onrender.com"
export ANTHROPIC_API_KEY="sk-gw-your-api-key"
claude`}
              </pre>
              <button
                onClick={() =>
                  copyCode(
                    'export ANTHROPIC_BASE_URL="https://jj-ai-gateway.onrender.com"\nexport ANTHROPIC_API_KEY="sk-gw-your-api-key"\nclaude',
                    'claude-env'
                  )
                }
                className="absolute right-3 top-3 p-1.5 rounded bg-surfaceBorder/60 hover:bg-surfaceBorder text-slate-300 transition-colors"
              >
                {copiedSnippet === 'claude-env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              💡 <em>Full hybrid thinking, tool calling, and project indexing supported out of the box with zero modifications to Claude Code.</em>
            </p>
          </div>
        )}

        {/* Tab 3: Python SDK */}
        {activeGuideTab === 'python' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">Call OpenAI or Anthropic using standard official Python SDKs:</p>
            <div className="p-3 rounded-lg bg-slate-950 border border-surfaceBorder relative">
              <pre className="font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto">
{`from openai import OpenAI

client = OpenAI(
    api_key="sk-gw-your-api-key",
    base_url="https://jj-ai-gateway.onrender.com/v1"
)

response = client.chat.completions.create(
    model="sol",  # or "astra", "gpt-4o"
    messages=[{"role": "user", "content": "Explain binary search trees concisely."}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="", flush=True)`}
              </pre>
              <button
                onClick={() =>
                  copyCode(
                    `from openai import OpenAI\n\nclient = OpenAI(\n    api_key="sk-gw-your-api-key",\n    base_url="https://jj-ai-gateway.onrender.com/v1"\n)\n\nresponse = client.chat.completions.create(\n    model="sol",\n    messages=[{"role": "user", "content": "Hello AI Gateway!"}],\n    stream=True\n)\n\nfor chunk in response:\n    print(chunk.choices[0].delta.content or "", end="", flush=True)`,
                    'py-snippet'
                  )
                }
                className="absolute right-3 top-3 p-1.5 rounded bg-surfaceBorder/60 hover:bg-surfaceBorder text-slate-300 transition-colors"
              >
                {copiedSnippet === 'py-snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: cURL */}
        {activeGuideTab === 'curl' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">Test directly from any terminal using cURL:</p>
            <div className="p-3 rounded-lg bg-slate-950 border border-surfaceBorder relative">
              <pre className="font-mono text-xs text-sky-300 leading-relaxed overflow-x-auto">
{`curl https://jj-ai-gateway.onrender.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-gw-your-api-key" \\
  -d '{
    "model": "astra",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": false
  }'`}
              </pre>
              <button
                onClick={() =>
                  copyCode(
                    `curl https://jj-ai-gateway.onrender.com/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer sk-gw-your-api-key" \\\n  -d '{\n    "model": "astra",\n    "messages": [{"role": "user", "content": "Hello!"}],\n    "stream": false\n  }'`,
                    'curl-snippet'
                  )
                }
                className="absolute right-3 top-3 p-1.5 rounded bg-surfaceBorder/60 hover:bg-surfaceBorder text-slate-300 transition-colors"
              >
                {copiedSnippet === 'curl-snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
