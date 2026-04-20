import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing environment variables - client will not be available')
}

// Lazy singleton instance
let supabaseInstance: SupabaseClient | null = null

/**
 * Safe factory function - only creates client on client side
 * Returns null during SSR/build to prevent crashes
 */
export function getSupabaseClient(): SupabaseClient | null {
  // Prevent server-side initialization
  if (typeof window === 'undefined') {
    return null
  }

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Environment variables not configured')
    return null
  }

  // Use cached instance
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    } catch (error) {
      console.error('[Supabase] Failed to create client:', error)
      return null
    }
  }

  return supabaseInstance
}

/**
 * Safe proxy wrapper - prevents crashes if client not initialized
 * Returns no-op functions instead of throwing
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseClient()
    
    if (!client) {
      // Return a safe no-op function that warns but doesn't crash
      return (..._args: unknown[]) => {
        console.warn(`[Supabase] Client not initialized - call to "${String(prop)}" ignored`)
        return Promise.resolve({ data: null, error: { message: 'Client not ready' } })
      }
    }
    
    return (client as unknown as Record<string | number, unknown>)[prop as string]
  },
})

/**
 * Check if Supabase is configured and ready
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

/**
 * Check if client is initialized (call this before using supabase directly)
 */
export function isSupabaseClientReady(): boolean {
  return typeof window !== 'undefined' && supabaseInstance !== null
}