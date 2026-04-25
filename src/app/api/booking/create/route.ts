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

    if (existingError) {
      console.error("Double-booking check failed:", existingError);
      return NextResponse.json({ error: "Failed to validate availability" }, { status: 500 });
    }

    const isTaken =
      (existing || []).some((a: { status?: string | null }) => (a.status ?? "pending") !== "cancelled");

    if (isTaken) {
      return NextResponse.json({ error: "This time slot was just booked. Please choose another." }, { status: 409 });
    }

    // Insert booking (status starts as pending, admin can confirm/cancel)
    const baseInsert = {
      name,
      phone,
      service,
      date,
      time,
      status: "pending",
    } as Record<string, unknown>;

    // Try to persist extra fields if your table supports them.
    if (typeof notes === "string" && notes.trim()) baseInsert.notes = notes.trim();
    if (typeof email === "string" && email.trim()) baseInsert.email = email.trim();

    let createdId: string | null = null;
    const insertAttempt = await supabase
      .from("appointments")
      .insert(baseInsert)
      .select("id")
      .single();

    if (insertAttempt.error) {
      // If schema doesn't have notes/email, retry without them (keeps app functional).
      const message = insertAttempt.error.message || "";
      const looksLikeMissingColumn =
        message.includes("column") && (message.includes("notes") || message.includes("email"));

      if (!looksLikeMissingColumn) {
        console.error("Failed to create appointment:", insertAttempt.error);
        return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
      }

      const { data: createdFallback, error: fallbackError } = await supabase
        .from("appointments")
        .insert({
          name,
          phone,
          service,
          date,
          time,
          status: "pending",
        })
        .select("id")
        .single();

      if (fallbackError) {
        console.error("Failed to create appointment (fallback):", fallbackError);
        return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
      }

      createdId = createdFallback?.id ?? null;
    } else {
      createdId = insertAttempt.data?.id ?? null;
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

