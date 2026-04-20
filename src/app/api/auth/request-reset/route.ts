import { NextResponse } from 'next/server';

// In-memory token store (for demo - use Redis/DB in production)
interface ResetToken {
  email: string;
  token: string;
  expiresAt: number;
  used: boolean;
}

// Global token store - persists for the session
const globalTokenStore = new Map<string, ResetToken>();

function generateResetToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured - skipping email send');
      // Still return success to prevent email enumeration
      return NextResponse.json({ 
        success: true, 
        message: 'If email exists, reset link was sent' 
      });
    }

    // Dynamic import Resend to avoid build errors
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Generate reset token
    const resetToken = generateResetToken();
    
    // Store token with 1 hour expiry
    const tokenData: ResetToken = {
      email,
      token: resetToken,
      expiresAt: Date.now() + 60 * 60 * 1000,
      used: false
    };
    
    globalTokenStore.set(email, tokenData);

    // Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ay7aga-liart.vercel.app';
    const resetUrl = `${baseUrl}/admin/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Barbershop <onboarding@resend.dev>',
      to: email,
      subject: '🔐 Reset Your Password - The Gentleman\'s Club',
      html: `
        <!DOCTYPE html>
        <html style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #d4af37; font-size: 28px; margin: 0; font-family: Georgia, serif;">The Gentleman's Club</h1>
                <p style="color: #71717a; margin: 10px 0 0; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">Premium Barber Experience</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="width: 80px; height: 80px; background: #fef3c7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                    <span style="font-size: 36px;">🔑</span>
                  </div>
                </div>
                
                <h2 style="color: #18181b; font-size: 24px; text-align: center; margin: 0 0 20px;">Password Reset Request</h2>
                
                <p style="color: #52525b; line-height: 1.8; font-size: 15px; text-align: center; margin: 0 0 30px;">
                  You requested a password reset for your <strong>Admin Account</strong> at The Gentleman's Club. Click the button below to create a new password.
                </p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); color: #18181b; padding: 18px 50px; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);">
                    Reset My Password
                  </a>
                </div>
                
                <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; margin-top: 30px;">
                  <p style="color: #71717a; font-size: 13px; margin: 0; text-align: center;">
                    ⏱️ <strong>This link expires in 1 hour</strong>. If you didn't request this, you can safely ignore this email.
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background: #fafafa; padding: 25px; text-align: center; border-top: 1px solid #e4e4e7;">
                <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} The Gentleman's Club. All rights reserved.
                </p>
              </div>
              
            </div>
          </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'If email exists, reset link was sent' 
    });

  } catch (error) {
    console.error('Request reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Export token store for use in verify route
export { globalTokenStore };