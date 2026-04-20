import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const SERVICE_PRICES: Record<string, number> = {
  'Classic Haircut ($35)': 3500,
  'Skin Fade ($40)': 4000,
  'Buzz Cut ($25)': 2500,
  'Scissor Cut ($45)': 4500,
  'Beard Sculpting ($25)': 2500,
  'Traditional Hot Towel Shave ($40)': 4000,
  'The Full Gentleman ($55)': 5500,
  'The Executive VIP ($80)': 8000,
};

export async function POST(request: Request) {
  // Check if Stripe is configured
  if (!stripe) {
    return NextResponse.json(
      { error: 'Payment system not configured. Please set STRIPE_SECRET_KEY environment variable.' },
      { status: 500 }
    );
  }

  try {
    const { service, name, phone, date, time } = await request.json();

    // Get price from service name
    const priceInCents = SERVICE_PRICES[service] || 3500;
    const serviceName = service.split(' ($')[0];

    const bookingData = {
      name,
      phone,
      service: serviceName,
      date,
      time,
      status: 'pending_payment',
      payment_status: 'pending',
    };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Barbershop Appointment - ${serviceName}`,
              description: `Appointment on ${date} at ${time}`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking=${Buffer.from(JSON.stringify(bookingData)).toString('base64')}`,
      cancel_url: `${baseUrl}/booking?canceled=true`,
      metadata: {
        booking_data: JSON.stringify(bookingData),
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
