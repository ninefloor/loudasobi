import { getAdminSession } from "@/server/auth/access";
import { getAdminConnectionStatus } from "@/server/queries/admin";
import { getAdminMusics } from "@/server/queries/music";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <main className="flex h-dvh flex-col overflow-hidden bg-muted/30 text-foreground">
      <header className="flex shrink-0 items-center gap-3 border-b bg-card px-4 py-3 sm:px-6">
        <Button asChild variant="ghost" size="icon">
          <Link
            href="/"
            aria-label="공개 화면으로 돌아가기"
            title="공개 화면으로 돌아가기"
          >
            <ChevronLeft className="size-5" />
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-6!" />
        <div>
          <p className="text-xs text-muted-foreground">loudasobi</p>
          <p className="text-sm font-semibold">관리자</p>
        </div>
      </header>
      <ScrollArea
        className="min-h-0 flex-1"
        viewportProps={{ className: "[&>div]:flex! [&>div]:min-h-full" }}
      >
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:py-16">
          <section
            className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm sm:p-8"
            aria-labelledby="admin-login-title"
          >
            <div className="mb-7">
              <div className="mb-5 flex size-11 items-center justify-center rounded-xl border bg-muted/50">
                <LockKeyhole
                  aria-hidden="true"
                  className="size-5 text-muted-foreground"
                />
              </div>
              <h1
                id="admin-login-title"
                className="text-xl font-semibold tracking-tight"
              >
                {session.authenticated ? "연결 상태 확인" : "관리자 로그인"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {session.authenticated
                  ? session.role === "admin"
                    ? "관리자 권한으로 로그인했습니다."
                    : "열람 전용 권한으로 로그인했습니다."
                  : "곡 설정과 콜 가이드를 관리하려면 로그인해 주세요."}
              </p>
            </div>
            {status && (
              <section
                className="mb-6 rounded-lg border bg-muted/30 p-4"
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
                    서버 환경 변수 또는 DB 접속 상태를 확인한 뒤 새로고침해
                    주세요.
                  </p>
                )}
                <p className="mt-4 text-sm text-muted-foreground">
                  곡 설정을 불러오지 못했습니다. 연결 상태를 확인한 뒤
                  새로고침해 주세요.
                </p>
              </section>
            )}
            <AdminAuthForm authenticated={session.authenticated} />
            {!session.authenticated && (
              <div className="mt-6 space-y-4">
                <Separator />
                <p className="text-center text-xs leading-relaxed text-muted-foreground">
                  허용된 관리자 계정만 이용할 수 있습니다.
                </p>
              </div>
            )}
          </section>
        </div>
      </ScrollArea>
    </main>
  );
}
