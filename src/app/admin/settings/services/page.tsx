"use client";

import { useEffect, useMemo, useState } from "react";
import { FadeIn } from "@/components/ui/FadeIn";
import { Plus, Loader2, Trash2, Pencil, CheckCircle2, XCircle } from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  duration_minutes: number;
  active: boolean;
  sort_order: number;
};

function formatMoney(priceCents: number) {
  return `$${(priceCents / 100).toFixed(2)}`;
}

export default function ServicesSettingsPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [newService, setNewService] = useState({
    name: "",
    description: "",
    priceCents: 3500,
    durationMinutes: 45,
    active: true,
    sortOrder: 0,
  });

  const sorted = useMemo(() => {
    return [...services].sort((a, b) => (a.sort_order - b.sort_order) || a.name.localeCompare(b.name));
  }, [services]);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/services");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load services");
      setServices(json.services || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load services");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createService() {
    setSavingId("new");
    setError(null);
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create service");
      setServices((prev) => [json.service, ...prev]);
      setNewService({
        name: "",
        description: "",
        priceCents: 3500,
        durationMinutes: 45,
        active: true,
        sortOrder: 0,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create service");
    } finally {
      setSavingId(null);
    }
  }

  async function updateService(id: string, patch: Partial<Service>) {
    setSavingId(id);
    setError(null);
    try {
      const payload: Record<string, unknown> = {};
      if (patch.name !== undefined) payload.name = patch.name;
      if (patch.description !== undefined) payload.description = patch.description;
      if (patch.price_cents !== undefined) payload.priceCents = patch.price_cents;
      if (patch.duration_minutes !== undefined) payload.durationMinutes = patch.duration_minutes;
      if (patch.active !== undefined) payload.active = patch.active;
      if (patch.sort_order !== undefined) payload.sortOrder = patch.sort_order;

      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update service");
      setServices((prev) => prev.map((s) => (s.id === id ? json.service : s)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update service");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteService(id: string) {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete service");
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete service");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-neutral-950">
      <FadeIn>
        <div className="mb-6">
          <h1 className="font-playfair text-3xl font-bold text-white">Services & Pricing</h1>
          <p className="text-neutral-400 mt-2">Add, edit, disable, or remove services. Changes reflect on the booking page.</p>
        </div>
      </FadeIn>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm mb-6">
          {error}
        </div>
      )}

      <div className="bg-neutral-900 border border-white/5 rounded-sm p-6 mb-6">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-gold-500" /> Add Service
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">Name</label>
            <input
              value={newService.name}
              onChange={(e) => setNewService((p) => ({ ...p, name: e.target.value }))}
              className="w-full bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
              placeholder="Classic Haircut"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={newService.durationMinutes}
              onChange={(e) => setNewService((p) => ({ ...p, durationMinutes: Number(e.target.value) }))}
              className="w-full bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">Price (cents)</label>
            <input
              type="number"
              value={newService.priceCents}
              onChange={(e) => setNewService((p) => ({ ...p, priceCents: Number(e.target.value) }))}
              className="w-full bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">Sort order</label>
            <input
              type="number"
              value={newService.sortOrder}
              onChange={(e) => setNewService((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
              className="w-full bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">Description</label>
            <textarea
              value={newService.description}
              onChange={(e) => setNewService((p) => ({ ...p, description: e.target.value }))}
              className="w-full bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors min-h-[90px]"
              placeholder="Optional description..."
            />
          </div>
        </div>

        <button
          onClick={createService}
          disabled={savingId === "new" || !newService.name.trim()}
          className="mt-4 bg-gold-500 hover:bg-gold-400 text-neutral-950 px-5 py-3 rounded-sm font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {savingId === "new" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Create
        </button>
      </div>

      <div className="bg-neutral-900 border border-white/5 rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white font-bold">All Services</h2>
          <button
            onClick={load}
            className="text-neutral-300 hover:text-white bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm transition-colors"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="p-10 flex items-center justify-center text-neutral-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading services...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-neutral-950">
                <tr className="text-neutral-400">
                  <th className="text-left font-semibold uppercase tracking-wider text-xs px-6 py-3">Name</th>
                  <th className="text-left font-semibold uppercase tracking-wider text-xs px-6 py-3">Duration</th>
                  <th className="text-left font-semibold uppercase tracking-wider text-xs px-6 py-3">Price</th>
                  <th className="text-left font-semibold uppercase tracking-wider text-xs px-6 py-3">Active</th>
                  <th className="text-right font-semibold uppercase tracking-wider text-xs px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-neutral-500">
                      No services yet.
                    </td>
                  </tr>
                ) : (
                  sorted.map((s) => (
                    <tr key={s.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <input
                            value={s.name}
                            onChange={(e) => setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)))}
                            className="w-full bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                          />
                          <input
                            value={s.description ?? ""}
                            onChange={(e) => setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, description: e.target.value } : x)))}
                            className="w-full bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-neutral-300 focus:outline-none focus:border-gold-500 transition-colors"
                            placeholder="Description (optional)"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={s.duration_minutes}
                          onChange={(e) =>
                            setServices((prev) =>
                              prev.map((x) => (x.id === s.id ? { ...x, duration_minutes: Number(e.target.value) } : x))
                            )
                          }
                          className="w-32 bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={s.price_cents}
                          onChange={(e) =>
                            setServices((prev) =>
                              prev.map((x) => (x.id === s.id ? { ...x, price_cents: Number(e.target.value) } : x))
                            )
                          }
                          className="w-40 bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                        />
                        <p className="text-neutral-500 text-xs mt-1">{formatMoney(s.price_cents)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => updateService(s.id, { active: !s.active })}
                          disabled={savingId === s.id}
                          className={`inline-flex items-center gap-2 border px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${
                            s.active
                              ? "text-green-400 bg-green-500/10 border-green-500/20 hover:border-green-500/40"
                              : "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40"
                          }`}
                        >
                          {s.active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {s.active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateService(s.id, {
                                name: s.name,
                                description: s.description,
                                price_cents: s.price_cents,
                                duration_minutes: s.duration_minutes,
                                sort_order: s.sort_order,
                              })
                            }
                            disabled={savingId === s.id}
                            className="bg-neutral-950 border border-white/10 text-neutral-300 hover:text-white hover:border-gold-500/40 px-3 py-2 rounded-sm transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            {savingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteService(s.id)}
                            disabled={deletingId === s.id}
                            className="bg-neutral-950 border border-white/10 text-neutral-300 hover:text-white hover:border-red-500/40 px-3 py-2 rounded-sm transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

