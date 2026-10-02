'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Tag,
  Search,
  Calculator,
  Copy,
  Check,
  Zap,
  Layers,
  Clock,
  Sparkles,
  Terminal,
  Cpu,
  MessageCircle,
  ArrowRight
} from 'lucide-react';

interface ModelInfo {
  id: string;
  name: string;
  poolId: 'starter' | 'plus' | 'pro' | 'vip' | 'claude-opus' | 'claude-max';
  poolName: string;
  multiplier: number;
  multiplierLabel: string;
  contextWindow: string;
  description: string;
  isPopular?: boolean;
  isPromo?: boolean;
}

const POOLS_OVERVIEW = [
  {
    id: 'starter',
    name: 'GPT Starter (Welfare)',
    multiplier: '0.16x',
    badge: '0.16x Multiplier',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: 'Promotional high-value quota pool based on HZ Welfare group. Supports Astra, Sol, and GPT-4o-mini at rock-bottom deduction rates.',
    models: ['astra', 'sol', 'gpt-4o-mini', 'gpt-5.4-mini', 'gpt-6-astra', 'gpt-6-sol'],
    highlight: 'Lowest token deduction rate (0.16x)'
  },
  {
    id: 'plus',
    name: 'GPT Plus',
    multiplier: '0.325x',
    badge: '0.325x Multiplier',
    badgeColor: 'bg-primary-500/15 text-primary-400 border-primary-500/30',
    description: 'High-throughput production pool based on HZ Plus group. Ideal for Cursor IDE, daily coding assistants, and standard workloads.',
    models: ['gpt-4o', 'chatgpt-4o-latest', 'gpt-5.6', 'astra', 'sol'],
    highlight: 'High concurrency production'
  },
  {
    id: 'pro',
    name: 'GPT Pro',
    multiplier: '0.45x',
    badge: '0.45x Multiplier',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    description: 'Deep reasoning pool based on HZ Pro group featuring Sol and Terra with advanced internal chain-of-thought.',
    models: ['sol', 'terra', 'gpt-5.6-sol', 'gpt-6-sol'],
    highlight: 'Deep reasoning & STEM logic'
  },
  {
    id: 'vip',
    name: 'GPT Pro VIP',
    multiplier: '0.45x',
    badge: '0.45x Multiplier',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    description: 'Flagship reasoning pool based on HZ Pro VIP group featuring Astra and OpenAI o1 / o3-mini.',
    models: ['astra', 'gpt-6-astra', 'o1', 'o3-mini'],
    highlight: 'Flagship frontier intelligence'
  },
  {
    id: 'claude-opus',
    name: 'Claude Opus 5',
    multiplier: '0.24x',
    badge: '0.24x Multiplier',
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    description: 'Anthropic Claude intelligence pool based on HZ Opus 5 group for coding, deep writing, and comprehensive analysis.',
    models: ['claude-opus-5', 'claude-sonnet-5', 'fable'],
    highlight: 'Anthropic Opus & Sonnet reasoning'
  },
  {
    id: 'claude-max',
    name: 'Claude Max',
    multiplier: '3.00x',
    badge: '3.00x Multiplier',
    badgeColor: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    description: 'Premier Anthropic flagship model based on HZ Claude Max group with hybrid thinking and Claude Code CLI support.',
    models: ['claude-3-7-sonnet-20250219', 'claude-3-5-sonnet-20241022', 'claude-opus-5'],
    highlight: 'Claude Code CLI native support'
  }
];

