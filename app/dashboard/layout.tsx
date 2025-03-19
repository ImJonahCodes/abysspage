'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { supabase } from '@/lib/supabase';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar className="border-r border-border" />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}