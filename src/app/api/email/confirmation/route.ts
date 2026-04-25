import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const { name, phone, service, date, time, email, notes } = await request.json();

    // Skip if Resend is not configured
    if (!resend) {
      console.log('Resend not configured, skipping email');
      return NextResponse.json({ success: true, message: 'Email skipped (not configured)' });
    }
    const adminEmail = process.env.ADMIN_EMAIL;

    // Send to customer if email provided
    if (email) {
      await resend.emails.send({
        from: 'Barbershop <onboarding@resend.dev>',
        to: [email],
        subject: `Booking Confirmed - ${date} at ${time}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #d4af37; color: #000; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; }
              .details { background: #fff; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Booking Confirmed!</h1>
              </div>
              <div class="content">
                <p>Dear ${name},</p>
                <p>Your appointment has been successfully booked. Here are your details:</p>
                
                <div class="details">
                  <p><strong>Service:</strong> ${service}</p>
                  <p><strong>Date:</strong> ${date}</p>
                  <p><strong>Time:</strong> ${time}</p>
                  <p><strong>Phone:</strong> ${phone}</p>
                  ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ``}
                </div>
                
                <p><strong>Reminder:</strong> We'll send you a reminder 24 hours before your appointment.</p>
                
                <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
                
                <p>We look forward to seeing you!</p>
              </div>
              <div class="footer">
                <p>The Gentleman's Club</p>
                <p>Premium Barber Services</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    }

    // Also notify admin
    if (adminEmail) {
      await resend.emails.send({
        from: 'Barbershop <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `New Booking - ${name} on ${date}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #d4af37;">New Booking</h2>
            <p>A new appointment has been booked.</p>
            <ul style="background: #f9f9f9; padding: 20px; border-radius: 5px; list-style: none;">
              <li style="margin-bottom: 10px;"><strong>Client Name:</strong> ${name}</li>
              <li style="margin-bottom: 10px;"><strong>Phone Number:</strong> ${phone}</li>
              <li style="margin-bottom: 10px;"><strong>Service:</strong> ${service}</li>
              <li style="margin-bottom: 10px;"><strong>Date:</strong> ${date}</li>
              <li style="margin-bottom: 10px;"><strong>Time:</strong> ${time}</li>
              ${notes ? `<li style="margin-bottom: 10px;"><strong>Notes:</strong> ${notes}</li>` : ``}
            </ul>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