const MODELS_DATA: ModelInfo[] = [
  // Claude Max (3.00x)
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet (Hybrid Thinking)',
    poolId: 'claude-max',
    poolName: 'Claude Max (3.00x)',
    multiplier: 3.00,
    multiplierLabel: '3.00x',
    contextWindow: '200K',
    description: 'Anthropic frontier hybrid reasoning model with adjustable thinking time for complex coding and Claude Code CLI.',
    isPopular: true
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet v2',
    poolId: 'claude-max',
    poolName: 'Claude Max (3.00x)',
    multiplier: 3.00,
    multiplierLabel: '3.00x',
    contextWindow: '200K',
    description: 'Top-tier code generation, architecture planning, and multi-file refactoring.'
  },

  // GPT Pro VIP (0.45x)
  {
    id: 'astra',
    name: 'OpenAI Astra Flagship',
    poolId: 'vip',
    poolName: 'GPT Pro VIP (0.45x)',
    multiplier: 0.45,
    multiplierLabel: '0.45x',
    contextWindow: '200K',
    description: 'Frontier flagship intelligence for sustained multi-step reasoning, tool use, and complex agentic workflows.',
    isPopular: true
  },
  {
    id: 'gpt-6-astra',
    name: 'GPT-6 Astra',
    poolId: 'vip',
    poolName: 'GPT Pro VIP (0.45x)',
    multiplier: 0.45,
    multiplierLabel: '0.45x',
    contextWindow: '200K',
    description: 'Full unthrottled flagship access with highest limit tier.'
  },
  {
    id: 'o1',
    name: 'OpenAI o1',
    poolId: 'vip',
    poolName: 'GPT Pro VIP (0.45x)',
    multiplier: 0.45,
    multiplierLabel: '0.45x',
    contextWindow: '200K',
    description: 'PhD-level STEM, competitive programming, and deep logic analysis.'
  },
  {
    id: 'o3-mini',
    name: 'OpenAI o3-mini',
    poolId: 'vip',
    poolName: 'GPT Pro VIP (0.45x)',
    multiplier: 0.45,
    multiplierLabel: '0.45x',
    contextWindow: '200K',
    description: 'Next-generation low-latency reasoning model with high math & coding efficiency.'
  },

  // GPT Pro (0.45x)
  {
    id: 'sol',
    name: 'OpenAI Sol Reasoning',
    poolId: 'pro',
    poolName: 'GPT Pro (0.45x)',
    multiplier: 0.45,
    multiplierLabel: '0.45x',
    contextWindow: '128K',
    description: 'High-performance deep reasoning model for competitive coding, STEM analysis, and difficult software architecture.',
    isPopular: true
  },
  {
    id: 'terra',
    name: 'OpenAI Terra',
    poolId: 'pro',
    poolName: 'GPT Pro (0.45x)',
    multiplier: 0.45,
    multiplierLabel: '0.45x',
    contextWindow: '128K',
    description: 'High-concurrency STEM and reasoning workhorse.'
  },
  {
    id: 'gpt-5.6-sol',
    name: 'GPT-5.6 Sol',
    poolId: 'pro',
    poolName: 'GPT Pro (0.45x)',
    multiplier: 0.45,
    multiplierLabel: '0.45x',
    contextWindow: '128K',
    description: 'Upstream full model name for Sol reasoning.'
  },

  // Claude Opus 5 (0.24x)
  {
    id: 'claude-opus-5',
    name: 'Claude Opus 5',
    poolId: 'claude-opus',
    poolName: 'Claude Opus 5 (0.24x)',
    multiplier: 0.24,
    multiplierLabel: '0.24x',
    contextWindow: '200K',
    description: 'Top-tier analysis, deep writing, creative architecture, and thoughtful comprehension.',
    isPopular: true
  },
  {
    id: 'claude-sonnet-5',
    name: 'Claude Sonnet 5',
    poolId: 'claude-opus',
    poolName: 'Claude Opus 5 (0.24x)',
    multiplier: 0.24,
    multiplierLabel: '0.24x',
    contextWindow: '200K',
    description: 'Balanced speed and high intelligence for software engineering.'
  },
  {
    id: 'fable',
    name: 'Claude Fable 5',
    poolId: 'claude-opus',
    poolName: 'Claude Opus 5 (0.24x)',
    multiplier: 0.24,
    multiplierLabel: '0.24x',
    contextWindow: '200K',
    description: 'Specialized narrative and code comprehension model.'
  },

  // GPT Plus (0.325x)
  {
    id: 'gpt-4o',
    name: 'GPT-4o Multimodal',
    poolId: 'plus',
    poolName: 'GPT Plus (0.325x)',
    multiplier: 0.325,
    multiplierLabel: '0.325x',
    contextWindow: '128K',
    description: 'High-throughput daily development channel for Cursor IDE, coding assistants, and standard workloads.',
    isPopular: true
  },
  {
    id: 'chatgpt-4o-latest',
    name: 'ChatGPT-4o Latest',
    poolId: 'plus',
    poolName: 'GPT Plus (0.325x)',
    multiplier: 0.325,
    multiplierLabel: '0.325x',
    contextWindow: '128K',
    description: 'Dynamic flagship release mirroring standard chat applications.'
  },

  // GPT Starter / Welfare (0.16x)
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    poolId: 'starter',
    poolName: 'GPT Starter (0.16x)',
    multiplier: 0.1625,
    multiplierLabel: '0.16x',
    contextWindow: '128K',
    description: 'Fast, lightweight intelligence for routine high-frequency operations, bots, and background tasks.',
    isPromo: true
  },
  {
    id: 'gpt-5.4-mini',
    name: 'GPT-5.4 Mini',
    poolId: 'starter',
    poolName: 'GPT Starter (0.16x)',
    multiplier: 0.1625,
    multiplierLabel: '0.16x',
    contextWindow: '128K',
    description: 'Next-generation lightweight automation model.'
  }
];

