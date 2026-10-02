'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { ShoppingBag, Zap, User, LogOut, Shield } from 'lucide-react';

export function Navbar() {
  const { user, quota, logout } = useAuth();
  const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || 'https://your-shop.com';

  const remainingTokens = quota?.remainingTokens ?? 0;
  const isZeroQuota = remainingTokens <= 0;
  const isLowQuota = !isZeroQuota && remainingTokens < 100_000;

  return (
    <header className="h-16 border-b border-surfaceBorder bg-surface/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <Link href="/dashboard" className="flex items-center space-x-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            AI Gateway
          </span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* Shop Link Button */}
        <a
          href={shopUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Buy Tokens / CDKs</span>
        </a>

        {/* Quota Badge */}
        {quota && (
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isZeroQuota
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : isLowQuota
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>Quota: {quota.remainingTokensFormatted} tokens</span>
          </div>
        )}

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center space-x-3 pl-2 border-l border-surfaceBorder">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-surfaceBorder flex items-center justify-center text-slate-300">
                {user.role === 'ADMIN' ? <Shield className="w-4 h-4 text-primary-400" /> : <User className="w-4 h-4" />}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-medium text-slate-200 leading-tight">
                  {user.name || user.email.split('@')[0]}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {user.role}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
