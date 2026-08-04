import { extraRules } from "@/lib/cadence-emails/extra-rules";
import { audienceLabel, cadenceLabel, gapLabel, humanize, roleLabel, ruleLabel } from "@/lib/cadence-emails/labels";
import { findMinimumRoleRule, otherRules } from "@/lib/cadence-emails/rule-helpers";
import type { MinimumRoleRule } from "@/lib/cadence-emails/types";

const STANDARD_AND_ABOVE: MinimumRoleRule = { key: "minimum_role", value: "standard" };
const OWNERS_ONLY: MinimumRoleRule = { key: "minimum_role", value: "owner" };
const NON_PREMIUM_ONLY = { key: "non_premium_only" };
const PREMIUM_ONLY = { key: "premium_only" };

describe("humanize", () => {
  it("turns a key into a sentence-cased label", () => {
    expect(humanize("premium_only")).toBe("Premium only");
  });
});

describe("cadenceLabel", () => {
  it("labels the seeded cadences", () => {
    expect(cadenceLabel("plan_guidance")).toBe("Plan guidance");
    expect(cadenceLabel("nudge_to_create_profile")).toBe("Nudge to create profile");
  });
});

describe("gapLabel", () => {
  it("pluralises days", () => {
    expect(gapLabel(2)).toBe("2 days");
    expect(gapLabel(1)).toBe("1 day");
  });
});

describe("roleLabel", () => {
  it("uses plural copy for known roles", () => {
    expect(roleLabel("readonly")).toBe("read-only members");
  });

  it("degrades legibly for a role it doesn't know", () => {
    expect(roleLabel("super_admin")).toBe("super admin");
  });
});

describe("audienceLabel", () => {
  it("reads a floor as 'and above'", () => {
    expect(audienceLabel("standard")).toBe("standard members and above");
  });

  it("reads the most senior role as 'only', since nobody is above it", () => {
    expect(audienceLabel("owner")).toBe("owners only");
  });
});

describe("ruleLabel", () => {
  it("labels a role floor", () => {
    expect(ruleLabel(STANDARD_AND_ABOVE)).toBe("Standard members and above");
    expect(ruleLabel(OWNERS_ONLY)).toBe("Owners only");
  });

  it("hyphenates non-premium, which humanize can't", () => {
    expect(ruleLabel(NON_PREMIUM_ONLY)).toBe("Non-premium only");
  });

  it("falls back to the key for an unrecognised rule", () => {
    expect(ruleLabel(PREMIUM_ONLY)).toBe("Premium only");
  });
});

describe("findMinimumRoleRule", () => {
  it("picks the role floor out of a rule list", () => {
    expect(findMinimumRoleRule([NON_PREMIUM_ONLY, OWNERS_ONLY])).toEqual(OWNERS_ONLY);
  });

  it("returns undefined when there isn't one", () => {
    expect(findMinimumRoleRule([NON_PREMIUM_ONLY])).toBeUndefined();
  });
});

describe("otherRules", () => {
  it("drops the audience floor, which renders as prose", () => {
    expect(otherRules([STANDARD_AND_ABOVE, NON_PREMIUM_ONLY])).toEqual([NON_PREMIUM_ONLY]);
  });
});

describe("extraRules", () => {
  const cadenceRules = [STANDARD_AND_ABOVE];

  it("shows nothing when the email matches its cadence", () => {
    expect(extraRules([STANDARD_AND_ABOVE], cadenceRules)).toEqual([]);
  });

  it("shows a role floor the email tightens", () => {
    expect(extraRules([OWNERS_ONLY], cadenceRules)).toEqual([OWNERS_ONLY]);
  });

  it("shows rules the cadence doesn't have", () => {
    expect(extraRules([STANDARD_AND_ABOVE, NON_PREMIUM_ONLY], cadenceRules)).toEqual([NON_PREMIUM_ONLY]);
  });

  it("shows everything when the cadence has no rules of its own", () => {
    expect(extraRules([STANDARD_AND_ABOVE, NON_PREMIUM_ONLY], [])).toEqual([STANDARD_AND_ABOVE, NON_PREMIUM_ONLY]);
  });
});
