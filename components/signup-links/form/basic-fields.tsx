"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CodeChangeDialog } from "./code-change-dialog";

type Props = {
  title: string;
  code: string;
  enabled: boolean;
  originalCode: string | null;
  onTitleChange: (next: string) => void;
  onCodeChange: (next: string) => void;
  onEnabledChange: (next: boolean) => void;
};

export function BasicFields({
  title,
  code,
  enabled,
  originalCode,
  onTitleChange,
  onCodeChange,
  onEnabledChange
}: Props) {
  const isEdit = originalCode !== null;
  const [codeLocked, setCodeLocked] = useState(isEdit);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleUnlockRequest() {
    setConfirmOpen(true);
  }

  function handleConfirmUnlock() {
    setCodeLocked(false);
    setConfirmOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Internal label for this link"
          required
        />
        <p className="text-xs text-muted-foreground">Human-facing only. Not shown to signups.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="code">Code</Label>
        <div className="flex items-center gap-2">
          <Input
            id="code"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder={isEdit ? "" : "Auto-generated if blank"}
            disabled={codeLocked}
            className="font-mono"
          />
          {isEdit && codeLocked && (
            <Button type="button" variant="outline" size="sm" onClick={handleUnlockRequest}>
              <Pencil className="size-3" />
              Change
            </Button>
          )}
        </div>
        {!isEdit && <p className="text-xs text-muted-foreground">Leave blank to auto-generate.</p>}
      </div>
      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <Label htmlFor="enabled" className="cursor-pointer">
            Enabled
          </Label>
          <p className="text-xs text-muted-foreground">Disabled links reject new signups.</p>
        </div>
        <Switch id="enabled" checked={enabled} onCheckedChange={onEnabledChange} />
      </div>
      <CodeChangeDialog open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={handleConfirmUnlock} />
    </div>
  );
}
