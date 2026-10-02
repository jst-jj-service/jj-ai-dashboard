'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedeemRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/payment');
  }, [router]);

  return (
    <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <span>Routing to Top-Up & Payment...</span>
    </div>
  );
}
