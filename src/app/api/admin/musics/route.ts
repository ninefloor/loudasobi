import { getAdminSession } from "@/server/auth/access";
import { privateHeaders } from "@/server/auth/request";
import { getAdminMusics } from "@/server/queries/music";

export async function GET() {
  if (!(await getAdminSession()).authenticated)
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: privateHeaders },
    );
  try {
    return Response.json(
      { musics: await getAdminMusics() },
      { headers: privateHeaders },
    );
  } catch {
    return Response.json(
      { error: "곡 목록을 불러오지 못했습니다." },
      { status: 503, headers: privateHeaders },
    );
  }
}
