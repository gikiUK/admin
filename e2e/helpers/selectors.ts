/**
 * Selectors and small UI helpers shared across signup-link specs.
 * One source of truth so a UI tweak only requires one edit.
 */
import type { Page } from "@playwright/test";

export const sel = {
  titleInput: () => "input#title",
  codeInput: () => "input#code",
  enabledSwitch: () => 'switch[id="enabled"]',
  expiresOnInput: () => "input#expires_on",
  maxUsesInput: () => "input#max_uses",
  premiumUntilInput: () => "input#premium_until",
  welcomePageTitleInput: () => "input#welcome_page_title",
  welcomePageBodyInput: () => "textarea#welcome_page_body"
};

export async function openAdvanced(page: Page) {
  const trigger = page.getByRole("button", { name: /advanced options/i });
  const ariaExpanded = await trigger.getAttribute("aria-expanded");
  if (ariaExpanded === "false") await trigger.click();
}

export async function fillTitle(page: Page, title: string) {
  await page.locator(sel.titleInput()).fill(title);
}

export async function fillCode(page: Page, code: string) {
  await page.locator(sel.codeInput()).fill(code);
}
