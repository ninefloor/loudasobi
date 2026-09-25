"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
        <>
          <Label htmlFor="admin-password">비밀번호</Label>
          <Input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={1024}
            className="h-10"
          />
        </>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button
        disabled={busy}
        type="submit"
        variant={authenticated ? "outline" : "default"}
      >
        {busy ? "처리 중…" : authenticated ? "로그아웃" : "로그인"}
      </Button>
    </form>
  );
}
