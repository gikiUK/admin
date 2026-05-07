"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ManagedUser, updateUser } from "@/lib/manage/api";

type UserEmailPanelProps = {
  user: ManagedUser;
  onUpdate: (user: ManagedUser) => void;
};

export function UserEmailPanel({ user, onUpdate }: UserEmailPanelProps) {
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEmail(user.email);
  }, [user.email]);

  const dirty = email.trim() !== user.email;
  const valid = /.+@.+\..+/.test(email.trim());

  async function handleSave() {
    setSaving(true);
    try {
      const result = await updateUser(user.id, { email: email.trim() });
      onUpdate(result.user);
      toast.success("Email updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update email");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor={`user-email-${user.id}`}>Email address</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`user-email-${user.id}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
              className="max-w-md"
            />
            <Button size="sm" onClick={handleSave} disabled={saving || !dirty || !valid}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Takes effect immediately. The user is not asked to reconfirm.</p>
        </div>
      </CardContent>
    </Card>
  );
}
