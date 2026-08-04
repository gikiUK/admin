"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Props = {
  enabled: boolean;
  onChange: (value: boolean) => void;
};

export function EnabledField({ enabled, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3">
        <Switch id="enabled" checked={enabled} onCheckedChange={onChange} />
        <Label htmlFor="enabled">Enabled</Label>
      </div>
      <p className="text-muted-foreground text-xs">
        A disabled email is skipped in the sequence. The emails around it keep their own positions and still send.
      </p>
    </div>
  );
}
