import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useId } from "react";

export function NumberField({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="grid min-w-0 gap-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        key={value}
        id={id}
        type="number"
        defaultValue={value}
        step={step}
        min={min}
        max={max}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        onBlur={(event) => {
          const next = event.currentTarget.valueAsNumber;
          if (
            Number.isFinite(next) &&
            (min === undefined || next >= min) &&
            (max === undefined || next <= max)
          )
            onChange(next);
          else event.currentTarget.value = String(value);
        }}
      />
    </div>
  );
}
