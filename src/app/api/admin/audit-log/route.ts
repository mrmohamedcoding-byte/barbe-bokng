import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { searchParams } = new URL(request.url);
  const entity = searchParams.get("entity");
  const action = searchParams.get("action");
  const actor = searchParams.get("actor");
  const limit = Math.min(Number(searchParams.get("limit") || "100"), 500);

  let query = guard.supabase
    .from("audit_log")
    .select("id,actor_id,actor_email,action,entity,record_id,changes,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (entity) query = query.eq("entity", entity);
  if (action) query = query.eq("action", action);
  if (actor) query = query.ilike("actor_email", `%${actor}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to load audit log" }, { status: 500 });

  return NextResponse.json({ entries: data ?? [] });
}
