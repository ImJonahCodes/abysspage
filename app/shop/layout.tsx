'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerSidebar } from '@/components/layout/customer-sidebar';
import { CartProvider } from '@/lib/cart';
import { supabase } from '@/lib/supabase';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: siteUser } = await supabase
        .from('site_users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (siteUser?.role === 'admin') {
        router.push('/dashboard');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <CartProvider>
      <div className="flex min-h-screen bg-background">
        <CustomerSidebar className="border-r border-border" />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </CartProvider>
  );
}