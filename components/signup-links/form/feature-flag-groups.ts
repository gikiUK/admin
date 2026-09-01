/**
 * How feature flags are presented in the admin.
 *
 * The API's catalogue stays the source of truth for which flags are *valid* —
 * it rejects anything it doesn't know. This only decides how they're grouped,
 * ordered and labelled, which the API has no opinion about.
 *
 * A flag that isn't listed here still renders, under "Other", so a new API flag
 * is usable straight away rather than waiting on an admin deploy.
 */
export type FeatureFlagGroup = {
  heading: string;
  flags: { flag: string; label: string }[];
};

export const FEATURE_FLAG_GROUPS: FeatureFlagGroup[] = [
  {
    heading: "Actions",
    flags: [
      { flag: "action_management", label: "Manage actions (assignees, due dates, notes)" },
      { flag: "action_details", label: "Implementation details and downloads" }
    ]
  },
  {
    heading: "Certification",
    flags: [{ flag: "bcorp", label: "B Corp certification" }]
  },
  {
    heading: "Team",
    flags: [
      { flag: "invite_readonly_users", label: "Invite read-only colleagues" },
      { flag: "invite_full_users", label: "Invite colleagues who can edit" }
    ]
  },
  {
    heading: "Programmes",
    flags: [
      { flag: "energy_price_shock", label: "Energy price shock" },
      { flag: "commuting_and_homeworking_survey", label: "Commuting and homeworking survey" }
    ]
  }
];

const GROUPED = new Set(FEATURE_FLAG_GROUPS.flatMap((g) => g.flags.map((f) => f.flag)));

/**
 * The catalogue arranged into groups, with anything the admin doesn't recognise
 * collected under "Other" so it can still be ticked.
 */
export function groupCatalogue(catalogue: string[]): FeatureFlagGroup[] {
  const known = new Set(catalogue);
  const groups = FEATURE_FLAG_GROUPS.map((group) => ({
    ...group,
    flags: group.flags.filter((f) => known.has(f.flag))
  })).filter((group) => group.flags.length > 0);

  const ungrouped = catalogue.filter((flag) => !GROUPED.has(flag));
  if (ungrouped.length > 0) {
    groups.push({ heading: "Other", flags: ungrouped.map((flag) => ({ flag, label: flag })) });
  }
  return groups;
}
