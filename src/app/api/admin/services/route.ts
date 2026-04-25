import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { sanitizeText } from "@/lib/sanitize";

const ServiceCreateSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional().nullable(),
  priceCents: z.number().int().min(0).max(1_000_000),
  durationMinutes: z.number().int().min(5).max(600),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(10_000).optional(),
});

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { data, error } = await guard.supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: "Failed to load services" }, { status: 500 });
  return NextResponse.json({ services: data ?? [] });
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await request.json().catch(() => null);
  const parsed = ServiceCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const payload = parsed.data;
  const insert = {
    name: sanitizeText(payload.name, 80),
    description: payload.description ? sanitizeText(payload.description, 500) : null,
    price_cents: payload.priceCents,
    duration_minutes: payload.durationMinutes,
    active: payload.active ?? true,
    sort_order: payload.sortOrder ?? 0,
  };

  const { data, error } = await guard.supabase.from("services").insert(insert).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Audit log
  await guard.supabase.rpc("insert_audit", {
    _action: "insert",
    _entity: "services",
    _record_id: data.id,
    _changes: insert,
  });

  return NextResponse.json({ service: data });
}

