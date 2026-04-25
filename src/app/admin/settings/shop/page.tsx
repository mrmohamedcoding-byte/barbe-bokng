"use client";

import { useEffect, useState } from "react";
import { FadeIn } from "@/components/ui/FadeIn";
import { Loader2 } from "lucide-react";

type ShopSettings = {
  shop_name: string;
  tagline: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  logo_url: string | null;
};

export default function ShopSettingsPage() {
  const [form, setForm] = useState<ShopSettings>({
    shop_name: "",
    tagline: "",
    phone: "",
    email: "",
    address: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    logo_url: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings/shop");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load settings");
      setForm(json.settings);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings/shop", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: form.shop_name,
          tagline: form.tagline,
          phone: form.phone,
          email: form.email,
          address: form.address,
          instagram: form.instagram,
          facebook: form.facebook,
          tiktok: form.tiktok,
          logoUrl: form.logo_url,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save settings");
      setForm(json.settings);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-neutral-950">
      <FadeIn>
        <div className="mb-6">
          <h1 className="font-playfair text-3xl font-bold text-white">Shop Settings</h1>
          <p className="text-neutral-400 mt-2">Manage business profile and social links.</p>
        </div>
      </FadeIn>

      {error && <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm">{error}</div>}
      {isLoading ? (
        <div className="text-neutral-400 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="bg-neutral-900 border border-white/5 rounded-sm p-6 space-y-4">
          <input value={form.shop_name || ""} onChange={(e) => setForm((p) => ({ ...p, shop_name: e.target.value }))} placeholder="Shop name" className="w-full bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white" />
          <input value={form.tagline || ""} onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))} placeholder="Tagline" className="w-full bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.phone || ""} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white" />
            <input value={form.email || ""} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white" />
          </div>
          <input value={form.address || ""} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Address" className="w-full bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.instagram || ""} onChange={(e) => setForm((p) => ({ ...p, instagram: e.target.value }))} placeholder="Instagram URL" className="bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white" />
            <input value={form.facebook || ""} onChange={(e) => setForm((p) => ({ ...p, facebook: e.target.value }))} placeholder="Facebook URL" className="bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white" />
            <input value={form.tiktok || ""} onChange={(e) => setForm((p) => ({ ...p, tiktok: e.target.value }))} placeholder="TikTok URL" className="bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white" />
            <input value={form.logo_url || ""} onChange={(e) => setForm((p) => ({ ...p, logo_url: e.target.value }))} placeholder="Logo URL" className="bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white" />
          </div>
          <button onClick={save} disabled={isSaving} className="bg-gold-500 hover:bg-gold-400 text-neutral-950 px-4 py-2 rounded-sm font-bold uppercase tracking-widest text-xs disabled:opacity-50 inline-flex items-center gap-2">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Settings
          </button>
        </div>
      )}
    </div>
  );
}
