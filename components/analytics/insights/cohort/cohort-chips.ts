import type { Dataset } from "@gikiuk/facts-engine";
import { makeFactFormatter } from "@/lib/analytics/fact-formatter";
import type { CohortSpec } from "@/lib/analytics/insights/cohort-spec";

const TIER_LABELS: Record<string, string> = {
  standard: "Standard",
  premium: "Premium"
};

const STATUS_LABELS: Record<string, string> = {
  never_subscribed: "Never subscribed",
  incomplete: "Incomplete",
  active: "Active",
  payment_failed: "Payment failed",
  cancelling: "Cancelling",
  canceled: "Canceled",
  incomplete_expired: "Incomplete expired"
};

export type CohortChip = { id: string; label: string; value: string };

export function buildCohortChips(spec: CohortSpec, dataset: Dataset | null): CohortChip[] {
  const chips: CohortChip[] = [];
  const o = spec.org_filters;

  if (o.tier?.length) {
    chips.push({ id: "tier", label: "Tier", value: o.tier.map((t) => TIER_LABELS[t] ?? t).join(", ") });
  }
  if (o.subscription_status?.length) {
    chips.push({
      id: "status",
      label: "Status",
      value: o.subscription_status.map((s) => STATUS_LABELS[s] ?? s).join(", ")
    });
  }
  if (o.tags_include?.length) {
    chips.push({ id: "tags_in", label: "Tags incl.", value: o.tags_include.join(", ") });
  }
  if (o.tags_exclude?.length) {
    chips.push({ id: "tags_ex", label: "Tags excl.", value: o.tags_exclude.join(", ") });
  }
  if (o.workshop_uuids?.length) {
    chips.push({ id: "workshops", label: "Workshops", value: `${o.workshop_uuids.length} selected` });
  }
  if (o.signed_up_from || o.signed_up_to) {
    const from = o.signed_up_from?.slice(0, 10) ?? "…";
    const to = o.signed_up_to?.slice(0, 10) ?? "…";
    chips.push({ id: "signup", label: "Signed up", value: `${from} → ${to}` });
  }
  if (o.has_tracked_actions === true) {
    chips.push({ id: "tracked", label: "Tracked actions", value: "Yes" });
  } else if (o.has_tracked_actions === false) {
    chips.push({ id: "tracked", label: "Tracked actions", value: "No" });
  }

  const formatter = dataset ? makeFactFormatter(dataset.data) : null;
  for (const f of spec.fact_filters) {
    if (!f.key || f.values.length === 0) continue;
    const q = dataset?.data.questions.find((qq) => qq.key === f.key);
    const factKey = q?.fact ?? f.key;
    const valueLabels = f.values.map((v) => (formatter ? formatter(factKey, v).valueLabel : String(v)));
    chips.push({
      id: `fact:${f.key}`,
      label: q?.label ?? f.key,
      value: valueLabels.join(" or ")
    });
  }

  return chips;
}
