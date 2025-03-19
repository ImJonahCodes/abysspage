import { NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    // Create a customer to attach the card to
    const customer = await stripe.customers.create({
      source: token,
    });
    
    try {
      // Create a setup intent instead of a payment intent
      const setupIntent = await stripe.setupIntents.create({
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
        customer: customer.id,
        payment_method: customer.default_source as string,
        usage: 'off_session',
        confirm: true
      });

      if (setupIntent.status === 'succeeded') {
        await stripe.customers.del(customer.id);
        return NextResponse.json({
          success: true,
          status: 'live',
          card: {
            brand: customer.sources?.data[0]?.brand,
            last4: customer.sources?.data[0]?.last4,
            funding: customer.sources?.data[0]?.funding,
            country: customer.sources?.data[0]?.country,
          },
        });
      } else if (setupIntent.status === 'requires_action') {
        // Card requires 3D Secure
        await stripe.customers.del(customer.id);
        return NextResponse.json({
          success: false,
          status: 'dead',
          error: 'Card requires additional authentication (3D Secure)'
        });
      }
      
      // If we get here, something unexpected happened
      await stripe.customers.del(customer.id);
      return NextResponse.json({ 
        success: false,
        status: 'dead',
        error: 'Unexpected setup intent status'
      });
    } catch (authError: any) {
      // Clean up the customer even if authorization fails
      await stripe.customers.del(customer.id);

      return NextResponse.json({
        success: false,
        status: 'dead',
        error: authError.message,
      });
    }
  } catch (error: any) {
    console.error('Card check error:', error);
    return NextResponse.json({
      success: false,
      status: 'invalid',
      error: error.message,
    }, { status: 400 });
  }
}