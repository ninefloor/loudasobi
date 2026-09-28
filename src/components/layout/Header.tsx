"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SettingsMenu } from "./SettingsMenu";

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const t = useTranslations();
  return (
    <header className="grid h-14 shrink-0 grid-cols-[40px_1fr_40px] items-center border-b bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("toggleSongs")}
        onClick={onToggleSidebar}
      >
        <Menu className="size-5" />
      </Button>
      <Image
        src="/assets/logo.svg"
        alt="loudasobi"
        width={410}
        height={129}
        className="h-auto w-[120px] justify-self-center"
      />
      <SettingsMenu />
    </header>
  );
}
