import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

import { SignupLinksTable } from "@/components/signup-links/signup-links-table";
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
    welcome_page_title: null,
    welcome_page_body: null,
    expired: false,
    exhausted: false,
    usable: true,
    ...overrides
  };
}

describe("SignupLinksTable", () => {
  test("renders an empty-state row when there are no links", () => {
    render(<SignupLinksTable links={[]} onDelete={jest.fn()} />);
    expect(screen.getByText(/no signup links yet/i)).not.toBeNull();
  });

  test("renders the title, code and uses for each row", () => {
    render(
      <SignupLinksTable
        links={[
          makeLink({ uuid: "u-a", title: "Alpha", code: "alpha", uses_count: 3, max_uses: 10 }),
          makeLink({ uuid: "u-b", title: "Beta", code: "beta", uses_count: 5, max_uses: null })
        ]}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText("Alpha")).not.toBeNull();
    expect(screen.getByText("Beta")).not.toBeNull();
    expect(screen.getByText("alpha")).not.toBeNull();
    expect(screen.getByText("beta")).not.toBeNull();
    expect(screen.getByText("3 / 10")).not.toBeNull();
    expect(screen.getByText("5")).not.toBeNull();
  });

  test("renders status badges that reflect link state", () => {
    render(
      <SignupLinksTable
        links={[
          makeLink({ uuid: "a", title: "ActiveOne" }),
          makeLink({ uuid: "b", title: "DisabledOne", enabled: false }),
          makeLink({ uuid: "c", title: "ExpiredOne", expired: true }),
          makeLink({ uuid: "d", title: "ExhaustedOne", exhausted: true, max_uses: 5, uses_count: 5 })
        ]}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText("Active")).not.toBeNull();
    expect(screen.getByText("Disabled")).not.toBeNull();
    expect(screen.getByText("Expired")).not.toBeNull();
    expect(screen.getByText("Exhausted")).not.toBeNull();
  });

  test("clicking the delete action calls onDelete with the row's link", () => {
    const onDelete = jest.fn();
    const link = makeLink({ uuid: "u-x", title: "Targeted" });
    render(<SignupLinksTable links={[link]} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(link);
  });
});
