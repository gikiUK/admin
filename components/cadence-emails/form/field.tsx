import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

type Props = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
};

export function Field({ id, label, hint, error, children }: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-destructive text-xs">{error}</p>
      ) : (
        hint && <p className="text-muted-foreground text-xs">{hint}</p>
      )}
    </div>
  );
}
