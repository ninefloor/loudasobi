import { cookies } from "next/headers";
import { z } from "zod";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSession,
  verifyAdminCredentials,
} from "@/server/auth/admin";
import { privateHeaders, rejectCrossOrigin } from "@/server/auth/request";

export async function POST(request: Request) {
  const denied = rejectCrossOrigin(request);
  if (denied) return denied;
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json(
      { error: "Invalid request" },
      { status: 415, headers: privateHeaders },
    );
  }
  const body = z
    .object({ password: z.string().min(1).max(1024) })
    .safeParse(await request.json().catch(() => null));
  if (!body.success)
    return Response.json(
      { error: "비밀번호를 입력해 주세요." },
      { status: 400, headers: privateHeaders },
    );
  try {
    const role = verifyAdminCredentials(body.data.password);
    if (!role)
      return Response.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 401, headers: privateHeaders },
      );
    (await cookies()).set(
      ADMIN_COOKIE_NAME,
      createAdminSession(role),
      adminCookieOptions(),
    );
    return Response.json({ ok: true }, { headers: privateHeaders });
  } catch {
    return Response.json(
      { error: "관리자 인증 설정을 확인해 주세요." },
      { status: 503, headers: privateHeaders },
    );
  }
}
