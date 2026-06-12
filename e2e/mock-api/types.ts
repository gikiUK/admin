/**
 * Type-only mirrors of the Rails `signup_link` permit list (from
 * Admin::SignupLinksController#create_params) and the SerializeSignupLink
 * output. Kept here so specs assert against an explicit shape rather than
 * `Record<string, unknown>`.
 */
import type { SignupLink, SignupLinkCompany, SignupLinkPayload } from "@/lib/signup-links/types";

export type CapturedRequest = {
  method: string;
  url: string;
  pathname: string;
  body: unknown;
};

export type AdminSignupLinkRequestEnvelope = {
  signup_link: SignupLinkPayload;
};

export type { SignupLink, SignupLinkCompany, SignupLinkPayload };
