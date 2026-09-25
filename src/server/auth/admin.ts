import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "loudasobi_admin";
export const ADMIN_MAX_AGE = 60 * 60 * 8;
export type AdminRole = "admin" | "viewer";
export type AdminSession =
  { authenticated: false } | { authenticated: true; role: AdminRole };
const audience = "loudasobi";
const safeEqual = (a: string, b: string) =>
  timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
const sign = (payload: string) => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Admin session configuration is missing");
  // Domain separation prevents MONOASOBI cookies being replayed here.
  return createHmac("sha256", secret)
    .update(audience + ":" + payload)
    .digest("hex");
};
export function verifyAdminCredentials(password: string): AdminRole | null {
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!adminPassword) throw new Error("Admin credentials are not configured");
  if (safeEqual(password, adminPassword)) return "admin";
  const viewers =
    process.env.ADMIN_VIEWER_PASSWORDS?.split(",")
      .map((p) => p.trim())
      .filter(Boolean) ?? [];
  return viewers.some((p) => safeEqual(password, p)) ? "viewer" : null;
}
export function createAdminSession(role: AdminRole) {
  const payload = Buffer.from(
    JSON.stringify({
      audience,
      role,
      expiresAt: Date.now() + ADMIN_MAX_AGE * 1000,
    }),
  ).toString("base64url");
  return payload + "." + sign(payload);
}
export function verifyAdminSession(token?: string): AdminSession {
  if (!token || token.length > 2048) return { authenticated: false };
  try {
    const parts = token.split(".");
    if (
      parts.length !== 2 ||
      !parts[0] ||
      !parts[1] ||
      !safeEqual(parts[1], sign(parts[0]))
    )
      return { authenticated: false };
    const payload = JSON.parse(
      Buffer.from(parts[0], "base64url").toString("utf8"),
    );
    if (
      payload?.audience !== audience ||
      (payload.role !== "admin" && payload.role !== "viewer") ||
      !Number.isFinite(payload.expiresAt) ||
      payload.expiresAt <= Date.now()
    )
      return { authenticated: false };
    return { authenticated: true, role: payload.role };
  } catch {
    return { authenticated: false };
  }
}
export const adminCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: ADMIN_MAX_AGE,
});
