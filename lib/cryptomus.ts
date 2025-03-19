import { supabase } from '@/lib/supabase';

interface CryptomusPayment {
  uuid: string;
  url: string;
  status: string;
  currency: string;
  amount: string;
}

export async function createCryptomusPayment(amount: number): Promise<CryptomusPayment> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Create payment request to your backend API
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        userId: session.user.id,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}