/**
 * Hermetic mock API mounted on Playwright's `page.route`. Intercepts every
 * request to the configured API base URL and answers from `MockStore`.
 *
 * What this layer covers, vs. what it does NOT:
 *   - Covers: shapes (response and request envelope), pagination meta,
 *     basic validation (signup_link_in_use, signup_link_not_found,
 *     validation_error for blank title), reference catalogues.
 *   - Does NOT cover: the auth flow (we stub /admin/facts_datasets/live as a
 *     session check pass; the login form is never exercised here).
 *   - Does NOT cover: Rails-side concerns like code uniqueness, race
 *     conditions, or the actual Devise + 2FA dance.
 */
import type { Page, Route } from "@playwright/test";
import type { Paginated } from "@/lib/api/client";
import type { MockStore } from "./store";
import type { CapturedRequest, SignupLink, SignupLinkPayload } from "./types";

/**
 * We match by pathname, not full URL — the API base URL is baked into the
 * Next.js production bundle at build time via NEXT_PUBLIC_API_URL, so the
 * value can drift from what Playwright thinks it'll be. Intercepting by path
 * makes the mock robust to that and to localhost-vs-127.0.0.1 quirks.
 */
const API_PATH_PREFIXES = ["/admin/", "/auth/"];

function isApiPath(pathname: string): boolean {
  return API_PATH_PREFIXES.some((p) => pathname.startsWith(p));
}

export type MockServer = {
  captures: CapturedRequest[];
  store: MockStore;
  byMethod: (method: string, pathSubstring?: string) => CapturedRequest[];
  setHandlerOverride: (key: string, handler: (route: Route) => Promise<void> | void) => void;
  clearHandlerOverride: (key: string) => void;
};

type Overrides = Map<string, (route: Route) => Promise<void> | void>;

function paginate<T>(items: T[], page: number, per: number): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / per));
  const start = (page - 1) * per;
  return {
    results: items.slice(start, start + per),
    meta: { current_page: page, total_count: total, total_pages: totalPages }
  };
}

async function readJsonBody(route: Route): Promise<unknown> {
  const post = route.request().postData();
  if (!post) return null;
  try {
    return JSON.parse(post);
  } catch {
    return post;
  }
}

function unwrap(body: unknown): SignupLinkPayload {
  if (body && typeof body === "object" && "signup_link" in body) {
    return (body as { signup_link: SignupLinkPayload }).signup_link;
  }
  return {};
}

async function notFound(route: Route, errorType: string) {
  await route.fulfill({
    status: 404,
    contentType: "application/json",
    body: JSON.stringify({ error: { type: errorType, message: "Not found" } })
  });
}

async function validationError(route: Route, errors: Record<string, string[]>) {
  await route.fulfill({
    status: 422,
    contentType: "application/json",
    body: JSON.stringify({ error: { type: "validation_error", message: "Validation failed", errors } })
  });
}

async function inUseError(route: Route) {
  await route.fulfill({
    status: 422,
    contentType: "application/json",
    body: JSON.stringify({ error: { type: "signup_link_in_use", message: "Signup link in use" } })
  });
}

async function ok(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body)
  });
}

export async function installMockApi(page: Page, store: MockStore): Promise<MockServer> {
  const captures: CapturedRequest[] = [];
  const overrides: Overrides = new Map();

  await page.route(
    (url) => isApiPath(url.pathname),
    async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const method = request.method();
      const body = await readJsonBody(route);

      captures.push({ method, url: request.url(), pathname: url.pathname, body });

      const overrideKey = `${method} ${url.pathname}`;
      const override = overrides.get(overrideKey);
      if (override) {
        await override(route);
        return;
      }

      // ── Session check ────────────────────────────────────────
      if (url.pathname === "/admin/facts_datasets/live") {
        return ok(route, { dataset: { id: "live", version: 1 } });
      }

      // ── Reference catalogues ─────────────────────────────────
      if (method === "GET" && url.pathname === "/admin/feature_flags") {
        return ok(route, { feature_flags: store.featureFlags });
      }
      if (method === "GET" && url.pathname === "/admin/analytics/company_tags") {
        return ok(route, { company_tags: store.companyTags });
      }

      // ── Companies under a link ───────────────────────────────
      const companiesMatch = url.pathname.match(/^\/admin\/signup_links\/([^/]+)\/companies$/);
      if (method === "GET" && companiesMatch) {
        const uuid = decodeURIComponent(companiesMatch[1]);
        const link = store.find(uuid);
        if (!link) return notFound(route, "signup_link_not_found");
        const page = Number(url.searchParams.get("page") ?? "1");
        const per = Number(url.searchParams.get("per") ?? "25");
        return ok(route, paginate(store.companiesFor(uuid), page, per));
      }

      // ── Signup links collection ──────────────────────────────
      if (method === "GET" && url.pathname === "/admin/signup_links") {
        const page = Number(url.searchParams.get("page") ?? "1");
        const per = Number(url.searchParams.get("per") ?? "25");
        return ok(route, paginate(store.links, page, per));
      }
      if (method === "POST" && url.pathname === "/admin/signup_links") {
        const payload = unwrap(body);
        if (!payload.title || payload.title.trim() === "") {
          return validationError(route, { title: ["can't be blank"] });
        }
        const created = store.create(payload);
        return ok(route, { signup_link: created }, 201);
      }

      // ── Single signup link ───────────────────────────────────
      const singleMatch = url.pathname.match(/^\/admin\/signup_links\/([^/]+)$/);
      if (singleMatch) {
        const uuid = decodeURIComponent(singleMatch[1]);
        if (method === "GET") {
          const link = store.find(uuid);
          if (!link) return notFound(route, "signup_link_not_found");
          return ok(route, { signup_link: link });
        }
        if (method === "PATCH") {
          const payload = unwrap(body);
          if ("title" in payload && (!payload.title || payload.title.trim() === "")) {
            return validationError(route, { title: ["can't be blank"] });
          }
          const updated = store.update(uuid, payload);
          if (!updated) return notFound(route, "signup_link_not_found");
          return ok(route, { signup_link: updated });
        }
        if (method === "DELETE") {
          const link = store.find(uuid);
          if (!link) return notFound(route, "signup_link_not_found");
          if (link.consumed_count > 0) return inUseError(route);
          store.destroy(uuid);
          return ok(route, {});
        }
      }

      // ── Unhandled — surface in the test ──────────────────────
      await route.fulfill({
        status: 501,
        contentType: "application/json",
        body: JSON.stringify({
          error: { type: "mock_unhandled", message: `Mock has no handler for ${method} ${url.pathname}` }
        })
      });
    }
  );

  return {
    captures,
    store,
    byMethod: (method, pathSubstring) =>
      captures.filter((c) => c.method === method && (pathSubstring ? c.pathname.includes(pathSubstring) : true)),
    setHandlerOverride: (key, handler) => overrides.set(key, handler),
    clearHandlerOverride: (key) => overrides.delete(key)
  };
}

export function castSignupLink(link: unknown): SignupLink {
  return link as SignupLink;
}
