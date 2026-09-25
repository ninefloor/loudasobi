import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function SyncControls({
  value,
  initial,
  onChange,
}: {
  value: number;
  initial: number;
  onChange: (value: number) => void;
}) {
  const t = useTranslations();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          SYNC {value >= 0 ? "+" : ""}
          {value.toFixed(2)}s
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-64 text-xs"
        aria-label={t("sync")}
      >
        <p className="mb-2">{t("syncHelp")}</p>
        <div className="flex flex-wrap gap-1">
          {[-0.5, -0.1, -0.01, 0.01, 0.1, 0.5].map((step) => (
            <Button
              key={step}
              size="xs"
              variant="outline"
              onClick={() => onChange(Number((value + step).toFixed(2)))}
            >
              {step > 0 ? "+" : ""}
              {step}s
            </Button>
          ))}
          <Button
            size="xs"
            variant="secondary"
            onClick={() => onChange(initial)}
          >
            {t("reset")}
          </Button>
        </div>
        <p className="mt-2 text-muted-foreground">{t("syncNotice")}</p>
      </PopoverContent>
    </Popover>
  );
}
