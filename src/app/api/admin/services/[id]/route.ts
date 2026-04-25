import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { sanitizeText } from "@/lib/sanitize";

const ServiceUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(500).nullable().optional(),
  priceCents: z.number().int().min(0).max(1_000_000).optional(),
  durationMinutes: z.number().int().min(5).max(600).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(10_000).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = ServiceUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const p = parsed.data;
  const update: Record<string, unknown> = {};
  if (typeof p.name === "string") update.name = sanitizeText(p.name, 80);
  if (p.description !== undefined) update.description = p.description ? sanitizeText(p.description, 500) : null;
  if (typeof p.priceCents === "number") update.price_cents = p.priceCents;
  if (typeof p.durationMinutes === "number") update.duration_minutes = p.durationMinutes;
  if (typeof p.active === "boolean") update.active = p.active;
  if (typeof p.sortOrder === "number") update.sort_order = p.sortOrder;
  update.updated_at = new Date().toISOString();

  const { data, error } = await guard.supabase.from("services").update(update).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await guard.supabase.rpc("insert_audit", {
    _action: "update",
    _entity: "services",
    _record_id: data.id,
    _changes: update,
  });

  return NextResponse.json({ service: data });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await context.params;

  const { data, error } = await guard.supabase.from("services").delete().eq("id", id).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await guard.supabase.rpc("insert_audit", {
    _action: "delete",
    _entity: "services",
    _record_id: data.id,
    _changes: { id },
  });

  return NextResponse.json({ success: true });
}

