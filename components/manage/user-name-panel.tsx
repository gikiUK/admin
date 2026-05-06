"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ManagedUser, updateUser } from "@/lib/manage/api";

type UserNamePanelProps = {
  user: ManagedUser;
  onUpdate: (user: ManagedUser) => void;
};

export function UserNamePanel({ user, onUpdate }: UserNamePanelProps) {
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user.name);
  }, [user.name]);

  const dirty = name.trim() !== user.name;

  async function handleSave() {
    setSaving(true);
    try {
      const result = await updateUser(user.id, { name: name.trim() });
      onUpdate(result.user);
      toast.success("Name updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Name</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor={`user-name-${user.id}`}>Display name</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`user-name-${user.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              className="max-w-md"
            />
            <Button size="sm" onClick={handleSave} disabled={saving || !dirty}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
