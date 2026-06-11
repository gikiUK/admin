"use client";

import { Badge } from "@/components/ui/badge";
import type { SignupLink } from "@/lib/signup-links/types";
import { signupLinkStatus } from "@/lib/signup-links/types";

const VARIANT: Record<ReturnType<typeof signupLinkStatus>, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  disabled: "secondary",
  expired: "outline",
  exhausted: "outline"
};

const LABEL: Record<ReturnType<typeof signupLinkStatus>, string> = {
  active: "Active",
  disabled: "Disabled",
  expired: "Expired",
  exhausted: "Exhausted"
};

export function SignupLinkStatusBadge({ link }: { link: SignupLink }) {
  const status = signupLinkStatus(link);
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
