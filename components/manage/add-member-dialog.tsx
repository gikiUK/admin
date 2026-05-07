"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type AnalyticsUser, fetchUsers } from "@/lib/analytics/api";
import { createMembership, MEMBERSHIP_ROLES, type MembershipRole } from "@/lib/manage/api";

type AddMemberDialogProps = {
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
};

export function AddMemberDialog({ slug, open, onOpenChange, onAdded }: AddMemberDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnalyticsUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<AnalyticsUser | null>(null);
  const [role, setRole] = useState<MembershipRole>("standard");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSelected(null);
      setRole("standard");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    let cancelled = false;
    fetchUsers({ query: trimmed, per: 10 })
      .then((response) => {
        if (cancelled) return;
        setResults(response.results);
      })
      .catch(() => {
        if (cancelled) return;
        setResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, query]);

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    try {
      await createMembership(slug, { user_id: selected.id, role });
      toast.success(`${selected.name || selected.email} added as ${role}`);
      onAdded();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>Search for an existing user and assign them a role.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <DebouncedInput
              value={query}
              onCommit={setQuery}
              placeholder="Search by name or email…"
              autoFocus
              className={searching ? "pr-9" : undefined}
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {selected ? (
            <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
              <div className="text-sm">
                <div className="font-medium">{selected.name || "—"}</div>
                <div className="text-muted-foreground text-xs">{selected.email}</div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
                Change
              </Button>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto rounded-md border">
              {searching ? (
                <div className="p-3 text-sm text-muted-foreground">Searching…</div>
              ) : results.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">
                  {query.trim().length < 2 ? "Type at least 2 characters." : "No users found."}
                </div>
              ) : (
                <ul className="divide-y">
                  {results.map((user) => (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(user)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50"
                      >
                        <div className="font-medium">{user.name || "—"}</div>
                        <div className="text-muted-foreground text-xs">{user.email}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Role</span>
            <Select value={role} onValueChange={(v: MembershipRole) => setRole(v)}>
              <SelectTrigger className="h-8 w-[140px] text-xs capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEMBERSHIP_ROLES.map((r) => (
                  <SelectItem key={r} value={r} className="capitalize">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selected || submitting}>
            {submitting ? "Adding…" : "Add member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
