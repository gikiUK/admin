export type YesNo = "yes" | "no" | "";

export function yesNo(val: string | undefined): YesNo {
  if (val === "yes" || val === "no") return val;
  return "";
}

export function YesNoSelect({ value, onChange }: { value: YesNo; onChange: (v: YesNo) => void }) {
  return (
    <div className="inline-flex rounded-md border overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(value === "yes" ? "" : "yes")}
        className={`px-3 py-1.5 text-sm font-medium transition-colors ${value === "yes" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
      >
        Yes
      </button>
      <div className="w-px bg-border" />
      <button
        type="button"
        onClick={() => onChange(value === "no" ? "" : "no")}
        className={`px-3 py-1.5 text-sm font-medium transition-colors ${value === "no" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
      >
        No
      </button>
    </div>
  );
}
