export function sanitizeText(input: unknown, maxLen = 2000): string {
  const s = String(input ?? "").trim();
  // Basic sanitization: strip control chars, clamp length.
  const withoutControls = s.replace(/[\u0000-\u001F\u007F]/g, "");
  return withoutControls.slice(0, maxLen);
}

export function sanitizeUrl(input: unknown, maxLen = 2000): string {
  const s = sanitizeText(input, maxLen);
  if (!s) return "";
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    return u.toString();
  } catch {
    return "";
  }
}

