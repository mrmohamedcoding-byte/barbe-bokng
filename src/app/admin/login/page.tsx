"use client";

import { FadeIn } from "@/components/ui/FadeIn";
import { useState, useEffect } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClientReady, setIsClientReady] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    async function checkSession() {
      if (!isSupabaseConfigured()) {
        setError("Authentication service not configured. Please contact support.");
        setIsClientReady(false);
        setIsCheckingSession(false);
        return;
      }

      const client = getSupabaseClient();
      if (client) {
        supabaseRef.current = client;
        
        // Check if already logged in
        const { data: { session } } = await client.auth.getSession();
        if (session) {
          router.push("/admin");
          return;
        }
        
        setIsClientReady(true);
      } else {
        setError("Failed to initialize authentication. Please refresh the page.");
      }
      setIsCheckingSession(false);
    }
    
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabaseRef.current) {
      setError("Authentication service not ready. Please wait...");
      return;
    }

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabaseRef.current.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        router.push("/admin");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="flex flex-col flex-grow bg-neutral-950 items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-4" />
        <p className="text-neutral-400 text-sm">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow bg-neutral-950 items-center justify-center p-4">
      <FadeIn className="w-full max-w-md">
        <div className="bg-neutral-900 border border-white/5 p-8 rounded-sm shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-neutral-950 rounded-full flex items-center justify-center text-gold-500 border border-white/5">
              <Lock className="w-6 h-6" />
            </div>
          </div>
          
          <h1 className="font-playfair text-3xl font-bold text-white text-center mb-2">Admin Portal</h1>
          <p className="text-neutral-400 text-sm text-center mb-8">Authorized personnel only.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 p-4 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                placeholder="admin@example.com"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 p-4 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !isClientReady}
              className="w-full bg-gold-500 hover:bg-gold-400 text-neutral-950 py-4 font-bold uppercase tracking-widest rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center pt-2">
              <Link href="/admin/forgot-password" className="text-neutral-400 text-sm hover:text-gold-500 transition-colors">
                Forgot your password?
              </Link>
            </div>
          </form>
        </div>
      </FadeIn>
    </div>
  );
}

// Add useRef import
import { useRef } from "react";