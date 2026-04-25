"use client";

import { FadeIn } from "@/components/ui/FadeIn";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Supabase recovery links set a session in the URL hash.
    if (!isSupabaseConfigured()) {
      setIsValidToken(false);
      setError("Authentication service not configured. Please contact support.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsValidToken(false);
      setError("Authentication service not ready. Please refresh and try again.");
      return;
    }

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message);
        setIsValidToken(false);
        return;
      }

      if (data.session) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured()) {
      setError("Authentication service not configured. Please contact support.");
      return;
    }

    setValidationError(null);

    if (!password) {
      setValidationError("Please enter a password");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error("Authentication service not ready. Please refresh and try again.");
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        throw new Error(updateError.message);
      }

      setSuccess(true);
      // End recovery session.
      await supabase.auth.signOut();
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/admin/login");
      }, 3000);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Loading state while checking token
  if (isValidToken === null) {
    return (
      <div className="flex flex-col flex-grow bg-neutral-950 items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
          <p className="text-neutral-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid or missing token
  if (isValidToken === false) {
    return (
      <div className="flex flex-col flex-grow bg-neutral-950 items-center justify-center p-4">
        <FadeIn className="w-full max-w-md">
          <div className="bg-neutral-900 border border-white/5 p-8 rounded-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            
            <h1 className="font-playfair text-3xl font-bold text-white mb-4">Invalid Reset Link</h1>
            <p className="text-neutral-400 mb-8">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            
            <a 
              href="/admin/forgot-password" 
              className="inline-block bg-gold-500 hover:bg-gold-400 text-neutral-950 py-4 px-8 font-bold uppercase tracking-widest rounded-sm transition-all"
            >
              Request New Link
            </a>
            
            <div className="mt-6">
              <a href="/admin/login" className="text-neutral-400 text-sm hover:text-gold-500 transition-colors">
                Back to login
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="flex flex-col flex-grow bg-neutral-950 items-center justify-center p-4">
        <FadeIn className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-playfair text-3xl font-bold text-white">Password Updated!</h2>
          <p className="text-neutral-400">Redirecting you to login...</p>
        </FadeIn>
      </div>
    );
  }

  // Reset form
  return (
    <div className="flex flex-col flex-grow bg-neutral-950 items-center justify-center p-4">
      <FadeIn className="w-full max-w-md">
        <div className="bg-neutral-900 border border-white/5 p-8 rounded-sm shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-neutral-950 rounded-full flex items-center justify-center text-gold-500 border border-white/5">
              <KeyRound className="w-6 h-6" />
            </div>
          </div>
          
          <h1 className="font-playfair text-3xl font-bold text-white text-center mb-2">New Password</h1>
          <p className="text-neutral-400 text-sm text-center mb-8">Enter your new password below.</p>

          <form onSubmit={handleUpdate} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-2">
                  <span>{error}</span>
                  <a href="/admin/forgot-password" className="text-gold-500 hover:underline text-xs">
                    Request new reset link →
                  </a>
                </div>
              </div>
            )}

            {validationError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {validationError}
              </div>
            )}
            
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 p-4 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                placeholder="••••••••"
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 p-4 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                placeholder="••••••••"
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold-500 hover:bg-gold-400 text-neutral-950 py-4 font-bold uppercase tracking-widest rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>

            <div className="text-center pt-2">
              <a href="/admin/login" className="text-neutral-400 text-sm hover:text-gold-500 transition-colors">
                Back to login
              </a>
            </div>
          </form>
        </div>
      </FadeIn>
    </div>
  );
}