import { getAdminSession } from "@/server/auth/access";
import { rejectCrossOrigin, privateHeaders } from "@/server/auth/request";
import { musicSettingsSchema } from "@/server/schemas/music";
import { saveMusicSettings } from "@/server/mutations/music";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session.authenticated)
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: privateHeaders },
    );
  if (session.role !== "admin")
    return Response.json(
      { error: "열람 전용 권한입니다." },
      { status: 403, headers: privateHeaders },
    );
  const denied = rejectCrossOrigin(request);
  if (denied) return denied;
  const { id: raw } = await context.params;
  const id = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(id))
    return Response.json(
      { error: "잘못된 곡 ID입니다." },
      { status: 400, headers: privateHeaders },
    );
  const parsed = musicSettingsSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return Response.json(
      {
        error:
          "설정을 확인해 주세요. YouTube ID는 11자리이며 공개 시 필수입니다. BPM은 20~400 또는 미지정, 싱크 보정은 -3600~3600초 범위입니다.",
      },
      { status: 400, headers: privateHeaders },
    );
  try {
    const saved = await saveMusicSettings(id, parsed.data);
    return saved
      ? Response.json(
          { ok: true, settings: saved },
          { headers: privateHeaders },
        )
      : Response.json(
          { error: "곡이 없거나 삭제되었습니다." },
          { status: 404, headers: privateHeaders },
        );
  } catch {
    return Response.json(
      { error: "저장하지 못했습니다. 다시 시도해 주세요." },
      { status: 503, headers: privateHeaders },
    );
  }
}
