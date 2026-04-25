import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const provided = request.headers.get("x-cron-secret");
      if (provided !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Skip if Resend is not configured
    if (!resend) {
      console.log('Resend not configured, skipping reminders');
      return NextResponse.json({ success: true, message: 'Reminders skipped (not configured)' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get appointments for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', tomorrowStr)
      .eq('reminder_sent', null);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    let sentCount = 0;

    for (const appointment of appointments || []) {
      // Send reminder email to customer (if we have their email stored)
      // For now, just notify admin about tomorrow's appointments
      await resend.emails.send({
        from: 'Barbershop <onboarding@resend.dev>',
        to: [adminEmail || 'onboarding@resend.dev'],
        subject: `Reminder: ${appointment.name} - Tomorrow at ${appointment.time}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #d4af37;">Appointment Reminder</h2>
            <p>Tomorrow's appointment:</p>
            <ul style="background: #f9f9f9; padding: 20px; border-radius: 5px; list-style: none;">
              <li><strong>Name:</strong> ${appointment.name}</li>
              <li><strong>Service:</strong> ${appointment.service}</li>
              <li><strong>Time:</strong> ${appointment.time}</li>
              <li><strong>Phone:</strong> ${appointment.phone}</li>
            </ul>
          </div>
        `,
      });

      // Mark reminder as sent
      await supabase
        .from('appointments')
        .update({ reminder_sent: true })
        .eq('id', appointment.id);

      sentCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sent ${sentCount} reminders`,
      sentCount 
    });
  } catch (error) {
    console.error('Reminder error:', error);
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
  }
}
