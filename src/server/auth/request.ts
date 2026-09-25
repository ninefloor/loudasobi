import "server-only";

// Apply to every future cookie-authenticated write route, not only login/logout.
export function rejectCrossOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");
  const target = new URL(request.url);
  // Next may normalize a loopback request URL to localhost; use the actual Host.
  const host = request.headers.get("host");
  if (host) target.host = host;
  if (
    !origin ||
    origin !== target.origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
export const privateHeaders = { "Cache-Control": "private, no-store" };
