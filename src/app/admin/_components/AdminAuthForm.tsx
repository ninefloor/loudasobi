"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminAuthForm({ authenticated }: { authenticated: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const password = new FormData(form).get("password");
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        "/api/admin/auth/" + (authenticated ? "logout" : "login"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(authenticated ? {} : { password }),
        },
      );
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setError(result?.error ?? "요청을 처리하지 못했습니다.");
        return;
      }
      form.reset();
      router.refresh();
    } catch {
      setError("서버에 연결하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-3" aria-busy={busy}>
      {!authenticated && (
        <div className="grid gap-2.5">
          <Label htmlFor="admin-password">비밀번호</Label>
          <Input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={1024}
            className="h-11 bg-background"
            placeholder="비밀번호를 입력해 주세요"
            disabled={busy}
            aria-invalid={!!error}
            aria-describedby={error ? "admin-auth-error" : undefined}
          />
        </div>
      )}
      {error && (
        <p
          id="admin-auth-error"
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
      <Button
        disabled={busy}
        type="submit"
        variant={authenticated ? "outline" : "default"}
        className={authenticated ? undefined : "mt-2 h-11 w-full"}
      >
        {busy && (
          <LoaderCircle
            aria-hidden="true"
            className="size-4 motion-safe:animate-spin"
          />
        )}
        {busy ? "처리 중…" : authenticated ? "로그아웃" : "로그인"}
        {!authenticated && !busy && (
          <ArrowRight aria-hidden="true" className="size-4" />
        )}
      </Button>
    </form>
  );
}
