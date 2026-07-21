import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>
}));

jest.mock("remark-gfm", () => ({
  __esModule: true,
  default: () => {}
}));

jest.mock("@/components/signup-links/form/use-form-data", () => ({
  useFeatureFlagCatalogue: () => ({ status: "ready", value: ["energy_price_shock"] }),
  useCompanyTagUniverse: () => ({ status: "ready", value: [] })
}));

import { SignupLinkForm } from "@/components/signup-links/form/signup-link-form";
import type { SignupLink } from "@/lib/signup-links/types";

function makeLink(overrides: Partial<SignupLink> = {}): SignupLink {
  return {
    uuid: "u-1",
    code: "abc123",
    title: "Test Link",
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

function getCodeInput(): HTMLInputElement {
  return screen.getByLabelText(/^code$/i) as HTMLInputElement;
}

describe("SignupLinkForm — create", () => {
  test("submit is disabled until title has content", () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<SignupLinkForm initial={null} submitLabel="Create" onSubmit={onSubmit} />);

    const button = screen.getByRole("button", { name: /^create$/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "My link" } });
    expect(button.disabled).toBe(false);
  });

  test("submitting with just a title calls onSubmit with minimal payload", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<SignupLinkForm initial={null} submitLabel="Create" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Minimal" } });
    fireEvent.click(screen.getByRole("button", { name: /^create$/i }));

    await Promise.resolve();
    await Promise.resolve();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.title).toBe("Minimal");
    expect(payload.enabled).toBe(true);
    expect(payload.welcome_page_title).toBeNull();
    expect(payload.welcome_page_body).toBeNull();
    expect(payload.code).toBeUndefined();
  });

  test("code field is editable on create without confirmation", () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<SignupLinkForm initial={null} submitLabel="Create" onSubmit={onSubmit} />);

    const codeInput = getCodeInput();
    expect(codeInput.disabled).toBe(false);
    fireEvent.change(codeInput, { target: { value: "custom-code" } });
    expect(codeInput.value).toBe("custom-code");
  });
});

describe("SignupLinkForm — edit", () => {
  test("code field is locked initially and reveals a 'Change' button", () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<SignupLinkForm initial={makeLink()} submitLabel="Save" onSubmit={onSubmit} />);

    const codeInput = getCodeInput();
    expect(codeInput.value).toBe("abc123");
    expect(codeInput.disabled).toBe(true);

    expect(screen.getByRole("button", { name: /^change$/i })).not.toBeNull();
  });

  test("clicking Change opens the confirmation dialog without unlocking immediately", () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<SignupLinkForm initial={makeLink()} submitLabel="Save" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: /^change$/i }));

    expect(screen.getByText(/Changing the code means/i)).not.toBeNull();
    expect(getCodeInput().disabled).toBe(true);
  });

  test("confirming the dialog unlocks the code field for editing", () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<SignupLinkForm initial={makeLink()} submitLabel="Save" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: /^change$/i }));
    fireEvent.click(screen.getByRole("button", { name: /change code/i }));

    expect(getCodeInput().disabled).toBe(false);
  });

  test("submitting without changing the code omits 'code' from the payload", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<SignupLinkForm initial={makeLink()} submitLabel="Save" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await Promise.resolve();
    await Promise.resolve();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.code).toBeUndefined();
  });

  test("changing the code after confirmation includes the new code in the payload", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<SignupLinkForm initial={makeLink()} submitLabel="Save" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: /^change$/i }));
    fireEvent.click(screen.getByRole("button", { name: /change code/i }));
    fireEvent.change(getCodeInput(), { target: { value: "new-code" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await Promise.resolve();
    await Promise.resolve();

    const payload = onSubmit.mock.calls[0][0];
    expect(payload.code).toBe("new-code");
  });

  test("toggling Enabled off updates the payload", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<SignupLinkForm initial={makeLink()} submitLabel="Save" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("switch", { name: /^enabled$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await Promise.resolve();
    await Promise.resolve();

    expect(onSubmit.mock.calls[0][0].enabled).toBe(false);
  });
});

