'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CardsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/cards/unchecked');
  }, [router]);

  return null;
}