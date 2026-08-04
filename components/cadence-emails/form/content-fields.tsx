"use client";

import { Field } from "@/components/cadence-emails/form/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  subject: string;
  previewText: string;
  bodyMarkdown: string;
  errors: Partial<Record<"subject" | "preview_text" | "body_markdown", string>>;
  onSubjectChange: (value: string) => void;
  onPreviewTextChange: (value: string) => void;
  onBodyMarkdownChange: (value: string) => void;
};

export function ContentFields({
  subject,
  previewText,
  bodyMarkdown,
  errors,
  onSubjectChange,
  onPreviewTextChange,
  onBodyMarkdownChange
}: Props) {
  return (
    <div className="space-y-5">
      <Field id="subject" label="Subject" error={errors.subject}>
        <Input id="subject" value={subject} onChange={(e) => onSubjectChange(e.target.value)} />
      </Field>

      <Field
        id="preview-text"
        label="Preview text"
        error={errors.preview_text}
        hint="The snippet inboxes show after the subject line."
      >
        <Input id="preview-text" value={previewText} onChange={(e) => onPreviewTextChange(e.target.value)} />
      </Field>

      <Field
        id="body-markdown"
        label="Body"
        error={errors.body_markdown}
        hint={
          <>
            Markdown only — no HTML or MJML. The greeting (“Hi there,”) and signoff (“The Giki Team”) are fixed in the
            template, so don't repeat them here. Kramdown applies smart quotes, so straight quotes come out curly.
          </>
        }
      >
        <Textarea
          id="body-markdown"
          value={bodyMarkdown}
          rows={18}
          className="font-mono text-sm"
          onChange={(e) => onBodyMarkdownChange(e.target.value)}
        />
      </Field>
    </div>
  );
}
