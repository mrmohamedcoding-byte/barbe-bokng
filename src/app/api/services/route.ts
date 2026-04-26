import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { DEFAULT_SERVICES } from "@/lib/default-services";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
    }

    // Public endpoint: use anon key client, no auth cookies required.
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from("services")
      .select("id,name,price_cents,duration_minutes,sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to load services:", error);
      // Self-heal: if table is unavailable or read is blocked, keep booking usable.
      return NextResponse.json({ services: DEFAULT_SERVICES });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ services: DEFAULT_SERVICES });
    }

    return NextResponse.json({ services: data });
  } catch (error) {
    console.error("Services endpoint error:", error);
    return NextResponse.json({ services: DEFAULT_SERVICES });
  }
}
