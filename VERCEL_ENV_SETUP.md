# ============================================
# BOOKFLOW - ENVIRONMENT VARIABLES SETUP
# ============================================
# Copy this content to your Vercel environment variables
# Go to: https://vercel.com/your-project/settings/environment-variables

# ============================================
# SUPABASE CONFIGURATION
# ============================================
# Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# STRIPE CONFIGURATION (FREE)
# ============================================
# Get these from: https://dashboard.stripe.com/apikeys (use test mode for development)
# Stripe has NO monthly cost - only transaction fees (1.5-2.9% + €0.25 per transaction)

STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# ============================================
# RESEND EMAIL (FREE TIER)
# ============================================
# Sign up at: https://resend.com (FREE: 100 emails/day)
# After signup, add your domain or use onboarding@resend.dev for testing

RESEND_API_KEY=re_xxxxx

# ============================================
# ADMIN & BUSINESS SETTINGS
# ============================================
# Your email to receive booking notifications
ADMIN_EMAIL=your@email.com

# Base URL (update for production)
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app

# ============================================
# CRON JOB SETUP (for reminders)
# ============================================
# Add this to vercel.json or use Vercel Cron:
# 
# Create vercel.json in project root:
# {
#   "crons": [
#     {
#       "path": "/api/email/reminder",
#       "schedule": "0 9 * * *"
#     }
#   ]
# }
#
# This runs daily at 9 AM to send appointment reminders
