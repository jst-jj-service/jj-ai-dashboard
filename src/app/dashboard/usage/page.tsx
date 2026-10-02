'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ApiClient } from '../../../lib/api-client';
import {
  Activity,
  RefreshCw,
  Search,
  Download,
  Info,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Database,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

interface UsageLogItem {
  id: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  totalTokens: number;
  totalTokensFormatted: string;
  deductedTokens?: number;
  deductedTokensFormatted?: string;
  rateMultiplier?: number;
  requestDurationMs: number;
  firstTokenDurationMs?: number;
  statusCode: number;
  isStream: boolean;
  createdAt: string;
  upstreamGroup?: string;
  upstreamKeyName?: string;
  // Screenshot-formatted fields
  groupBadge?: string;
  streamBadge?: string;
  billingType?: string;
  promptTokensFormatted?: string;
  completionTokensFormatted?: string;
  cachedTokensFormatted?: string;
  priceUsdFormatted?: string;
  costUsdFormatted?: string;
  firstTokenLatency?: string;
  totalLatency?: string;
  isLongLatency?: boolean;
  timestampFormatted?: string;
}

export default function UsageLogsPage() {
  const [logs, setLogs] = useState<UsageLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.usage.getDashboard();
      if (res.data?.recentLogs) {
        setLogs(res.data.recentLogs);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch =
        !searchTerm ||
        log.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.groupBadge?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGroup =
        selectedGroup === 'ALL' ||
        log.groupBadge?.includes(selectedGroup) ||
        log.upstreamGroup?.includes(selectedGroup);

      return matchesSearch && matchesGroup;
    });
  }, [logs, searchTerm, selectedGroup]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGroup]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalRequests = filteredLogs.length;
    let totalTokens = 0;
    let totalCached = 0;
    let totalDuration = 0;

    for (const l of filteredLogs) {
      totalTokens += l.totalTokens || 0;
      totalCached += l.cachedTokens || 0;
      totalDuration += l.requestDurationMs || 0;
    }

    const avgDuration = totalRequests > 0 ? Math.round(totalDuration / totalRequests) : 0;

    return {
      totalRequests,
      totalTokens,
      totalCached,
      avgDuration
    };
  }, [filteredLogs]);

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const handleExportCsv = () => {
    if (filteredLogs.length === 0) return;
    const headers = [
      'Timestamp',
      'Group / Multiplier',
      'Mode',
      'Billing Type',
      'Input Tokens (↓)',
      'Output Tokens (↑)',
      'Cached Tokens',
      'Total Tokens',
      'Price ($)',
      'Upstream Cost (A $)',
      'First Token (TTFT)',
      'Total Latency',
      'Model',
      'Status'
    ];

    const rows = filteredLogs.map(l => [
      `"${l.timestampFormatted || new Date(l.createdAt).toLocaleString()}"`,
      `"${l.groupBadge || l.upstreamGroup || 'Standard'}"`,
      `"${l.streamBadge || (l.isStream ? 'Stream' : 'Standard')}"`,
      `"${l.billingType || 'Pay-per-use'}"`,
      l.promptTokens ?? 0,
      l.completionTokens ?? 0,
      l.cachedTokens ?? 0,
      l.totalTokens ?? 0,
      `"${l.priceUsdFormatted || '$0.000000'}"`,
      `"${l.costUsdFormatted || 'A $0.000000'}"`,
      `"${l.firstTokenLatency || '0.00s'}"`,
      `"${l.totalLatency || '0.00s'}"`,
      `"${l.model || ''}"`,
      l.statusCode ?? 200
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `billing-records-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper formatting if fields aren't already formatted
  const formatCached = (c: number) => {
    if (!c || c <= 0) return '-';
    if (c >= 1000) return `${(c / 1000).toFixed(1)}K`;
    return c.toString();
  };

  const formatPrice = (prompt: number, completion: number, cached: number, mult = 1) => {
    const raw = ((prompt * 0.0000025) + (completion * 0.000010) + (cached * 0.0000005)) * mult;
    const price = Math.max(0.000050, raw);
    return `$${price.toFixed(6)}`;
  };

  const formatCost = (prompt: number, completion: number, cached: number, mult = 1) => {
    const raw = ((prompt * 0.0000025) + (completion * 0.000010) + (cached * 0.0000005)) * mult;
    const price = Math.max(0.000050, raw);
    return `A $${(price * 0.60).toFixed(6)}`;
  };

  const formatLatency = (ms: number) => {
    if (!ms || ms <= 0) return '0.00s';
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    const mins = Math.floor(ms / 60000);
    const secs = Math.round((ms % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  const formatTimestamp = (d: string | Date) => {
    const date = new Date(d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd} ${hh}:${min}:${ss}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Activity className="w-6 h-6 text-primary-400" />
            <span>Usage & Billing Records</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time accounting of your API requests, model groups, token breakdowns, billing deductions, and response latencies.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-surfaceBorder border border-surfaceBorder text-slate-300 disabled:opacity-40 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-primary-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchLogs}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-surfaceBorder border border-surfaceBorder text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-surfaceBorder space-y-1">
          <div className="text-xs text-slate-400 font-medium">Recorded Requests</div>
          <div className="text-xl font-bold text-slate-100 font-mono">{stats.totalRequests}</div>
          <div className="text-[11px] text-emerald-400">Live gateway traffic</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surfaceBorder space-y-1">
          <div className="text-xs text-slate-400 font-medium">Total Tokens</div>
          <div className="text-xl font-bold text-amber-300 font-mono">{stats.totalTokens.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">Input + Output</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surfaceBorder space-y-1">
          <div className="text-xs text-slate-400 font-medium">Cached Tokens</div>
          <div className="text-xl font-bold text-sky-400 font-mono">{stats.totalCached.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">Zero-rate cache hits</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surfaceBorder space-y-1">
          <div className="text-xs text-slate-400 font-medium">Average Latency</div>
          <div className="text-xl font-bold text-teal-400 font-mono">{stats.avgDuration}ms</div>
          <div className="text-[11px] text-slate-400">End-to-end processing</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface border border-surfaceBorder p-4 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by model or group badge..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-background border border-surfaceBorder text-slate-100 text-xs focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-background border border-surfaceBorder text-slate-200 text-xs focus:outline-none focus:border-primary-500 w-full sm:w-auto font-sans"
          >
            <option value="ALL">All Groups</option>
            <option value="Starter">GPT Starter (0.16x)</option>
            <option value="Plus">GPT Plus (0.325x)</option>
            <option value="Pro">GPT Pro (0.45x)</option>
            <option value="VIP">GPT Pro VIP (0.45x)</option>
            <option value="Opus">Claude Opus 5 (0.24x)</option>
            <option value="Max">Claude Max (3.00x)</option>
          </select>

          {(searchTerm || selectedGroup !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedGroup('ALL');
              }}
              className="px-2.5 py-1.5 text-xs text-primary-400 hover:text-primary-300 font-semibold whitespace-nowrap"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Usage & Billing Records matching screenshot */}
      <div className="bg-surface rounded-2xl border border-surfaceBorder overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2.5">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading usage & billing records...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Activity className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No Billing Activity Recorded Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              When your API client (e.g. Cursor, Claude Code, Python) sends requests to <code className="text-primary-400 font-mono">/v1/chat/completions</code>, every request will be recorded and formatted here exactly as shown in your billing statement.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-background/80 text-slate-400 uppercase tracking-wider font-semibold text-[11px] border-b border-surfaceBorder">
                <tr>
                  <th className="py-3.5 px-4">Group & Multiplier</th>
                  <th className="py-3.5 px-3">Mode</th>
                  <th className="py-3.5 px-3">Type</th>
                  <th className="py-3.5 px-4">Tokens Breakdown</th>
                  <th className="py-3.5 px-4">Price & Cost</th>
                  <th className="py-3.5 px-4">Latency</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surfaceBorder/60 text-slate-300">
                {paginatedLogs.map(log => {
                  const isExpanded = expandedRowId === log.id;
                  const prompt = log.promptTokens || 0;
                  const completion = log.completionTokens || 0;
                  const cached = log.cachedTokens || 0;
                  const mult = log.rateMultiplier || 1.0;

                  // Group badge (e.g. "GPT Plus | 0.325x", "Claude Max | 3.00x")
                  const groupBadge = log.groupBadge || log.upstreamGroup || (
                    log.model?.toLowerCase().includes('claude')
                      ? 'Claude Max | 3.00x'
                      : log.model?.toLowerCase().includes('mini')
                      ? 'GPT Starter | 0.16x'
                      : 'GPT Plus | 0.325x'
                  );

                  // Stream & Billing badges
                  const streamBadge = log.streamBadge || (log.isStream ? 'Stream' : 'Standard');
                  const billingType = log.billingType || 'Pay-per-use';

                  // Price & Cost
                  const priceFormatted = log.priceUsdFormatted || formatPrice(prompt, completion, cached, mult);
                  const costFormatted = log.costUsdFormatted || formatCost(prompt, completion, cached, mult);

                  // Latency
                  const totalDurationMs = log.requestDurationMs || 0;
                  const firstTokenMs = log.firstTokenDurationMs !== undefined
                    ? log.firstTokenDurationMs
                    : (log.isStream ? Math.min(totalDurationMs, Math.max(850, Math.round(totalDurationMs * 0.12))) : totalDurationMs);

                  const firstTokenLatency = log.firstTokenLatency || formatLatency(firstTokenMs);
                  const totalLatency = log.totalLatency || formatLatency(totalDurationMs);
                  const isLong = log.isLongLatency !== undefined ? log.isLongLatency : (totalDurationMs >= 60000);

                  // Timestamp
                  const timestampFormatted = log.timestampFormatted || formatTimestamp(log.createdAt);

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => toggleRow(log.id)}
                        className="hover:bg-surfaceHover/60 transition-colors cursor-pointer group"
                      >
                        {/* 1. Group Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-normal bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-sans tracking-tight">
                            {groupBadge}
                          </span>
                        </td>

                        {/* 2. Stream Badge */}
                        <td className="py-4 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-normal bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {streamBadge}
                          </span>
                        </td>

                        {/* 3. Billing Mode Badge */}
                        <td className="py-4 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-normal bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {billingType}
                          </span>
                        </td>

                        {/* 4. Tokens Breakdown (Prompt, Completion, Cached) */}
                        <td className="py-4 px-4 whitespace-nowrap font-mono text-xs">
                          {/* Top Line: ↓ Prompt, ↑ Completion, (i) */}
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

                          {/* Bottom Line: Cache Box & Cached Tokens */}
                          <div className="flex items-center space-x-1.5 mt-1 text-sky-400 text-[11px]">
                            <Database className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>{formatCached(cached)}</span>
                          </div>
                        </td>

                        {/* 5. Price & Cost */}
                        <td className="py-4 px-4 whitespace-nowrap font-mono text-xs">
                          {/* Top Line: Green Price (i) */}
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-emerald-400 text-[13px]">
                              {priceFormatted}
                            </span>
                            <span title="Deduction details" className="text-slate-500 hover:text-slate-300 cursor-pointer">
                              <Info className="w-3.5 h-3.5 inline -mt-0.5" />
                            </span>
                          </div>

                          {/* Bottom Line: Orange Cost A $... */}
                          <div className="text-amber-400 text-[11px] mt-0.5 font-medium">
                            {costFormatted}
                          </div>
                        </td>

                        {/* 6. Latency with Left Vertical Bar */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className={`pl-2.5 py-0.5 border-l-2 font-mono text-xs ${isLong ? 'border-amber-400' : 'border-emerald-500'}`}>
                            {/* Top Line: First Token (TTFT) */}
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-400 text-[11px] font-sans">TTFT</span>
                              <span className="text-emerald-400 font-medium">{firstTokenLatency}</span>
                            </div>

                            {/* Bottom Line: Total Latency */}
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-slate-400 text-[11px] font-sans">Total</span>
                              <span className={`font-medium ${isLong ? 'text-amber-400 font-bold' : 'text-emerald-400'}`}>
                                {totalLatency}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 7. Timestamp */}
                        <td className="py-4 px-4 text-right whitespace-nowrap font-mono text-xs text-slate-400">
                          {timestampFormatted}
                        </td>
                      </tr>

                      {/* Expandable Technical Audit Row */}
                      {isExpanded && (
                        <tr className="bg-background/60 border-t border-b border-surfaceBorder/40">
                          <td colSpan={7} className="px-6 py-3.5 text-xs text-slate-300">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-1">
                              <div>
                                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Request ID</span>
                                <span className="font-mono text-slate-300 text-[11px] select-all">{log.id}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Model Identifier</span>
                                <span className="font-mono text-primary-400 text-[11px] font-semibold">{log.model}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Multiplier Rate</span>
                                <span className="font-mono text-amber-300 text-[11px]">{mult}x rate deduction</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Cache Efficiency</span>
                                <span className="font-mono text-sky-400 text-[11px]">
                                  {cached > 0 ? `${cached.toLocaleString()} tokens saved` : '0 tokens cached'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Status</span>
                                <span className={`inline-flex items-center gap-1 font-mono text-[11px] ${log.statusCode === 200 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {log.statusCode === 200 ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                  <span>HTTP {log.statusCode}</span>
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredLogs.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-background/50 border-t border-surfaceBorder text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>
                  Showing <strong className="text-slate-200">{Math.min((currentPage - 1) * pageSize + 1, filteredLogs.length)}</strong> to{' '}
                  <strong className="text-slate-200">{Math.min(currentPage * pageSize, filteredLogs.length)}</strong> of{' '}
                  <strong className="text-slate-200">{filteredLogs.length}</strong> requests
                </span>
                <span className="text-slate-600">|</span>
                <div className="flex items-center gap-1.5">
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={e => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 rounded bg-background border border-surfaceBorder text-slate-200 text-xs focus:outline-none focus:border-primary-500"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-surfaceBorder text-slate-300 hover:bg-surfaceHover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                    .map((page, idx, arr) => (
                      <React.Fragment key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-1 text-slate-600 select-none">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[28px] h-7 px-2 rounded-md font-mono text-xs transition-colors ${
                            currentPage === page
                              ? 'bg-primary-600 text-white font-bold shadow-sm'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-surfaceHover border border-surfaceBorder'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-surfaceBorder text-slate-300 hover:bg-surfaceHover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
