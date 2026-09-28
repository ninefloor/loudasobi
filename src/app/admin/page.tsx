import { getAdminSession } from "@/server/auth/access";
import { getAdminConnectionStatus } from "@/server/queries/admin";
import { getAdminMusics } from "@/server/queries/music";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminAuthForm } from "./_components/AdminAuthForm";
import { AdminMusicManager } from "./_components/AdminMusicManager";

export const metadata: Metadata = {
  title: "관리자 | loudasobi",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (session.authenticated) {
    const musics = await getAdminMusics().catch(() => null);
    if (musics) {
      return (
        <AdminMusicManager
          initialMusics={musics}
          readOnly={session.role !== "admin"}
        />
      );
    }
  }
  const status = session.authenticated
    ? await getAdminConnectionStatus()
    : null;
  return (
    <main className="h-dvh overflow-y-auto overscroll-contain bg-background px-6 py-12 text-foreground">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← loudasobi
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">관리자</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {session.authenticated
              ? session.role === "admin"
                ? "관리자 권한으로 로그인했습니다."
                : "열람 전용 권한으로 로그인했습니다."
              : "관리자 비밀번호로 로그인하세요."}
          </p>
        </div>
        {status && (
          <section
            className="rounded-lg border bg-card p-5"
            aria-label="DB 연결 상태"
          >
            <h2 className="font-medium">
              {status.connected
                ? "공유 DB 연결 완료"
                : "DB 연결을 확인해 주세요"}
            </h2>
            {status.connected ? (
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <dt>활성 곡</dt>
                <dd>{status.music}곡</dd>
                <dt>전용 설정</dt>
                <dd>{status.settings}개</dd>
                <dt>가사 트랙</dt>
                <dd>{status.lyrics}개</dd>
                <dt>콜 가이드 문서</dt>
                <dd>{status.guides}개</dd>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                서버 환경 변수 또는 DB 접속 상태를 확인한 뒤 새로고침해 주세요.
              </p>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              곡 설정을 불러오지 못했습니다. 연결 상태를 확인한 뒤 새로고침해
              주세요.
            </p>
          </section>
        )}
        <AdminAuthForm authenticated={session.authenticated} />
      </div>
    </main>
  );
}
