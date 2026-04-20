"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          router.push("/admin");
        } else {
          setIsReady(true);
        }
      });
    } else {
      setError("Configuration error");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isReady) {
      setError("Please wait...");
      return;
    }

    setIsLoading(true);
    setError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setError("Configuration error");
      setIsLoading(false);
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
    } else {
      // Success - redirect
      window.location.href = "/admin";
    }
  };

  if (!isReady) {
    return (
      <div className="flex flex-col flex-grow bg-neutral-950 items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow bg-neutral-950 items-center justify-center p-4">
      <div className="w-full max-w-md">
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
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-neutral-950 border border-white/10 p-4 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors disabled:opacity-50"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-neutral-950 border border-white/10 p-4 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold-500 hover:bg-gold-400 text-neutral-950 py-4 font-bold uppercase tracking-widest rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>

            <div className="text-center pt-2">
              <Link href="/admin/forgot-password" className="text-neutral-400 text-sm hover:text-gold-500 transition-colors">
                Forgot your password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}