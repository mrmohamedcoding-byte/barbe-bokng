import { NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-route";

export async function GET() {
  try {
    const supabase = await createRouteHandlerSupabaseClient();
    const { data, error } = await supabase
      .from("services")
      .select("id,name,price_cents,duration_minutes,sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to load services" }, { status: 500 });
    }

    return NextResponse.json({ services: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Failed to load services" }, { status: 500 });
  }
}
