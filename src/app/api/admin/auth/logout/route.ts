import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, adminCookieOptions } from "@/server/auth/admin";
import { privateHeaders, rejectCrossOrigin } from "@/server/auth/request";
export async function POST(request: Request) {
  const denied = rejectCrossOrigin(request);
  if (denied) return denied;
  (await cookies()).set(ADMIN_COOKIE_NAME, "", {
    ...adminCookieOptions(),
    maxAge: 0,
  });
  return Response.json({ ok: true }, { headers: privateHeaders });
}
