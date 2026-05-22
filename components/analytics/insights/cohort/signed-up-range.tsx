"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  from?: string;
  to?: string;
  onChange: (patch: { signed_up_from?: string; signed_up_to?: string }) => void;
};

export function SignedUpRange({ from, to, onChange }: Props) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Signed up</span>
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <Label className="text-xs">From</Label>
          <Input
            type="date"
            value={from?.slice(0, 10) ?? ""}
            onChange={(e) => onChange({ signed_up_from: e.target.value || undefined })}
            className="h-8 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">To</Label>
          <Input
            type="date"
            value={to?.slice(0, 10) ?? ""}
            onChange={(e) => onChange({ signed_up_to: e.target.value || undefined })}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
