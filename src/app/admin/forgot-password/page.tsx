"use client";

import { FadeIn } from "@/components/ui/FadeIn";
import { useState, useEffect } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { Mail, Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError("Authentication service not configured. Please contact support.");
      return;
    }

    const client = getSupabaseClient();
    if (client && client.auth) {
      setIsReady(true);
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isReady) {
      setError("Please wait for the page to fully load...");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setError("Authentication service not ready. Please refresh the page.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const redirectUrl = `${window.location.origin}/admin/reset-password`;
      const { error: resetError } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col flex-grow bg-neutral-950 items-center justify-center p-4">
      <FadeIn className="w-full max-w-md">
        <div className="bg-neutral-900 border border-white/5 p-8 rounded-sm shadow-2xl relative">
          <Link href="/admin/login" className="absolute top-8 left-8 text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-neutral-950 rounded-full flex items-center justify-center text-gold-500 border border-white/5">
              <Mail className="w-6 h-6" />
            </div>
          </div>
          
          <h1 className="font-playfair text-3xl font-bold text-white text-center mb-2">Reset Password</h1>
          <p className="text-neutral-400 text-sm text-center mb-8">Enter your email to receive a reset link.</p>

          <form onSubmit={handleReset} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-4 rounded-sm flex items-center gap-2 text-center">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <div>
                  <p className="font-semibold">Reset link sent!</p>
                  <p className="text-green-400/70 text-xs mt-1">Check your inbox for the reset link.</p>
                </div>
              </div>
            )}
            
            {!success && (
              <>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 p-4 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="mr.mohamed.coding@gmail.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isReady}
                  className="w-full bg-gold-500 hover:bg-gold-400 text-neutral-950 py-4 font-bold uppercase tracking-widest rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </>
            )}

            <div className="text-center pt-2">
              <Link href="/admin/login" className="text-neutral-400 text-sm hover:text-gold-500 transition-colors">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </FadeIn>
    </div>
  );
}