export default function ModelPricingPage() {
  const [search, setSearch] = useState('');
  const [selectedPool, setSelectedPool] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Cost Calculator State
  const [calcModel, setCalcModel] = useState<string>('claude-3-7-sonnet-20250219');
  const [calcPromptTokens, setCalcPromptTokens] = useState<number>(2000);
  const [calcCompletionTokens, setCalcCompletionTokens] = useState<number>(1000);

  const filteredModels = useMemo(() => {
    return MODELS_DATA.filter(m => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase()) ||
        m.poolName.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase());

      const matchesPool = selectedPool === 'all' || m.poolId === selectedPool;
      return matchesSearch && matchesPool;
    });
  }, [search, selectedPool]);

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculator computations
  const currentCalcModel = MODELS_DATA.find(m => m.id === calcModel) || MODELS_DATA[0];
  const totalRawTokens = (calcPromptTokens || 0) + (calcCompletionTokens || 0);
  const effectiveTokensDeducted = Math.round(totalRawTokens * currentCalcModel.multiplier);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <Tag className="w-6 h-6 text-primary-400" />
              <span>Model Routing Pools & Transparent Pricing</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Pay-as-you-go platform balance supporting 6 dedicated routing groups for OpenAI Astra & Sol (0.16x–0.45x) and Anthropic Claude 3.7 / Opus (0.24x–3.00x).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              6 Channels Active 24/7
            </span>
          </div>
        </div>
      </div>

      {/* Top-up Platform Balance Workflow Cards */}
      <div className="bg-surface/50 border border-surfaceBorder rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="text-xs uppercase tracking-wider font-semibold text-primary-400 mb-3 flex items-center gap-1.5">
          <Zap className="w-4 h-4" />
          <span>How It Works: Top-Up Balance & Route Requests</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-background/80 border border-surfaceBorder/80 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-primary-500/20 text-primary-300 flex items-center justify-center font-bold text-xs mb-2">1</div>
              <div className="font-semibold text-sm text-slate-200 mb-1">Top Up Balance</div>
              <p className="text-xs text-slate-400">Redeem a CDK activation token code to add permanent balance.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-background/80 border border-surfaceBorder/80 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-primary-500/20 text-primary-300 flex items-center justify-center font-bold text-xs mb-2">2</div>
              <div className="font-semibold text-sm text-slate-200 mb-1">Generate API Key</div>
              <p className="text-xs text-slate-400">Create a gateway key (<code>sk-gw-...</code>) with customized spending limits.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-background/80 border border-surfaceBorder/80 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-primary-500/20 text-primary-300 flex items-center justify-center font-bold text-xs mb-2">3</div>
              <div className="font-semibold text-sm text-slate-200 mb-1">Configure Client</div>
              <p className="text-xs text-slate-400">Set base URL to <code>https://jj-ai-gateway.onrender.com</code>.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-background/80 border border-surfaceBorder/80 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-primary-500/20 text-primary-300 flex items-center justify-center font-bold text-xs mb-2">4</div>
              <div className="font-semibold text-sm text-slate-200 mb-1">Select Channel</div>
              <p className="text-xs text-slate-400">Request any model (Astra, Sol, Claude 3.7) with transparent multiplier deductions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Dedicated Pools Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary-400" />
            <span>The 6 Routing Groups</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">OpenAI & Anthropic Compatible</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {POOLS_OVERVIEW.map(pool => (
            <div
              key={pool.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                selectedPool === pool.id
                  ? 'bg-surface border-primary-500 shadow-md ring-1 ring-primary-500/30'
                  : 'bg-surface border-surfaceBorder hover:border-surfaceBorder/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${pool.badgeColor}`}>
                    {pool.badge}
                  </span>
                  <span className="text-xl font-bold font-mono text-amber-300">{pool.multiplier}</span>
                </div>

                <h3 className="text-base font-bold text-slate-100">{pool.name}</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">{pool.description}</p>

                <div className="space-y-1.5 border-t border-surfaceBorder/60 pt-3">
                  <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Models in Group:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {pool.models.map(m => (
                      <span key={m} className="px-2 py-0.5 rounded bg-background/80 border border-surfaceBorder text-[11px] font-mono text-primary-300">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-surfaceBorder/60 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-medium">{pool.highlight}</span>
                <button
                  onClick={() => setSelectedPool(selectedPool === pool.id ? 'all' : pool.id)}
                  className="text-xs text-primary-400 hover:text-primary-300 font-semibold"
                >
                  {selectedPool === pool.id ? 'Show All' : 'Filter'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claude Code CLI Callout */}
      <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-950/20 to-purple-950/20 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              <span>CLAUDE CODE CLI ACTIVE</span>
            </span>
            <h3 className="text-base font-bold text-slate-100">Native Anthropic Messages API Support</h3>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Run Claude Code CLI directly by setting <code>ANTHROPIC_BASE_URL="https://jj-ai-gateway.onrender.com"</code> and your gateway API key in your environment.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Verified Live
          </span>
        </div>
      </div>

      {/* Interactive Token Cost Estimator */}
      <div className="bg-surface border border-surfaceBorder rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-primary-400">
          <Calculator className="w-5 h-5" />
          <h2 className="text-base font-bold text-slate-100">Interactive Multiplier Quota Estimator</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Simulate quota deductions based on your request tokens and selected group multiplier.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Target Model & Group</label>
            <select
              value={calcModel}
              onChange={e => setCalcModel(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-background border border-surfaceBorder text-slate-100 text-sm focus:outline-none focus:border-primary-500"
            >
              {MODELS_DATA.map(m => (
                <option key={`${m.poolId}-${m.id}`} value={m.id}>
                  {m.name} ({m.multiplierLabel})
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Group Multiplier: {currentCalcModel.multiplier}x ({currentCalcModel.poolName})</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Prompt Tokens (Input)</label>
            <input
              type="number"
              min={1}
              step={500}
              value={calcPromptTokens}
              onChange={e => setCalcPromptTokens(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2 rounded-lg bg-background border border-surfaceBorder text-slate-100 font-mono text-sm focus:outline-none focus:border-primary-500"
            />
            <div className="text-[11px] text-slate-500">Your prompt and contextual input tokens</div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Completion Tokens (Output)</label>
            <input
              type="number"
              min={0}
              step={500}
              value={calcCompletionTokens}
              onChange={e => setCalcCompletionTokens(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2 rounded-lg bg-background border border-surfaceBorder text-slate-100 font-mono text-sm focus:outline-none focus:border-primary-500"
            />
            <div className="text-[11px] text-slate-500">Tokens generated by the model response</div>
          </div>
        </div>

        {/* Computation Summary */}
        <div className="mt-6 pt-5 border-t border-surfaceBorder flex flex-wrap items-center justify-between gap-4 bg-background/50 -mx-5 -mb-5 p-5 rounded-b-2xl">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Total Raw Request Tokens</div>
            <div className="text-base font-bold font-mono text-slate-200">
              {totalRawTokens.toLocaleString()} Tokens
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400">Group Multiplier</div>
            <div className="text-base font-bold font-mono text-primary-400">
              {currentCalcModel.multiplier}x ({currentCalcModel.poolName})
            </div>
          </div>

          <div className="space-y-1 sm:text-right">
            <div className="text-xs font-semibold text-amber-400">Estimated Balance Deduction</div>
            <div className="text-xl font-bold font-mono text-amber-300">
              {effectiveTokensDeducted.toLocaleString()} Tokens
            </div>
          </div>
        </div>
      </div>

      {/* Directory of Models Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Model Directory & Routing Groups</h2>
            <p className="text-xs text-slate-400">Search and filter models across all 6 groups by name or multiplier</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search models, groups..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-lg bg-surface border border-surfaceBorder text-slate-100 text-xs focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Pool Filter */}
            <select
              value={selectedPool}
              onChange={e => setSelectedPool(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-surface border border-surfaceBorder text-slate-100 text-xs focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Groups</option>
              <option value="starter">GPT Starter (0.16x)</option>
              <option value="plus">GPT Plus (0.325x)</option>
              <option value="pro">GPT Pro (0.45x)</option>
              <option value="vip">GPT Pro VIP (0.45x)</option>
              <option value="claude-opus">Claude Opus 5 (0.24x)</option>
              <option value="claude-max">Claude Max (3.00x)</option>
            </select>
          </div>
        </div>

        <div className="bg-surface border border-surfaceBorder rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-background/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-surfaceBorder">
                <tr>
                  <th className="py-3.5 px-4">Model Identifier</th>
                  <th className="py-3.5 px-4">Routing Group</th>
                  <th className="py-3.5 px-4">Multiplier</th>
                  <th className="py-3.5 px-4">Context</th>
                  <th className="py-3.5 px-4">Target Use Case</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surfaceBorder">
                {filteredModels.map(m => (
                  <tr key={`${m.poolId}-${m.id}`} className="hover:bg-background/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span>{m.id}</span>
                        {m.isPopular && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-sans font-bold bg-primary-500/20 text-primary-400">
                            POPULAR
                          </span>
                        )}
                        {m.isPromo && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-sans font-bold bg-emerald-500/20 text-emerald-400">
                            PROMO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">{m.poolName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300">{m.multiplierLabel}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{m.contextWindow}</td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-md">{m.description}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => copyId(m.id)}
                        className="px-2.5 py-1 rounded bg-background border border-surfaceBorder text-slate-300 hover:text-white hover:border-slate-500 transition-colors font-mono inline-flex items-center gap-1"
                        title="Copy model ID"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[10px]">Copy</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* WhatsApp Top-up & Redeem Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 via-surface to-surface border border-emerald-500/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Direct WhatsApp Top-Up</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Need More Token Balance? WhatsApp <span className="text-emerald-400 font-mono">0178241445</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Choose your quota tier (1M, 5M, 10M, or 20M tokens) and message admin directly on WhatsApp. Receive your instant CDK activation code and redeem it on the Payment page!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://wa.me/60178241445?text=Hi%2C%20I%20would%20like%20to%20top%20up%20AI%20Gateway%20credits"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-slate-950" />
            <span>Chat on WhatsApp</span>
          </a>

          <Link
            href="/dashboard/payment"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-surfaceBorder hover:border-slate-500 text-slate-200 text-xs font-semibold transition-all"
          >
            <span>Go to Top-Up & Redeem</span>
            <ArrowRight className="w-3.5 h-3.5 text-primary-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
