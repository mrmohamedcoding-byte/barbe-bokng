import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

function getUrl(): string {
  if (typeof window !== 'undefined' && (window as any).__NEXT_PUBLIC_SUPABASE_URL__) {
    return (window as any).__NEXT_PUBLIC_SUPABASE_URL__
  }
  return process.env.NEXT_PUBLIC_SUPABASE_URL || ''
}

function getKey(): string {
  if (typeof window !== 'undefined' && (window as any).__NEXT_PUBLIC_SUPABASE_ANON_KEY__) {
    return (window as any).__NEXT_PUBLIC_SUPABASE_ANON_KEY__
  }
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
}

export const getSupabaseClient = (): SupabaseClient | null => {
  if (typeof window === 'undefined') return null
  
  const url = getUrl()
  const key = getKey()
  
  if (!url || !key) {
    console.warn('[Supabase] Environment variables not set', { url, hasKey: !!key })
    return null
  }
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key)
  }
  return supabaseInstance
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseClient()
    if (!client) {
      return (..._args: unknown[]) => {
        console.warn('[Supabase] Client not initialized')
        return Promise.reject(new Error('Supabase client not initialized'))
      }
    }
    return (client as any)[prop]
  }
})