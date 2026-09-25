import { getAdminSession } from "@/server/auth/access";
import { privateHeaders } from "@/server/auth/request";
export async function GET() {
  const session = await getAdminSession();
  return Response.json(session, {
    status: session.authenticated ? 200 : 401,
    headers: privateHeaders,
  });
}
