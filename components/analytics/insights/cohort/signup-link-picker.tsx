"use client";

import { SignupLinkBadges } from "@/components/analytics/insights/cohort/signup-link-badges";
import { SignupLinkPickerPopover } from "@/components/analytics/insights/cohort/signup-link-picker-popover";
import { useSignupLinkList } from "@/components/analytics/insights/cohort/use-signup-link-list";

type Props = {
  selectedUuids: string[];
  onChange: (next: string[]) => void;
};

export function SignupLinkPicker({ selectedUuids, onChange }: Props) {
  const { links, totalCount } = useSignupLinkList();
  const selectedLinks = links?.filter((l) => selectedUuids.includes(l.uuid)) ?? [];

  function toggle(uuid: string) {
    onChange(selectedUuids.includes(uuid) ? selectedUuids.filter((u) => u !== uuid) : [...selectedUuids, uuid]);
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Signup links</span>
      <div className="flex flex-wrap gap-1.5">
        <SignupLinkBadges links={selectedLinks} onRemove={toggle} />
        <SignupLinkPickerPopover
          links={links}
          totalCount={totalCount}
          selectedUuids={selectedUuids}
          triggerLabel={selectedLinks.length === 0 ? "Pick signup links" : "Edit"}
          onToggle={toggle}
        />
      </div>
    </div>
  );
}
