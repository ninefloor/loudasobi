import { z } from "zod";
import { getAdminSession } from "@/server/auth/access";
import { privateHeaders, rejectCrossOrigin } from "@/server/auth/request";
import { guideSchema } from "@/lib/callGuide";
import { saveGuide } from "@/server/mutations/guide";
import { readGuide } from "@/server/queries/guide";

const inputSchema = z.object({
  revision: z.string().regex(/^[a-f0-9]{64}$/),
  guide: guideSchema,
  syncOffset: z.number().finite().min(-3600).max(3600).optional(),
});
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session.authenticated)
    return Response.json(
      { error: "로그인이 필요합니다." },
      { status: 401, headers: privateHeaders },
    );
  const { id } = await params;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)))
    return Response.json(
      { error: "잘못된 곡 ID입니다." },
      { status: 400, headers: privateHeaders },
    );
  try {
    const document = await readGuide(Number(id));
    return Response.json(
      document ? { document } : { error: "곡이 없거나 삭제되었습니다." },
      { status: document ? 200 : 404, headers: privateHeaders },
    );
  } catch {
    return Response.json(
      { error: "콜 가이드를 불러오지 못했습니다." },
      { status: 503, headers: privateHeaders },
    );
  }
}
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const reply = (data: unknown, status: number) =>
    Response.json(data, { status, headers: privateHeaders });
  const session = await getAdminSession();
  if (!session.authenticated)
    return reply({ error: "로그인이 필요합니다." }, 401);
  if (session.role !== "admin")
    return reply({ error: "열람 전용 권한입니다." }, 403);
  const denied = rejectCrossOrigin(request);
  if (denied) return denied;
  const { id } = await params;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)))
    return reply({ error: "잘못된 곡 ID입니다." }, 400);
  const body = await request.text();
  if (body.length > 2_000_000)
    return reply({ error: "콜 자료가 너무 큽니다." }, 413);
  let input;
  try {
    input = inputSchema.safeParse(JSON.parse(body));
  } catch {
    return reply({ error: "잘못된 JSON입니다." }, 400);
  }
  if (!input.success)
    return reply({ error: "콜 입력 형식을 확인해 주세요." }, 400);
  try {
    const result = await saveGuide(
      Number(id),
      input.data.revision,
      input.data.guide,
      input.data.syncOffset,
    );
    return reply(result, result.status);
  } catch {
    return reply(
      { error: "저장하지 못했습니다. 입력값은 유지되므로 다시 시도해 주세요." },
      503,
    );
  }
}
