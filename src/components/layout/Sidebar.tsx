'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import {
  LayoutDashboard,
  Ticket,
  KeyRound,
  Activity,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  Tag,
  Settings,
  Users,
  CreditCard,
  PlusCircle
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isLocalAdmin, setIsLocalAdmin] = useState(false);

  const currentAdminTab = searchParams?.get('tab') || 'dashboard';

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

      setIsLocalAdmin(user?.role === 'ADMIN' && isLocal);
    }
  }, [user]);

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Redeem & Payment', href: '/dashboard/payment', icon: CreditCard },
    { label: 'API Keys', href: '/dashboard/api-keys', icon: KeyRound },
    { label: 'Model Pricing', href: '/dashboard/pricing', icon: Tag },
    { label: 'Usage Logs', href: '/dashboard/usage', icon: Activity },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const adminNavItems = [
    { label: 'Admin Dashboard', href: '/dashboard/admin', icon: ShieldCheck, tab: 'dashboard' },
    { label: 'Manage Users & Credit', href: '/dashboard/admin?tab=users', icon: Users, tab: 'users' },
    { label: 'Generate Credit (CDK)', href: '/dashboard/admin?tab=cdk', icon: PlusCircle, tab: 'cdk' },
  ];

  const whatsappUrl = 'https://wa.me/60178241445?text=Hi%2C%20I%20would%20like%20to%20top%20up%20AI%20Gateway%20credits';

  return (
    <aside className="w-64 border-r border-surfaceBorder bg-surface/50 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Navigation
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/dashboard/payment' && pathname === '/dashboard/redeem');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-600/15 text-primary-400 border border-primary-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-surfaceHover'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Local-only Administration tab */}
        {isLocalAdmin && (
          <>
            <div className="text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider px-3 pt-5 pb-2 flex items-center justify-between">
              <span>Local Administration</span>
              <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/20">LOCAL</span>
            </div>
            {adminNavItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === '/dashboard/admin' && currentAdminTab === item.tab;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-surfaceHover'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </div>

      {/* WhatsApp Top-Up Banner Widget */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 mt-6">
        <div className="flex items-center space-x-2 text-emerald-400 mb-2">
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Top-Up Via WhatsApp</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          Need more AI tokens? WhatsApp <strong className="text-emerald-300 font-mono">0178241445</strong> to top up your account.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center space-x-1.5 text-xs font-bold py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md shadow-emerald-500/15"
        >
          <span>WhatsApp: 0178241445</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
}
