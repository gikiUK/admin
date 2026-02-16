const API_URL = "/api";

// ── Response types ──────────────────────────────────────

export type LoginResponse =
  | { status: "success" }
  | { status: "2fa_required" }
  | { status: "2fa_setup_required"; provisioning_uri: string };

// ── Auth API functions ──────────────────────────────────

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ user: { email, password } })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message ?? "Invalid credentials");
  }
  return res.json();
}

export async function verifyOtp(code: string): Promise<{ status: "success" }> {
  const res = await fetch(`${API_URL}/auth/verify-2fa`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ otp_code: code })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message ?? "Invalid code");
  }
  return res.json();
}

export async function setupOtp(code: string): Promise<{ status: "success" }> {
  const res = await fetch(`${API_URL}/auth/setup-2fa`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ otp_code: code })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message ?? "Invalid code");
  }
  return res.json();
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: "DELETE",
    credentials: "include",
    headers: { Accept: "application/json" }
  });
}

export async function checkSession(): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${API_URL}/admin/facts_datasets/live`, {
    credentials: "include",
    headers: { Accept: "application/json" }
  });
  if (res.ok) return { ok: true };
  if (res.status === 403) return { ok: false, error: "Admin access required" };
  return { ok: false };
}
