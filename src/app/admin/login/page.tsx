"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else if (data.user) {
      router.push("/admin");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#09090b",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        backgroundColor: "#18181b",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "0.5rem",
        padding: "2rem",
        width: "100%",
        maxWidth: "28rem"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "1.5rem"
        }}>
          <div style={{
            width: "4rem",
            height: "4rem",
            backgroundColor: "#09090b",
            borderRadius: "9999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.05)"
          }}>
            <span style={{ fontSize: "1.5rem" }}>🔒</span>
          </div>
        </div>

        <h1 style={{
          fontSize: "1.875rem",
          fontWeight: "bold",
          color: "white",
          textAlign: "center",
          marginBottom: "0.5rem",
          fontFamily: "Georgia, serif"
        }}>
          Admin Portal
        </h1>
        <p style={{
          color: "#a1a1aa",
          textAlign: "center",
          marginBottom: "2rem",
          fontSize: "0.875rem"
        }}>
          Authorized personnel only
        </p>

        {error && (
          <div style={{
            backgroundColor: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171",
            padding: "1rem",
            borderRadius: "0.25rem",
            marginBottom: "1.5rem",
            fontSize: "0.875rem"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={{
              display: "block",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#a1a1aa",
              fontWeight: 600,
              marginBottom: "0.5rem"
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                backgroundColor: "#09090b",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "1rem",
                borderRadius: "0.25rem",
                color: "white",
                fontSize: "1rem",
                outline: "none"
              }}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#a1a1aa",
              fontWeight: 600,
              marginBottom: "0.5rem"
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                backgroundColor: "#09090b",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "1rem",
                borderRadius: "0.25rem",
                color: "white",
                fontSize: "1rem",
                outline: "none"
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: "#d4af37",
              color: "#09090b",
              padding: "1rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderRadius: "0.25rem",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontSize: "0.875rem"
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <a
            href="/admin/forgot-password"
            style={{
              color: "#a1a1aa",
              fontSize: "0.875rem",
              textDecoration: "none"
            }}
          >
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
}