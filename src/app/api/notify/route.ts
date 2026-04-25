import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const notifySecret = process.env.NOTIFY_SECRET;
    if (notifySecret) {
      const provided = request.headers.get("x-notify-secret");
      if (provided !== notifySecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const { name, phone, service, date, time } = await request.json();
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail || !process.env.RESEND_API_KEY || !resend) {
      console.log('Skipping email notification because API keys are not configured yet.');
      return NextResponse.json({ success: true, message: 'Email skipped' });
    }

    const { data, error } = await resend.emails.send({
      from: 'Barbershop <onboarding@resend.dev>',
      to: [adminEmail],
      subject: 'New Booking Alert!',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #d4af37;">New Booking Received</h2>
          <p>A new appointment has just been scheduled on your website.</p>
          <ul style="background: #f9f9f9; padding: 20px; border-radius: 5px; list-style: none;">
            <li style="margin-bottom: 10px;"><strong>Client Name:</strong> ${name}</li>
            <li style="margin-bottom: 10px;"><strong>Phone Number:</strong> ${phone}</li>
            <li style="margin-bottom: 10px;"><strong>Service:</strong> ${service}</li>
            <li style="margin-bottom: 10px;"><strong>Date:</strong> ${date}</li>
            <li style="margin-bottom: 10px;"><strong>Time:</strong> ${time}</li>
          </ul>
          <p>You can manage this booking directly from your <a href="#" style="color: #d4af37;">Admin Dashboard</a>.</p>
        </div>
      `
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Internal Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
