'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  Phone,
  Copy,
  Check,
  Ticket,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { ApiClient } from '../../../lib/api-client';
import { useAuth } from '../../../lib/auth-context';

export default function PaymentTopupPage() {
  const { quota, refreshUser } = useAuth();
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [cdkCode, setCdkCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<{
    tokensAddedFormatted: string;
    newRemainingFormatted: string;
  } | null>(null);

  const phoneNumber = '0178241445';
  const whatsappUrl = 'https://wa.me/60178241445?text=Hi%2C%20I%20would%20like%20to%20top%20up%20AI%20Gateway%20credits';

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemError(null);
    setRedeemSuccess(null);

    const trimmed = cdkCode.trim().toUpperCase();
    if (!trimmed) {
      setRedeemError('Please enter your CDK activation code');
      return;
    }

    setRedeemLoading(true);
    try {
      const res = await ApiClient.cdk.redeem(trimmed);
      if (res.data?.success) {
        setRedeemSuccess({
          tokensAddedFormatted: res.data.tokensAddedFormatted,
          newRemainingFormatted: res.data.quota.remainingTokensFormatted
        });
        setCdkCode('');
        await refreshUser();
      } else {
        setRedeemError(res.error || 'Failed to redeem CDK key.');
      }
    } catch {
      setRedeemError('An unexpected error occurred while redeeming your CDK.');
    } finally {
      setRedeemLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <MessageCircle className="w-6 h-6 text-emerald-400" />
          <span>Redeem & Payment</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          WhatsApp admin at <strong className="text-emerald-400 font-mono">0178241445</strong> to top up your account, then redeem your CDK activation key below to recharge your balance.
        </p>
      </div>

      {/* Main WhatsApp Top-Up Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/40 via-surface to-surface border border-emerald-500/30 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Official Admin Contact for Top-Up</span>
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              WhatsApp 0178241445 for Top-Up
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              To recharge your account balance with AI tokens, please message me directly on WhatsApp at{' '}
              <strong className="text-emerald-400 font-mono text-base">{phoneNumber}</strong>.
              Upon payment confirmation, you will receive an instant CDK activation code to redeem below!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5 fill-slate-950" />
                <span>Chat on WhatsApp ({phoneNumber})</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={copyPhoneNumber}
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-surface border border-surfaceBorder hover:border-slate-500 text-slate-200 text-sm font-semibold transition-all"
              >
                {copiedPhone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                <span>{copiedPhone ? 'Copied Number!' : `Copy ${phoneNumber}`}</span>
              </button>
            </div>
          </div>

          {/* Quick Balance Status card */}
          <div className="bg-background/90 border border-surfaceBorder rounded-2xl p-5 md:p-6 w-full md:w-72 shrink-0 space-y-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Current Available Quota
            </span>
            <div className="text-3xl font-black text-amber-300 font-mono">
              {quota?.remainingTokensFormatted || '0'}
              <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">tokens</span>
            </div>
            <div className="text-xs text-slate-400 pt-2 border-t border-surfaceBorder flex justify-between">
              <span>Total Granted:</span>
              <span className="font-mono text-slate-200 font-semibold">{quota?.totalTokensFormatted || '0'}</span>
            </div>
            <div className="text-xs text-slate-400 flex justify-between">
              <span>Consumed:</span>
              <span className="font-mono text-slate-200 font-semibold">{quota?.usedTokensFormatted || '0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Step Top-Up Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-surface border border-surfaceBorder space-y-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm">
            1
          </div>
          <h3 className="text-sm font-bold text-slate-100">WhatsApp 0178241445</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Send a WhatsApp message to <span className="text-emerald-400 font-mono">0178241445</span> with your requested token package (1M, 5M, 10M, or 20M tokens).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surfaceBorder space-y-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-500/20 text-primary-400 font-bold flex items-center justify-center text-sm">
            2
          </div>
          <h3 className="text-sm font-bold text-slate-100">Receive Your CDK Code</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            After simple payment verification, the admin will send you a unique 12-character activation key formatted as <code className="text-primary-300 font-mono">CDK-XXXX-XXXX-XXXX</code>.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surfaceBorder space-y-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-sm">
            3
          </div>
          <h3 className="text-sm font-bold text-slate-100">Redeem & Start Using</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Paste your CDK activation key into the form below. Quota is added immediately with permanent validity across all 6 model pools.
          </p>
        </div>
      </div>

      {/* Embedded CDK Redemption Box */}
      <div className="bg-surface rounded-2xl border border-surfaceBorder p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-surfaceBorder pb-4">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary-400" />
            <h2 className="text-base font-bold text-white">Have a CDK Code? Redeem It Here</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Instant Activation</span>
        </div>

        {/* Success Banner */}
        {redeemSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Key Redeemed Successfully!</span>
            </div>
            <div>
              Credited <strong className="text-white">+{redeemSuccess.tokensAddedFormatted}</strong> tokens to your balance.
              New remaining balance: <strong className="text-white">{redeemSuccess.newRemainingFormatted}</strong> tokens.
            </div>
          </div>
        )}

        {/* Error Banner */}
        {redeemError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {redeemError}
          </div>
        )}

        <form onSubmit={handleRedeem} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Enter CDK Activation Key
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={cdkCode}
                onChange={e => setCdkCode(e.target.value.toUpperCase())}
                placeholder="CDK-XXXX-XXXX-XXXX"
                className="flex-1 font-mono uppercase bg-background border border-surfaceBorder rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 tracking-wider text-sm"
              />
              <button
                type="submit"
                disabled={redeemLoading}
                className="flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-md shadow-primary-500/20 shrink-0"
              >
                <span>{redeemLoading ? 'Validating...' : 'Activate Quota'}</span>
                {!redeemLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Received your key via WhatsApp? Paste the full key including prefix (e.g. CDK-ABCD-EFGH-1234).
            </p>
          </div>
        </form>
      </div>

      {/* Available Token Tiers Card */}
      <div className="bg-surface rounded-2xl border border-surfaceBorder p-6 shadow-sm">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Popular Token Quota Tiers Available on WhatsApp
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              tier: 'Starter Tier',
              tokens: '1,000,000',
              highlight: 'Best for light test workloads & learning',
              multiplierHint: 'Equates to ~6.2M tokens on 0.16x pool'
            },
            {
              tier: 'Pro Tier',
              tokens: '5,000,000',
              highlight: 'Cursor IDE daily coding companion',
              multiplierHint: 'Equates to ~15.3M tokens on 0.325x pool'
            },
            {
              tier: 'Team Tier',
              tokens: '10,000,000',
              highlight: 'High volume coding & reasoning',
              multiplierHint: 'Equates to ~22.2M tokens on 0.45x pool'
            },
            {
              tier: 'Enterprise Tier',
              tokens: '20,000,000',
              highlight: 'Claude Code CLI heavy agentic builds',
              multiplierHint: 'Equates to ~6.6M tokens on 3.00x pool'
            }
          ].map(p => (
            <div key={p.tier} className="p-4 rounded-xl bg-background/80 border border-surfaceBorder flex flex-col justify-between space-y-3">
              <div>
                <div className="text-xs font-semibold text-primary-400 uppercase tracking-wider">{p.tier}</div>
                <div className="text-xl font-bold font-mono text-white mt-1">{p.tokens}</div>
                <div className="text-[11px] text-slate-400 mt-1">{p.highlight}</div>
              </div>
              <div className="pt-2 border-t border-surfaceBorder/60 text-[10px] text-emerald-400 font-mono">
                {p.multiplierHint}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
