import { supabase } from '@/lib/supabase';
import axios from 'axios';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export async function createPayVraPayment(amount: number): Promise<{ url: string; id: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    let lastError;
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const response = await axios.post('/api/payments/create', {
          amount,
          userId: session.user.id,
        });

        if (!response.data.payment_url) {
          throw new Error('No payment URL received');
        }

        return {
          url: response.data.payment_url,
          id: response.data.id
        };
      } catch (error: any) {
        lastError = error;
        if (i < MAX_RETRIES - 1) {
          if (axios.isAxiosError(error) && error.response?.status === 526) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          }
        }
        break;
      }
    }
    
    throw lastError;
  } catch (error: any) {
    console.error('Error creating payment:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 526) {
        throw new Error('Payment service temporarily unavailable. Please try again in a few moments.');
      }
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      throw new Error(errorMessage || 'Failed to create payment');
    }
    throw error;
  }
}