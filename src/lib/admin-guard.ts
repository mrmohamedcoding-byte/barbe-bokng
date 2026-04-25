import { createRouteHandlerSupabaseClient } from "@/lib/supabase-route";

export async function requireAdmin() {
  const supabase = await createRouteHandlerSupabaseClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { ok: false as const, status: 401 as const, error: "Unauthorized" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .single();

  if (profileError) {
    return { ok: false as const, status: 403 as const, error: "Forbidden" };
  }

  if (!profile?.is_admin) {
    return { ok: false as const, status: 403 as const, error: "Forbidden" };
  }

  return { ok: true as const, supabase, user: userData.user };
}

