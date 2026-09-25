import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "./admin";

export const getAdminSession = async () =>
  verifyAdminSession((await cookies()).get(ADMIN_COOKIE_NAME)?.value);

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session.authenticated) throw new Error("Unauthorized");
  return session;
}
export async function requireAdminWriteAccess() {
  const session = await requireAdminSession();
  if (session.role !== "admin") throw new Error("Forbidden");
  return session;
}
