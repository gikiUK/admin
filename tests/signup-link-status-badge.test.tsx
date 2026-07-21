import { render, screen } from "@testing-library/react";
import { SignupLinkStatusBadge } from "@/components/signup-links/status-badge";
import type { SignupLink } from "@/lib/signup-links/types";

function makeLink(overrides: Partial<SignupLink> = {}): SignupLink {
  return {
    uuid: "u-1",
    code: "abc",
    title: "Test",
    enabled: true,
    expires_on: null,
    max_uses: null,
    uses_count: 0,
    consumed_count: 0,
    premium_until: null,
    feature_flags: [],
    analytics_tags: [],
    skip_email_confirmation: false,
    skip_welcome_email: false,
    workshop_onboarding: false,
    welcome_page_title: null,
    welcome_page_body: null,
    expired: false,
    exhausted: false,
    usable: true,
    ...overrides
  };
}

describe("SignupLinkStatusBadge", () => {
  test.each([
    ["active label for a usable link", makeLink(), "Active"],
    ["disabled label when enabled=false", makeLink({ enabled: false }), "Disabled"],
    ["expired label when expired=true", makeLink({ expired: true }), "Expired"],
    ["exhausted label when exhausted=true", makeLink({ exhausted: true }), "Exhausted"]
  ])("%s", (_label, link, expected) => {
    render(<SignupLinkStatusBadge link={link} />);
    expect(screen.getByText(expected)).not.toBeNull();
  });
});
