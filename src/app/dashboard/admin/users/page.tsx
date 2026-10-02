'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminUsersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/admin?tab=users');
  }, [router]);

  return (
    <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <span>Loading User Management...</span>
    </div>
  );
}
