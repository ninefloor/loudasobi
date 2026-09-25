import Link from "next/link";
import { getAdminSession } from "@/server/auth/access";
import { readAdminSidebar } from "@/server/queries/sidebar";
import { SidebarOrderEditor } from "../_components/SidebarOrderEditor";

export default async function SidebarPage() {
  const session = await getAdminSession();
  const document = session.authenticated
    ? await readAdminSidebar().catch(() => null)
    : null;
  if (!document)
    return (
      <main className="flex h-dvh flex-col items-center justify-center gap-4 p-6">
        <p>
          {session.authenticated
            ? "추천 목록을 불러오지 못했습니다. DB 연결 상태를 확인해 주세요."
            : "관리자 로그인이 필요합니다."}
        </p>
        <Link href="/admin" className="text-primary underline">
          곡 관리로 돌아가기
        </Link>
      </main>
    );
  return (
    <SidebarOrderEditor
      initial={document}
      readOnly={!session.authenticated || session.role !== "admin"}
    />
  );
}
