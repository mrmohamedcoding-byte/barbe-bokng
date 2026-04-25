import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";

const CreateBarberSchema = z.object({
  name: z.string().min(2).max(80),
  bio: z.string().max(1000).optional().nullable(),
  photoUrl: z.string().max(2000).optional().nullable(),
  active: z.boolean().optional(),
  serviceIds: z.array(z.string().uuid()).optional(),
});

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const [barbersRes, servicesRes, assignmentsRes] = await Promise.all([
    guard.supabase.from("barbers").select("*").order("name", { ascending: true }),
    guard.supabase.from("services").select("id,name").order("sort_order", { ascending: true }).order("name", { ascending: true }),
    guard.supabase.from("barber_services").select("barber_id,service_id"),
  ]);

  if (barbersRes.error || servicesRes.error || assignmentsRes.error) {
    return NextResponse.json({ error: "Failed to load barbers" }, { status: 500 });
  }

  const grouped = new Map<string, string[]>();
  for (const row of assignmentsRes.data ?? []) {
    const arr = grouped.get(row.barber_id) ?? [];
    arr.push(row.service_id);
    grouped.set(row.barber_id, arr);
  }

  const barbers = (barbersRes.data ?? []).map((barber) => ({
    ...barber,
    service_ids: grouped.get(barber.id) ?? [],
  }));

  return NextResponse.json({ barbers, services: servicesRes.data ?? [] });
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await request.json().catch(() => null);
  const parsed = CreateBarberSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const p = parsed.data;
  const insert = {
    name: sanitizeText(p.name, 80),
    bio: p.bio ? sanitizeText(p.bio, 1000) : null,
    photo_url: p.photoUrl ? sanitizeUrl(p.photoUrl, 2000) : null,
    active: p.active ?? true,
  };

  const { data, error } = await guard.supabase.from("barbers").insert(insert).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const serviceIds = [...new Set(p.serviceIds ?? [])];
  if (serviceIds.length > 0) {
    const rows = serviceIds.map((serviceId) => ({ barber_id: data.id, service_id: serviceId }));
    const assignResult = await guard.supabase.from("barber_services").insert(rows);
    if (assignResult.error) return NextResponse.json({ error: assignResult.error.message }, { status: 400 });
  }

  await guard.supabase.rpc("insert_audit", {
    _action: "insert",
    _entity: "barbers",
    _record_id: data.id,
    _changes: { ...insert, service_ids: serviceIds },
  });

  return NextResponse.json({ barber: { ...data, service_ids: serviceIds } });
}
