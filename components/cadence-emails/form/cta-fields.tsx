"use client";

import { Field } from "@/components/cadence-emails/form/field";
import { Input } from "@/components/ui/input";
import { getFrontendUrl } from "@/lib/api/config";

type Props = {
  ctaText: string;
  ctaPath: string;
  errors: Partial<Record<"cta_text" | "cta_path" | "cta", string>>;
  onCtaTextChange: (value: string) => void;
  onCtaPathChange: (value: string) => void;
};

export function CtaFields({ ctaText, ctaPath, errors, onCtaTextChange, onCtaPathChange }: Props) {
  const trimmedPath = ctaPath.trim();
  const resolved = trimmedPath.startsWith("/") ? getFrontendUrl(trimmedPath) : null;

  return (
    <div className="space-y-5">
      <Field
        id="cta-text"
        label="Button label"
        error={errors.cta_text}
        hint="Leave both button fields blank to send the email without a button."
      >
        <Input id="cta-text" value={ctaText} onChange={(e) => onCtaTextChange(e.target.value)} />
      </Field>

      <Field
        id="cta-path"
        label="Button path"
        error={errors.cta_path}
        hint={
          resolved ? (
            <>
              Links to <span className="font-mono">{resolved}</span>
            </>
          ) : (
            "A path, not a URL — e.g. /actions/recommendations. The API prepends the frontend base URL."
          )
        }
      >
        <Input
          id="cta-path"
          value={ctaPath}
          placeholder="/actions/recommendations"
          className="font-mono"
          onChange={(e) => onCtaPathChange(e.target.value)}
        />
      </Field>

      {errors.cta && <p className="text-destructive text-xs">{errors.cta}</p>}
    </div>
  );
}
