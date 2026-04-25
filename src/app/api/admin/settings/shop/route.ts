import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";

const ShopSettingsSchema = z.object({
  shopName: z.string().min(2).max(120),
  tagline: z.string().max(200).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  instagram: z.string().max(2000).optional().nullable(),
  facebook: z.string().max(2000).optional().nullable(),
  tiktok: z.string().max(2000).optional().nullable(),
  logoUrl: z.string().max(2000).optional().nullable(),
});

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { data, error } = await guard.supabase.from("shop_settings").select("*").eq("id", 1).single();
  if (error) return NextResponse.json({ error: "Failed to load shop settings" }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PUT(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await request.json().catch(() => null);
  const parsed = ShopSettingsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const p = parsed.data;
  const update = {
    shop_name: sanitizeText(p.shopName, 120),
    tagline: p.tagline ? sanitizeText(p.tagline, 200) : null,
    phone: p.phone ? sanitizeText(p.phone, 40) : null,
    email: p.email ? sanitizeText(p.email, 320) : null,
    address: p.address ? sanitizeText(p.address, 300) : null,
    instagram: p.instagram ? sanitizeUrl(p.instagram, 2000) : null,
    facebook: p.facebook ? sanitizeUrl(p.facebook, 2000) : null,
    tiktok: p.tiktok ? sanitizeUrl(p.tiktok, 2000) : null,
    logo_url: p.logoUrl ? sanitizeUrl(p.logoUrl, 2000) : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await guard.supabase.from("shop_settings").update(update).eq("id", 1).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await guard.supabase.rpc("insert_audit", {
    _action: "update",
    _entity: "shop_settings",
    _record_id: null,
    _changes: update,
  });

  return NextResponse.json({ settings: data });
}
