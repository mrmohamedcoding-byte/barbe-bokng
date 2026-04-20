import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email, token, newPassword } = await request.json();

    // Validate input
    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Validate Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let userId: string | null = null;

    // Try to find user in public.users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (user && !userError) {
      userId = user.id;
    } else {
      // Check if it's an auth user
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Auth list users error:', authError);
        return NextResponse.json({ error: 'Invalid reset request' }, { status: 400 });
      }
      
      const foundUser = authData?.users.find(u => u.email === email);
      
      if (!foundUser) {
        return NextResponse.json({ error: 'Invalid reset request' }, { status: 400 });
      }
      
      userId = foundUser.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    // Update user password using admin API
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Send confirmation email if Resend is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'Barbershop <onboarding@resend.dev>',
          to: email,
          subject: '✅ Password Changed Successfully - The Gentleman\'s Club',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <h1 style="color: #d4af37;">The Gentleman's Club</h1>
              <h2>Password Updated Successfully</h2>
              <p>Your password has been successfully updated.</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ay7aga-liart.vercel.app'}/admin/login" style="display: inline-block; background: #d4af37; color: #18181b; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 4px;">Login to Admin</a>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the password reset if email fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });

  } catch (error) {
    console.error('Verify reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}