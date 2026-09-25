import { z } from "zod";
import { getAdminSession } from "@/server/auth/access";
import { privateHeaders, rejectCrossOrigin } from "@/server/auth/request";
import { sidebarLayoutSchema } from "@/lib/sidebarOrder";
import { readAdminSidebar } from "@/server/queries/sidebar";
import { saveSidebar } from "@/server/mutations/sidebar";

const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: privateHeaders });
export async function GET() {
  if (!(await getAdminSession()).authenticated)
    return reply({ error: "로그인이 필요합니다." }, 401);
  try {
    return reply({ document: await readAdminSidebar() });
  } catch {
    return reply({ error: "추천 목록을 불러오지 못했습니다." }, 503);
  }
}
export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session.authenticated)
    return reply({ error: "로그인이 필요합니다." }, 401);
  if (session.role !== "admin")
    return reply({ error: "열람 전용 권한입니다." }, 403);
  const denied = rejectCrossOrigin(request);
  if (denied) return denied;
  const body = await request.text();
  if (body.length > 200_000)
    return reply({ error: "목록이 너무 큽니다." }, 413);
  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return reply({ error: "잘못된 JSON입니다." }, 400);
  }
  const input = z
    .object({
      revision: z.string().regex(/^[a-f0-9]{64}$/),
      layout: sidebarLayoutSchema,
    })
    .strict()
    .safeParse(json);
  if (!input.success)
    return reply({ error: "그룹 이름과 곡 중복 여부를 확인해 주세요." }, 400);
  try {
    const result = await saveSidebar(input.data.revision, input.data.layout);
    return reply(result, result.status);
  } catch {
    return reply({ error: "저장하지 못했습니다. 초안은 유지됩니다." }, 503);
  }
}
