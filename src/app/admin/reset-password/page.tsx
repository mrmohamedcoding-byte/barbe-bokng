"use client";

import { FadeIn } from "@/components/ui/FadeIn";
import { useState, useEffect } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function verifyToken() {
      if (!isSupabaseConfigured()) {
        setError("Authentication service not configured. Please contact support.");
        setVerifying(false);
        return;
      }

      try {
        const client = getSupabaseClient();
        
        if (!client) {
          setError("Failed to initialize authentication. Please refresh.");
          setVerifying(false);
          return;
        }

        // Check for existing session (from reset password link)
        const { data: { session }, error: sessionError } = await client.auth.getSession();
        
        if (sessionError) {
          setError("Invalid or expired reset link");
          setVerifying(false);
          return;
        }
        
        if (session) {
          setIsReady(true);
          setVerifying(false);
        } else {
          // Listen for auth state changes
          const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session?.user)) {
              setIsReady(true);
              setVerifying(false);
              subscription.unsubscribe();
            }
          });

          // Timeout after 10 seconds
          const timeout = setTimeout(() => {
            subscription.unsubscribe();
            setError("Reset link has expired. Please request a new one.");
            setVerifying(false);
          }, 10000);

          // Clean up on unmount
          return () => {
            clearTimeout(timeout);
            subscription.unsubscribe();
          };
        }
      } catch (err) {
        console.error("Token verification error:", err);
        setError("Failed to verify reset link");
        setVerifying(false);
      }
    }
    
    verifyToken();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isReady) {
      setError("Please wait while we verify your reset link...");
      return;
    }

    setValidationError(null);

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setError("Authentication service not ready. Please refresh the page.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await client.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex flex-col flex-grow bg-neutral-950 items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
          <p className="text-neutral-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

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
                {error}
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
              disabled={isLoading || !isReady}
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
          </form>
        </div>
      </FadeIn>
    </div>
  );
}