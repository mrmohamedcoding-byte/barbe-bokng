"use client";

import { useEffect, useState } from "react";
import { FadeIn } from "@/components/ui/FadeIn";
import { Loader2, Plus, Trash2 } from "lucide-react";

type WorkingHour = {
  day_of_week: number;
  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;
};

type BlockedDate = {
  id: string;
  date: string;
  reason: string | null;
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEFAULT_HOURS: WorkingHour[] = DAY_NAMES.map((_, day) => ({
  day_of_week: day,
  is_closed: day === 0,
  open_time: day === 0 ? null : "09:00",
  close_time: day === 0 ? null : "19:00",
}));

export default function ScheduleSettingsPage() {
  const [hours, setHours] = useState<WorkingHour[]>(DEFAULT_HOURS);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedReason, setNewBlockedReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [isSavingBlocked, setIsSavingBlocked] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadAll() {
    setIsLoading(true);
    setError(null);
    try {
      const [hoursRes, blockedRes] = await Promise.all([fetch("/api/admin/schedule"), fetch("/api/admin/blocked-dates")]);
      const hoursJson = await hoursRes.json();
      const blockedJson = await blockedRes.json();
      if (!hoursRes.ok) throw new Error(hoursJson.error || "Failed to load schedule");
      if (!blockedRes.ok) throw new Error(blockedJson.error || "Failed to load blocked dates");
      if (Array.isArray(hoursJson.workingHours) && hoursJson.workingHours.length > 0) setHours(hoursJson.workingHours);
      setBlockedDates(blockedJson.blockedDates || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function saveHours() {
    setIsSavingHours(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ working_hours: hours }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save schedule");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save schedule");
    } finally {
      setIsSavingHours(false);
    }
  }

  async function addBlockedDate() {
    if (!newBlockedDate) return;
    setIsSavingBlocked(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blocked-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newBlockedDate, reason: newBlockedReason || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add blocked date");
      setBlockedDates((prev) => [...prev, json.blockedDate].sort((a, b) => a.date.localeCompare(b.date)));
      setNewBlockedDate("");
      setNewBlockedReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add blocked date");
    } finally {
      setIsSavingBlocked(false);
    }
  }

  async function deleteBlockedDate(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/blocked-dates/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete blocked date");
      setBlockedDates((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete blocked date");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-neutral-950">
      <FadeIn>
        <div className="mb-6">
          <h1 className="font-playfair text-3xl font-bold text-white">Schedule Settings</h1>
          <p className="text-neutral-400 mt-2">Manage working hours and blocked dates.</p>
        </div>
      </FadeIn>

      {error && <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm">{error}</div>}

      <div className="bg-neutral-900 border border-white/5 rounded-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold">Working Hours</h2>
          <button
            onClick={saveHours}
            disabled={isSavingHours || isLoading}
            className="bg-gold-500 hover:bg-gold-400 text-neutral-950 px-4 py-2 rounded-sm font-bold uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {isSavingHours ? "Saving..." : "Save Hours"}
          </button>
        </div>
        {isLoading ? (
          <div className="text-neutral-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        ) : (
          <div className="space-y-3">
            {hours
              .slice()
              .sort((a, b) => a.day_of_week - b.day_of_week)
              .map((hour) => (
                <div key={hour.day_of_week} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-neutral-950 border border-white/5 p-3 rounded-sm">
                  <div className="text-white font-semibold">{DAY_NAMES[hour.day_of_week]}</div>
                  <label className="flex items-center gap-2 text-neutral-300">
                    <input
                      type="checkbox"
                      checked={hour.is_closed}
                      onChange={(e) =>
                        setHours((prev) =>
                          prev.map((x) =>
                            x.day_of_week === hour.day_of_week
                              ? { ...x, is_closed: e.target.checked, open_time: e.target.checked ? null : "09:00", close_time: e.target.checked ? null : "19:00" }
                              : x
                          )
                        )
                      }
                    />
                    Closed
                  </label>
                  <input
                    type="time"
                    disabled={hour.is_closed}
                    value={hour.open_time ?? ""}
                    onChange={(e) => setHours((prev) => prev.map((x) => (x.day_of_week === hour.day_of_week ? { ...x, open_time: e.target.value } : x)))}
                    className="bg-neutral-900 border border-white/10 px-3 py-2 rounded-sm text-white disabled:opacity-40"
                  />
                  <input
                    type="time"
                    disabled={hour.is_closed}
                    value={hour.close_time ?? ""}
                    onChange={(e) => setHours((prev) => prev.map((x) => (x.day_of_week === hour.day_of_week ? { ...x, close_time: e.target.value } : x)))}
                    className="bg-neutral-900 border border-white/10 px-3 py-2 rounded-sm text-white disabled:opacity-40"
                  />
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="bg-neutral-900 border border-white/5 rounded-sm p-6">
        <h2 className="text-white font-bold mb-4">Blocked Dates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            type="date"
            value={newBlockedDate}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            className="bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white"
          />
          <input
            value={newBlockedReason}
            onChange={(e) => setNewBlockedReason(e.target.value)}
            placeholder="Reason (optional)"
            className="bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white"
          />
          <button
            onClick={addBlockedDate}
            disabled={isSavingBlocked || !newBlockedDate}
            className="bg-neutral-950 border border-white/10 text-neutral-300 hover:text-white px-3 py-2 rounded-sm disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {isSavingBlocked ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
        </div>

        <div className="space-y-2">
          {blockedDates.length === 0 ? (
            <p className="text-neutral-500">No blocked dates configured.</p>
          ) : (
            blockedDates.map((d) => (
              <div key={d.id} className="flex items-center justify-between bg-neutral-950 border border-white/5 p-3 rounded-sm">
                <div>
                  <p className="text-white font-medium">{d.date}</p>
                  {d.reason && <p className="text-neutral-400 text-sm">{d.reason}</p>}
                </div>
                <button
                  onClick={() => deleteBlockedDate(d.id)}
                  disabled={deletingId === d.id}
                  className="bg-neutral-900 border border-white/10 px-3 py-2 rounded-sm text-neutral-300 hover:text-white disabled:opacity-50"
                >
                  {deletingId === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
