import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { sanitizeText } from "@/lib/sanitize";

const BookingSettingsSchema = z.object({
  maxBookingsPerSlot: z.number().int().min(1).max(100),
  bookingWindowDays: z.number().int().min(1).max(365),
  autoConfirm: z.boolean(),
  cancellationPolicy: z.string().max(2000).optional().nullable(),
});

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { data, error } = await guard.supabase.from("booking_settings").select("*").eq("id", 1).single();
  if (error) return NextResponse.json({ error: "Failed to load booking settings" }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PUT(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await request.json().catch(() => null);
  const parsed = BookingSettingsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const p = parsed.data;
  const update = {
    max_bookings_per_slot: p.maxBookingsPerSlot,
    booking_window_days: p.bookingWindowDays,
    auto_confirm: p.autoConfirm,
    cancellation_policy: p.cancellationPolicy ? sanitizeText(p.cancellationPolicy, 2000) : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await guard.supabase.from("booking_settings").update(update).eq("id", 1).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await guard.supabase.rpc("insert_audit", {
    _action: "update",
    _entity: "booking_settings",
    _record_id: null,
    _changes: update,
  });

  return NextResponse.json({ settings: data });
}
