import { Switch } from "@/components/ui/switch";

export type YesNo = "yes" | "no" | "";

export function yesNo(val: string | undefined): YesNo {
  if (val === "yes" || val === "no") return val;
  return "";
}

export function toYesNo(v: boolean): YesNo {
  return v ? "yes" : "no";
}

export function YesNoSelect({ value, onChange }: { value: YesNo; onChange: (v: YesNo) => void }) {
  return (
    <Switch
      checked={value === "yes"}
      onCheckedChange={(checked) => onChange(checked ? "yes" : "")}
      className="data-[state=unchecked]:bg-orange-400"
    />
  );
}
