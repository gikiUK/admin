"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { createReferrer } from "@/lib/signup-links/related-api";

type Props = {
  onCreated: () => void;
};

export function CreateReferrerForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await createReferrer(trimmed);
      setName("");
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create referrer");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="referrer_name">Name</Label>
        <Input
          id="referrer_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Patagonia campaign"
          disabled={submitting}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <Button type="submit" disabled={submitting || name.trim() === ""}>
        {submitting ? "Creating…" : "Create referrer"}
      </Button>
    </form>
  );
}
