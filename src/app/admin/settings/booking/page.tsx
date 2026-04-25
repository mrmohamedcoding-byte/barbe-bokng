"use client";

import { useEffect, useState } from "react";
import { FadeIn } from "@/components/ui/FadeIn";
import { Loader2 } from "lucide-react";

type BookingSettings = {
  max_bookings_per_slot: number;
  booking_window_days: number;
  auto_confirm: boolean;
  cancellation_policy: string | null;
};

export default function BookingSettingsPage() {
  const [form, setForm] = useState<BookingSettings>({
    max_bookings_per_slot: 1,
    booking_window_days: 14,
    auto_confirm: true,
    cancellation_policy: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings/booking");
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
      const res = await fetch("/api/admin/settings/booking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxBookingsPerSlot: Number(form.max_bookings_per_slot),
          bookingWindowDays: Number(form.booking_window_days),
          autoConfirm: form.auto_confirm,
          cancellationPolicy: form.cancellation_policy,
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
          <h1 className="font-playfair text-3xl font-bold text-white">Booking Settings</h1>
          <p className="text-neutral-400 mt-2">Control booking slot capacity and booking rules.</p>
        </div>
      </FadeIn>

      {error && <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm">{error}</div>}
      {isLoading ? (
        <div className="text-neutral-400 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="bg-neutral-900 border border-white/5 rounded-sm p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Max Bookings / Slot</label>
              <input type="number" min={1} value={form.max_bookings_per_slot} onChange={(e) => setForm((p) => ({ ...p, max_bookings_per_slot: Number(e.target.value) }))} className="w-full bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Booking Window (days)</label>
              <input type="number" min={1} max={365} value={form.booking_window_days} onChange={(e) => setForm((p) => ({ ...p, booking_window_days: Number(e.target.value) }))} className="w-full bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-neutral-300">
            <input type="checkbox" checked={form.auto_confirm} onChange={(e) => setForm((p) => ({ ...p, auto_confirm: e.target.checked }))} />
            Auto-confirm bookings
          </label>
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Cancellation Policy</label>
            <textarea value={form.cancellation_policy || ""} onChange={(e) => setForm((p) => ({ ...p, cancellation_policy: e.target.value }))} className="w-full bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white min-h-[120px]" />
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
