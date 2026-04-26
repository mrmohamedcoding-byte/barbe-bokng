import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIpFromHeaders(request.headers);
    const rl = rateLimit(`booking:create:${ip}`, { windowMs: 60_000, max: 10 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "x-ratelimit-remaining": String(rl.remaining),
            "x-ratelimit-reset": String(rl.resetAt),
          },
        }
      );
    }

    const { name, phone, service, date, time, email, notes } = await request.json();

    if (!name || !phone || !service || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Booking service not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Prevent double booking (ignore cancelled bookings)
    const { data: existing, error: existingError } = await supabase
      .from("appointments")
      .select("id, status")
      .eq("date", date)
      .eq("time", time)
      .limit(1);

    let existingRows: Array<{ id?: string; status?: string | null }> = existing || [];
    if (existingError) {
      console.warn("Double-booking check with status failed, retrying id-only check:", existingError.message);
      const idOnlyAttempt = await supabase
        .from("appointments")
        .select("id")
        .eq("date", date)
        .eq("time", time)
        .limit(1);

      if (idOnlyAttempt.error) {
        console.warn("Double-booking check unavailable, continuing with insert:", idOnlyAttempt.error.message);
        existingRows = [];
      } else {
        existingRows = idOnlyAttempt.data || [];
      }
    }

    const isTaken = existingRows.length > 0;

    if (isTaken) {
      return NextResponse.json({ error: "This time slot was just booked. Please choose another." }, { status: 409 });
    }

    const cleanNotes = typeof notes === "string" && notes.trim() ? notes.trim() : null;
    const cleanEmail = typeof email === "string" && email.trim() ? email.trim() : null;

    // Try progressively: with optional fields, then without them; with status, then without status.
    const payloads: Array<Record<string, unknown>> = [];
    const baseWithStatus: Record<string, unknown> = { name, phone, service, date, time, status: "pending" };
    const baseNoStatus: Record<string, unknown> = { name, phone, service, date, time };
    const withOptional = (base: Record<string, unknown>) => ({
      ...base,
      ...(cleanNotes ? { notes: cleanNotes } : {}),
      ...(cleanEmail ? { email: cleanEmail } : {}),
    });
    payloads.push(withOptional(baseWithStatus), withOptional(baseNoStatus), baseWithStatus, baseNoStatus);

    let createdId: string | null = null;
    let inserted = false;
    let lastInsertError: { message?: string } | null = null;

    for (const payload of payloads) {
      const withSelect = await supabase.from("appointments").insert(payload).select("id").single();
      if (!withSelect.error) {
        inserted = true;
        createdId = withSelect.data?.id ?? null;
        break;
      }

      const msg = (withSelect.error.message || "").toLowerCase();
      const selectPermissionIssue = msg.includes("permission") || msg.includes("not allowed");
      const columnIssue = msg.includes("column");

      // Retry without select when insert succeeds but select is blocked by policy.
      if (selectPermissionIssue) {
        const noSelect = await supabase.from("appointments").insert(payload);
        if (!noSelect.error) {
          inserted = true;
          break;
        }
        lastInsertError = noSelect.error;
        continue;
      }

      // Continue trying fallback payloads on missing/unsupported columns.
      if (columnIssue) {
        lastInsertError = withSelect.error;
        continue;
      }

      lastInsertError = withSelect.error;
    }

    if (!inserted) {
      console.error("Failed to create appointment:", lastInsertError);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    // If create succeeded but no id could be selected, keep response successful.
    if (!createdId) {
      const bestEffortLookup = await supabase
        .from("appointments")
        .select("id")
        .eq("date", date)
        .eq("time", time)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!bestEffortLookup.error) {
        createdId = bestEffortLookup.data?.id ?? null;
      }
    }

    // Send confirmation email to client + admin notification (optional).
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/email/confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          service,
          date,
          time,
          email: typeof email === "string" ? email : null,
          notes: typeof notes === "string" ? notes : null,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    // Notify admin (email is optional, so this endpoint can be a no-op if not configured).
    try {
      const notifySecret = process.env.NOTIFY_SECRET;
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(notifySecret ? { "x-notify-secret": notifySecret } : {}),
        },
        body: JSON.stringify({ name, phone, service, date, time, notes: typeof notes === "string" ? notes : null }),
      });
    } catch (notifyError) {
      console.error("Failed to notify admin:", notifyError);
    }

    return NextResponse.json({ success: true, bookingId: createdId });
  } catch (err) {
    console.error("Create booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

