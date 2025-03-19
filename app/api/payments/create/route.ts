import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createCoinbaseCharge } from '@/lib/coinbase';

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create Coinbase charge
    const payment = await createCoinbaseCharge(amount);

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}