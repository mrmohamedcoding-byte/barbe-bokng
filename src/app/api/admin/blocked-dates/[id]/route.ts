import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await context.params;
  const { data, error } = await guard.supabase.from("blocked_dates").delete().eq("id", id).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await guard.supabase.rpc("insert_audit", {
    _action: "delete",
    _entity: "blocked_dates",
    _record_id: data.id,
    _changes: { id },
  });

  return NextResponse.json({ success: true });
}
