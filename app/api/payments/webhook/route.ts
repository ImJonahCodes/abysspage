import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyCoinbaseWebhook } from '@/lib/coinbase';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('X-CC-Webhook-Signature');
    
    // Verify webhook signature
    if (!signature || !(await verifyCoinbaseWebhook(rawBody, signature))) {
      console.error('Invalid signature received');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const userId = event.data.metadata.user_id;
    const amount = parseFloat(event.data.pricing.local.amount);

    if (!userId) {
      console.error('No user ID in webhook metadata');
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
    }

    console.log('Received webhook event:', {
      type: event.type,
      userId,
      amount,
      paymentId: event.data.id
    });

    // Add payment status to user's balance logs
    const logEntry = {
      type: event.type.toLowerCase(),
      amount,
      payment_id: event.data.id,
      timestamp: new Date().toISOString(),
    };

    // If payment is completed, update the user's balance
    if (event.type === 'charge:confirmed') {
      const { error: balanceError } = await supabase
        .rpc('update_balance_and_logs', {
          p_user_id: userId,
          p_amount: amount,
          p_log_entry: logEntry
        });

      if (balanceError) {
        console.error('Error updating balance:', balanceError);
        throw balanceError;
      }
    } else {
      // For other statuses, just update the logs
      const { error: logError } = await supabase
        .rpc('append_balance_log', {
          p_user_id: userId,
          p_log_entry: logEntry
        });

      if (logError) {
        console.error('Error updating balance logs:', logError);
        throw logError;
      }
    }

    // Handle specific payment statuses
    switch (event.type) {
      case 'charge:confirmed':
        console.log('Payment completed:', {
          userId,
          amount,
          paymentId: event.data.id
        });
        break;

      case 'charge:pending':
        console.log('Payment pending:', {
          userId,
          amount,
          paymentId: event.data.id
        });
        break;

      case 'charge:created':
        console.log('Payment created:', {
          userId,
          amount,
          paymentId: event.data.id
        });
        break;

      case 'charge:failed':
        console.log('Payment failed:', {
          userId,
          amount,
          paymentId: event.data.id
        });
        break;

      case 'charge:delayed':
        console.log('Payment delayed:', {
          userId,
          amount,
          paymentId: event.data.id
        });
        break;

      default:
        console.log('Unhandled webhook event type:', event.type);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}