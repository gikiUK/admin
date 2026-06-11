"use client";

import { useReferrers } from "@/components/signup-links/form/use-form-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NONE = "__none__";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function ReferrerSelect({ value, onChange }: Props) {
  const state = useReferrers();
  const referrers = state.status === "ready" ? state.value : [];

  return (
    <Select value={value === "" ? NONE : value} onValueChange={(v) => onChange(v === NONE ? "" : v)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={state.status === "loading" ? "Loading…" : "No referrer"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>No referrer</SelectItem>
        {referrers.map((r) => (
          <SelectItem key={r.id} value={String(r.id)}>
            {r.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
