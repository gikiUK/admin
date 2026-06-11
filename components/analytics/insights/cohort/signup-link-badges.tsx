"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SignupLink } from "@/lib/signup-links/types";

type Props = {
  links: SignupLink[];
  onRemove: (uuid: string) => void;
};

export function SignupLinkBadges({ links, onRemove }: Props) {
  return (
    <>
      {links.map((link) => (
        <Badge key={link.uuid} variant="secondary" className="gap-1 pl-2 pr-1">
          {link.title}
          <button
            type="button"
            onClick={() => onRemove(link.uuid)}
            className="rounded hover:bg-muted-foreground/20"
            aria-label={`Remove ${link.title}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
    </>
  );
}
