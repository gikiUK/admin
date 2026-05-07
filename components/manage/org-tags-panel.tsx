"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addOrgTag, type ManagedCompany, removeOrgTag } from "@/lib/manage/api";

type OrgTagsPanelProps = {
  company: ManagedCompany;
  onUpdate: (company: ManagedCompany) => void;
};

export function OrgTagsPanel({ company, onUpdate }: OrgTagsPanelProps) {
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleAdd() {
    const tag = draft.trim();
    if (!tag) return;
    setAdding(true);
    try {
      const result = await addOrgTag(company.slug, tag);
      onUpdate(result.company);
      setDraft("");
      toast.success("Tag added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add tag");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(tag: string) {
    setRemoving(tag);
    try {
      const result = await removeOrgTag(company.slug, tag);
      onUpdate(result.company);
      toast.success("Tag removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove tag");
    } finally {
      setRemoving(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`tag-${company.id}`}>Add tag</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`tag-${company.id}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="e.g. sustainability"
              maxLength={50}
              disabled={adding}
              className="max-w-md"
            />
            <Button size="sm" onClick={handleAdd} disabled={adding || draft.trim().length === 0}>
              {adding ? "Adding…" : "Add"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Tags are normalised server-side: lowercased, alphanumerics and hyphens only, max 50 characters.
          </p>
        </div>

        {company.tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tags yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {company.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1 font-mono text-xs">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemove(tag)}
                  disabled={removing === tag}
                  aria-label={`Remove ${tag}`}
                  className="rounded-full p-0.5 hover:bg-foreground/10 disabled:opacity-50"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
