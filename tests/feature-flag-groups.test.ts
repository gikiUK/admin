import { FEATURE_FLAG_GROUPS, groupCatalogue } from "@/components/signup-links/form/feature-flag-groups";

const CATALOGUE = [
  "energy_price_shock",
  "commuting_and_homeworking_survey",
  "bcorp",
  "action_management",
  "invite_readonly_users",
  "invite_full_users",
  "action_details"
];

describe("groupCatalogue", () => {
  test("arranges the catalogue into the admin's groups", () => {
    const groups = groupCatalogue(CATALOGUE);
    expect(groups.map((g) => g.heading)).toEqual(["Actions", "Certification", "Team", "Programmes"]);
  });

  test("covers every catalogue flag exactly once", () => {
    const flags = groupCatalogue(CATALOGUE).flatMap((g) => g.flags.map((f) => f.flag));
    expect([...flags].sort()).toEqual([...CATALOGUE].sort());
  });

  // A flag the API knows but the admin hasn't been taught about must stay
  // usable, rather than silently disappearing from the form.
  test("collects unknown flags under Other", () => {
    const groups = groupCatalogue([...CATALOGUE, "brand_new_flag"]);
    const other = groups.find((g) => g.heading === "Other");
    expect(other?.flags).toEqual([{ flag: "brand_new_flag", label: "brand_new_flag" }]);
  });

  test("omits groups whose flags are absent from the catalogue", () => {
    const groups = groupCatalogue(["bcorp"]);
    expect(groups.map((g) => g.heading)).toEqual(["Certification"]);
  });

  test("returns nothing for an empty catalogue", () => {
    expect(groupCatalogue([])).toEqual([]);
  });

  // The groups are hand-maintained, so guard against a typo'd duplicate.
  test("lists no flag in more than one group", () => {
    const all = FEATURE_FLAG_GROUPS.flatMap((g) => g.flags.map((f) => f.flag));
    expect(all.length).toBe(new Set(all).size);
  });
});
