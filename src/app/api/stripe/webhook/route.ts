import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe only if key is available
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  // Handle webhook without Stripe key (for build/development)
  if (!stripe || !webhookSecret) {
    console.log('Stripe not configured, skipping webhook processing');
    return NextResponse.json({ received: true, message: 'Webhook skipped (not configured)' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Get booking data from metadata
      const bookingData = JSON.parse(session.metadata?.booking_data || '{}');
      
      // Create Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Insert booking into appointments table
        const { error } = await supabase.from('appointments').insert({
          name: bookingData.name,
          phone: bookingData.phone,
          service: bookingData.service,
          date: bookingData.date,
          time: bookingData.time,
          status: 'confirmed',
          payment_status: 'paid',
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent as string,
          amount_paid: session.amount_total || 0,
          currency: session.currency || 'eur',
        });

        if (error) {
          console.error('Failed to insert appointment:', error);
        } else {
          console.log('Appointment created successfully:', bookingData);
          
          // Send confirmation email
          try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/confirmation`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: bookingData.name,
                phone: bookingData.phone,
                service: bookingData.service,
                date: bookingData.date,
                time: bookingData.time,
                email: session.customer_details?.email,
              }),
            });
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
          }
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', paymentIntent.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
