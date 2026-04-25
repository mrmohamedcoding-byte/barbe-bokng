import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";

const WorkingHourSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  is_closed: z.boolean(),
  open_time: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  close_time: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
});

const UpdateScheduleSchema = z.object({
  working_hours: z.array(WorkingHourSchema).length(7),
});

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { data, error } = await guard.supabase
    .from("working_hours")
    .select("day_of_week,is_closed,open_time,close_time")
    .order("day_of_week", { ascending: true });

  if (error) return NextResponse.json({ error: "Failed to load schedule" }, { status: 500 });

  return NextResponse.json({ workingHours: data ?? [] });
}

export async function PUT(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await request.json().catch(() => null);
  const parsed = UpdateScheduleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const rows = parsed.data.working_hours.map((row) => ({
    day_of_week: row.day_of_week,
    is_closed: row.is_closed,
    open_time: row.is_closed ? null : row.open_time,
    close_time: row.is_closed ? null : row.close_time,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await guard.supabase.from("working_hours").upsert(rows, { onConflict: "day_of_week" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await guard.supabase.rpc("insert_audit", {
    _action: "update",
    _entity: "schedule",
    _record_id: null,
    _changes: { working_hours: rows },
  });

  return NextResponse.json({ success: true });
}
