import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";

const UpdateBarberSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  bio: z.string().max(1000).nullable().optional(),
  photoUrl: z.string().max(2000).nullable().optional(),
  active: z.boolean().optional(),
  serviceIds: z.array(z.string().uuid()).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = UpdateBarberSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const p = parsed.data;
  const update: Record<string, unknown> = {};
  if (typeof p.name === "string") update.name = sanitizeText(p.name, 80);
  if (p.bio !== undefined) update.bio = p.bio ? sanitizeText(p.bio, 1000) : null;
  if (p.photoUrl !== undefined) update.photo_url = p.photoUrl ? sanitizeUrl(p.photoUrl, 2000) : null;
  if (typeof p.active === "boolean") update.active = p.active;
  update.updated_at = new Date().toISOString();

  let barber = null;
  if (Object.keys(update).length > 1) {
    const updated = await guard.supabase.from("barbers").update(update).eq("id", id).select("*").single();
    if (updated.error) return NextResponse.json({ error: updated.error.message }, { status: 400 });
    barber = updated.data;
  } else {
    const current = await guard.supabase.from("barbers").select("*").eq("id", id).single();
    if (current.error) return NextResponse.json({ error: current.error.message }, { status: 400 });
    barber = current.data;
  }

  if (p.serviceIds) {
    const deduped = [...new Set(p.serviceIds)];
    const del = await guard.supabase.from("barber_services").delete().eq("barber_id", id);
    if (del.error) return NextResponse.json({ error: del.error.message }, { status: 400 });

    if (deduped.length > 0) {
      const rows = deduped.map((serviceId) => ({ barber_id: id, service_id: serviceId }));
      const ins = await guard.supabase.from("barber_services").insert(rows);
      if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 400 });
    }
  }

  const assn = await guard.supabase.from("barber_services").select("service_id").eq("barber_id", id);
  if (assn.error) return NextResponse.json({ error: assn.error.message }, { status: 400 });

  const serviceIds = (assn.data ?? []).map((x) => x.service_id);

  await guard.supabase.rpc("insert_audit", {
    _action: "update",
    _entity: "barbers",
    _record_id: id,
    _changes: { ...update, service_ids: p.serviceIds ?? serviceIds },
  });

  return NextResponse.json({ barber: { ...barber, service_ids: serviceIds } });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await context.params;
  const { data, error } = await guard.supabase.from("barbers").delete().eq("id", id).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await guard.supabase.rpc("insert_audit", {
    _action: "delete",
    _entity: "barbers",
    _record_id: data.id,
    _changes: { id: data.id },
  });

  return NextResponse.json({ success: true });
}
