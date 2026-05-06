"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ManagedCompany, updateCompany } from "@/lib/manage/api";

type OrgNamePanelProps = {
  company: ManagedCompany;
  onUpdate: (company: ManagedCompany) => void;
};

export function OrgNamePanel({ company, onUpdate }: OrgNamePanelProps) {
  const [name, setName] = useState(company.name);
  const [saving, setSaving] = useState(false);

  const dirty = name.trim() !== company.name;
  const valid = name.trim().length > 0;

  async function handleSave() {
    setSaving(true);
    try {
      const result = await updateCompany(company.slug, { name: name.trim() });
      onUpdate(result.company);
      toast.success("Name updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rename");
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
          <Label htmlFor={`name-${company.id}`}>Organisation name</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`name-${company.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              className="max-w-md"
            />
            <Button size="sm" onClick={handleSave} disabled={saving || !dirty || !valid}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
