import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { sanitizeText } from "@/lib/sanitize";

const CreateBlockedDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(200).optional().nullable(),
});

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { data, error } = await guard.supabase
    .from("blocked_dates")
    .select("id,date,reason,created_at")
    .order("date", { ascending: true });

  if (error) return NextResponse.json({ error: "Failed to load blocked dates" }, { status: 500 });
  return NextResponse.json({ blockedDates: data ?? [] });
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await request.json().catch(() => null);
  const parsed = CreateBlockedDateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const insert = {
    date: parsed.data.date,
    reason: parsed.data.reason ? sanitizeText(parsed.data.reason, 200) : null,
  };

  const { data, error } = await guard.supabase.from("blocked_dates").insert(insert).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await guard.supabase.rpc("insert_audit", {
    _action: "insert",
    _entity: "blocked_dates",
    _record_id: data.id,
    _changes: insert,
  });

  return NextResponse.json({ blockedDate: data });
}
