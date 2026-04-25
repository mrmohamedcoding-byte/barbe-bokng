"use client";

import { useCallback, useEffect, useState } from "react";
import { FadeIn } from "@/components/ui/FadeIn";
import { Loader2 } from "lucide-react";

type AuditEntry = {
  id: string;
  actor_email: string | null;
  action: string;
  entity: string;
  changes: unknown;
  created_at: string;
};

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (entityFilter) params.set("entity", entityFilter);
      if (actionFilter) params.set("action", actionFilter);
      if (actorFilter) params.set("actor", actorFilter);
      params.set("limit", "200");
      const res = await fetch(`/api/admin/audit-log?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load audit log");
      setEntries(json.entries || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load audit log");
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter, actorFilter, entityFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="bg-neutral-950">
      <FadeIn>
        <div className="mb-6">
          <h1 className="font-playfair text-3xl font-bold text-white">Audit Log</h1>
          <p className="text-neutral-400 mt-2">Track every settings change (who, what, when).</p>
        </div>
      </FadeIn>

      {error && <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm">{error}</div>}

      <div className="bg-neutral-900 border border-white/5 rounded-sm p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} placeholder="Entity (services, barbers...)" className="bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white" />
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white">
          <option value="">All actions</option>
          <option value="insert">Insert</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
        <input value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} placeholder="Actor email contains..." className="bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white" />
        <button onClick={load} className="bg-gold-500 hover:bg-gold-400 text-neutral-950 px-4 py-2 rounded-sm font-bold uppercase tracking-widest text-xs">
          Apply Filters
        </button>
      </div>

      <div className="bg-neutral-900 border border-white/5 rounded-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-neutral-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-neutral-950">
                <tr className="text-neutral-400">
                  <th className="text-left font-semibold uppercase tracking-wider text-xs px-5 py-3">Date</th>
                  <th className="text-left font-semibold uppercase tracking-wider text-xs px-5 py-3">Actor</th>
                  <th className="text-left font-semibold uppercase tracking-wider text-xs px-5 py-3">Action</th>
                  <th className="text-left font-semibold uppercase tracking-wider text-xs px-5 py-3">Entity</th>
                  <th className="text-left font-semibold uppercase tracking-wider text-xs px-5 py-3">Changes</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-neutral-500">
                      No audit entries found.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="border-t border-white/5 align-top">
                      <td className="px-5 py-4 text-neutral-300">{new Date(entry.created_at).toLocaleString()}</td>
                      <td className="px-5 py-4 text-neutral-300">{entry.actor_email || "Unknown"}</td>
                      <td className="px-5 py-4 text-white font-semibold uppercase">{entry.action}</td>
                      <td className="px-5 py-4 text-neutral-300">{entry.entity}</td>
                      <td className="px-5 py-4 text-neutral-400">
                        <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(entry.changes, null, 2)}</pre>
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