describe("SignupLinkForm — welcome page validation", () => {
  function enableWelcomePage() {
    fireEvent.click(screen.getByRole("switch", { name: /enable welcome page/i }));
  }

  test("enabling welcome page with empty title and body blocks submit and shows warnings", () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<SignupLinkForm initial={makeLink({ title: "Has title" })} submitLabel="Save" onSubmit={onSubmit} />);

    enableWelcomePage();

    expect(screen.getByText(/title is required when the welcome page is on/i)).not.toBeNull();
    expect(screen.getByText(/body is required when the welcome page is on/i)).not.toBeNull();
    expect(screen.getByText(/welcome page is enabled but title or body is missing/i)).not.toBeNull();

    const saveButton = screen.getByRole("button", { name: /^save$/i }) as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);
  });

  test("filling only the title still blocks submit and keeps the body warning", () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<SignupLinkForm initial={makeLink({ title: "Has title" })} submitLabel="Save" onSubmit={onSubmit} />);

    enableWelcomePage();
    fireEvent.change(document.getElementById("welcome_page_title") as HTMLInputElement, {
      target: { value: "Welcome!" }
    });

    expect(screen.queryByText(/title is required when the welcome page is on/i)).toBeNull();
    expect(screen.getByText(/body is required when the welcome page is on/i)).not.toBeNull();
    expect((screen.getByRole("button", { name: /^save$/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  test("whitespace-only title and body do not satisfy the requirement", () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<SignupLinkForm initial={makeLink({ title: "Has title" })} submitLabel="Save" onSubmit={onSubmit} />);

    enableWelcomePage();
    fireEvent.change(document.getElementById("welcome_page_title") as HTMLInputElement, {
      target: { value: "   " }
    });
    fireEvent.change(document.getElementById("welcome_page_body") as HTMLTextAreaElement, {
      target: { value: "  \n  " }
    });

    expect(screen.getByText(/title is required when the welcome page is on/i)).not.toBeNull();
    expect(screen.getByText(/body is required when the welcome page is on/i)).not.toBeNull();
    expect((screen.getByRole("button", { name: /^save$/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  test("filling both title and body unblocks submit and sends them in the payload", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<SignupLinkForm initial={makeLink({ title: "Has title" })} submitLabel="Save" onSubmit={onSubmit} />);

    enableWelcomePage();
    fireEvent.change(document.getElementById("welcome_page_title") as HTMLInputElement, {
      target: { value: "Welcome!" }
    });
    fireEvent.change(document.getElementById("welcome_page_body") as HTMLTextAreaElement, {
      target: { value: "Body markdown" }
    });

    expect(screen.queryByText(/welcome page is enabled but title or body is missing/i)).toBeNull();

    const saveButton = screen.getByRole("button", { name: /^save$/i }) as HTMLButtonElement;
    expect(saveButton.disabled).toBe(false);

    fireEvent.click(saveButton);
    await Promise.resolve();
    await Promise.resolve();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].welcome_page_title).toBe("Welcome!");
    expect(onSubmit.mock.calls[0][0].welcome_page_body).toBe("Body markdown");
  });

  test("toggling welcome page back off clears the block even with empty fields", () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<SignupLinkForm initial={makeLink({ title: "Has title" })} submitLabel="Save" onSubmit={onSubmit} />);

    enableWelcomePage();
    expect((screen.getByRole("button", { name: /^save$/i }) as HTMLButtonElement).disabled).toBe(true);

    enableWelcomePage();
    expect(screen.queryByText(/welcome page is enabled but title or body is missing/i)).toBeNull();
    expect((screen.getByRole("button", { name: /^save$/i }) as HTMLButtonElement).disabled).toBe(false);
  });
});
