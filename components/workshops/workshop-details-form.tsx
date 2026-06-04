"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Workshop, WorkshopFormData } from "@/lib/workshops/api";

type Props = {
  initial?: Workshop;
  onSave: (data: WorkshopFormData) => Promise<void>;
};

function toDatetimeLocal(iso: string): string {
  return iso.slice(0, 16);
}

function addDays(localDatetime: string, days: number): string {
  if (!localDatetime) return "";
  const d = new Date(localDatetime);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + days);
  return toDatetimeLocal(d.toISOString());
}

export function WorkshopDetailsForm({ initial, onSave }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [scheduledAt, setScheduledAt] = useState(initial ? toDatetimeLocal(initial.scheduled_at) : "");
  const [expiresAt, setExpiresAt] = useState(initial ? toDatetimeLocal(initial.expires_at) : "");
  const [expiresEdited, setExpiresEdited] = useState(false);
  const [streamingUrl, setStreamingUrl] = useState(initial?.streaming_url ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleScheduledChange(value: string) {
    setScheduledAt(value);
    if (!initial && !expiresEdited) {
      setExpiresAt(addDays(value, 3));
    }
  }

  function handleExpiresChange(value: string) {
    setExpiresAt(value);
    setExpiresEdited(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({
        title,
        scheduled_at: new Date(scheduledAt).toISOString(),
        expires_at: new Date(expiresAt).toISOString(),
        streaming_url: streamingUrl || undefined
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="shrink-0 space-y-1.5">
          <Label htmlFor="scheduled_at">Scheduled at *</Label>
          <Input
            id="scheduled_at"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => handleScheduledChange(e.target.value)}
            required
            className="w-auto"
          />
        </div>
        <div className="shrink-0 space-y-1.5">
          <Label htmlFor="expires_at">Expires at *</Label>
          <Input
            id="expires_at"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => handleExpiresChange(e.target.value)}
            required
            className="w-auto"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="streaming_url">Streaming URL</Label>
        <Input id="streaming_url" type="url" value={streamingUrl} onChange={(e) => setStreamingUrl(e.target.value)} />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : initial ? "Update Workshop" : "Create Workshop"}
      </Button>
    </form>
  );
}
