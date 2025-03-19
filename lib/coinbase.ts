import { supabase } from '@/lib/supabase';
import axios from 'axios';

const COINBASE_API_KEY = process.env.NEXT_PUBLIC_COINBASE_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const WEBHOOK_SECRET = process.env.COINBASE_WEBHOOK_SECRET;

if (!COINBASE_API_KEY) {
  throw new Error('Missing COINBASE_API_KEY environment variable');
}

export async function createCoinbaseCharge(amount: number): Promise<{ url: string; id: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Not authenticated');

    const response = await axios.post(
      'https://api.commerce.coinbase.com/charges',
      {
        name: 'Add Funds',
        description: 'Add funds to your account balance',
        local_price: {
          amount: amount.toString(),
          currency: 'USD'
        },
        pricing_type: 'fixed_price',
        redirect_url: `${APP_URL}/shop`,
        cancel_url: `${APP_URL}/shop`,
        metadata: {
          user_id: session.user.id
        }
      },
      {
        headers: {
          'X-CC-Api-Key': COINBASE_API_KEY,
          'X-CC-Version': '2018-03-22',
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      url: response.data.data.hosted_url,
      id: response.data.data.id
    };
  } catch (error: any) {
    console.error('Error creating Coinbase charge:', error);
    throw new Error(error.message || 'Failed to create payment');
  }
}

export function verifyCoinbaseWebhook(
  rawBody: string,
  signature: string
): boolean {
  try {
    if (!WEBHOOK_SECRET) {
      throw new Error('Missing COINBASE_WEBHOOK_SECRET environment variable');
    }

    // Split the signature into timestamp and signatures
    const [timestamp, signatures] = signature.split(',');
    const timestampValue = timestamp.split('=')[1];
    const signaturesValue = signatures.split('=')[1];

    // Create the message to sign
    const message = timestampValue + rawBody;

    // Convert message and secret to Uint8Array
    const encoder = new TextEncoder();
    const messageData = encoder.encode(message);
    const secretData = encoder.encode(WEBHOOK_SECRET);

    // Import key
    return crypto.subtle.importKey(
      'raw',
      secretData,
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    ).then(key => crypto.subtle.sign(
      'HMAC',
      key,
      messageData
    )).then(signature => {
      // Convert to hex
      const calculatedSignature = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      return calculatedSignature === signaturesValue;
    });
  } catch (error) {
    console.error('Webhook verification failed:', error);
    return false;
  }
}