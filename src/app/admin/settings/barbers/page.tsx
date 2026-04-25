"use client";

import { useEffect, useMemo, useState } from "react";
import { FadeIn } from "@/components/ui/FadeIn";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";

type Service = { id: string; name: string };
type Barber = {
  id: string;
  name: string;
  bio: string | null;
  photo_url: string | null;
  active: boolean;
  service_ids: string[];
};

export default function BarbersSettingsPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newBarber, setNewBarber] = useState({
    name: "",
    bio: "",
    photoUrl: "",
    active: true,
    serviceIds: [] as string[],
  });

  const serviceMap = useMemo(() => new Map(services.map((s) => [s.id, s.name])), [services]);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/barbers");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load barbers");
      setBarbers(json.barbers || []);
      setServices(json.services || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load barbers");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createBarber() {
    setSavingId("new");
    setError(null);
    try {
      const res = await fetch("/api/admin/barbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBarber),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create barber");
      setBarbers((prev) => [...prev, json.barber]);
      setNewBarber({ name: "", bio: "", photoUrl: "", active: true, serviceIds: [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create barber");
    } finally {
      setSavingId(null);
    }
  }

  async function updateBarber(id: string, payload: Partial<Barber> & { service_ids?: string[] }) {
    setSavingId(id);
    setError(null);
    try {
      const body: Record<string, unknown> = {};
      if (payload.name !== undefined) body.name = payload.name;
      if (payload.bio !== undefined) body.bio = payload.bio;
      if (payload.photo_url !== undefined) body.photoUrl = payload.photo_url;
      if (payload.active !== undefined) body.active = payload.active;
      if (payload.service_ids !== undefined) body.serviceIds = payload.service_ids;

      const res = await fetch(`/api/admin/barbers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update barber");
      setBarbers((prev) => prev.map((b) => (b.id === id ? json.barber : b)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update barber");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteBarber(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/barbers/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete barber");
      setBarbers((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete barber");
    } finally {
      setDeletingId(null);
    }
  }

  function toggleService(serviceIds: string[], id: string) {
    return serviceIds.includes(id) ? serviceIds.filter((x) => x !== id) : [...serviceIds, id];
  }

  return (
    <div className="bg-neutral-950">
      <FadeIn>
        <div className="mb-6">
          <h1 className="font-playfair text-3xl font-bold text-white">Barbers</h1>
          <p className="text-neutral-400 mt-2">Create and manage barber profiles and service assignment.</p>
        </div>
      </FadeIn>

      {error && <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm">{error}</div>}

      <div className="bg-neutral-900 border border-white/5 rounded-sm p-6 mb-6">
        <h2 className="text-white font-bold mb-4">Add Barber</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={newBarber.name} onChange={(e) => setNewBarber((p) => ({ ...p, name: e.target.value }))} placeholder="Name" className="bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white" />
          <input value={newBarber.photoUrl} onChange={(e) => setNewBarber((p) => ({ ...p, photoUrl: e.target.value }))} placeholder="Photo URL" className="bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white" />
          <textarea value={newBarber.bio} onChange={(e) => setNewBarber((p) => ({ ...p, bio: e.target.value }))} placeholder="Bio" className="md:col-span-2 bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white min-h-[90px]" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setNewBarber((p) => ({ ...p, serviceIds: toggleService(p.serviceIds, s.id) }))}
              className={`px-3 py-1.5 border rounded-sm text-xs ${newBarber.serviceIds.includes(s.id) ? "bg-gold-500 text-neutral-950 border-gold-500" : "border-white/10 text-neutral-300"}`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <button onClick={createBarber} disabled={savingId === "new" || !newBarber.name.trim()} className="mt-4 bg-gold-500 hover:bg-gold-400 text-neutral-950 px-4 py-2 rounded-sm font-bold uppercase tracking-widest text-xs inline-flex items-center gap-2 disabled:opacity-50">
          {savingId === "new" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Create
        </button>
      </div>

      <div className="bg-neutral-900 border border-white/5 rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white font-bold">All Barbers</h2>
          <button onClick={load} className="bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-neutral-300 hover:text-white">
            Refresh
          </button>
        </div>
        {isLoading ? (
          <div className="p-8 text-neutral-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {barbers.length === 0 ? (
              <p className="text-neutral-500 p-3">No barbers yet.</p>
            ) : (
              barbers.map((b) => (
                <div key={b.id} className="bg-neutral-950 border border-white/5 rounded-sm p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={b.name} onChange={(e) => setBarbers((prev) => prev.map((x) => (x.id === b.id ? { ...x, name: e.target.value } : x)))} className="bg-neutral-900 border border-white/10 px-3 py-2 rounded-sm text-white" />
                    <input value={b.photo_url ?? ""} onChange={(e) => setBarbers((prev) => prev.map((x) => (x.id === b.id ? { ...x, photo_url: e.target.value } : x)))} className="bg-neutral-900 border border-white/10 px-3 py-2 rounded-sm text-white" placeholder="Photo URL" />
                    <textarea value={b.bio ?? ""} onChange={(e) => setBarbers((prev) => prev.map((x) => (x.id === b.id ? { ...x, bio: e.target.value } : x)))} className="md:col-span-2 bg-neutral-900 border border-white/10 px-3 py-2 rounded-sm text-white min-h-[80px]" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {services.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setBarbers((prev) => prev.map((x) => (x.id === b.id ? { ...x, service_ids: toggleService(x.service_ids, s.id) } : x)))}
                        className={`px-3 py-1.5 border rounded-sm text-xs ${b.service_ids.includes(s.id) ? "bg-gold-500 text-neutral-950 border-gold-500" : "border-white/10 text-neutral-300"}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-neutral-500 text-xs">
                      Assigned: {b.service_ids.map((id) => serviceMap.get(id)).filter(Boolean).join(", ") || "No services"}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateBarber(b.id, { active: !b.active })}
                        disabled={savingId === b.id}
                        className={`px-3 py-2 rounded-sm text-xs border ${b.active ? "text-green-400 border-green-500/30" : "text-amber-400 border-amber-500/30"} disabled:opacity-50`}
                      >
                        {b.active ? "Active" : "Inactive"}
                      </button>
                      <button
                        onClick={() => updateBarber(b.id, { name: b.name, bio: b.bio, photo_url: b.photo_url, service_ids: b.service_ids })}
                        disabled={savingId === b.id}
                        className="bg-neutral-900 border border-white/10 px-3 py-2 rounded-sm text-neutral-300 hover:text-white disabled:opacity-50"
                      >
                        {savingId === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteBarber(b.id)}
                        disabled={deletingId === b.id}
                        className="bg-neutral-900 border border-white/10 px-3 py-2 rounded-sm text-neutral-300 hover:text-white disabled:opacity-50"
                      >
                        {deletingId === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
