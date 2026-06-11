"use client";

import { Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { getFrontendUrl } from "@/lib/api/config";

type Props = {
  code: string;
};

export function CopyLinkRow({ code }: Props) {
  const url = getFrontendUrl(`/auth/signup/${code}`);

  function copy() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    } else {
      const el = document.createElement("textarea");
      el.value = url;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    toast.success("Signup URL copied to clipboard.");
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 transition-colors hover:bg-muted"
    >
      <span className="font-mono text-xs text-muted-foreground">{url}</span>
      <span className="flex shrink-0 items-center gap-1 text-xs font-medium">
        <LinkIcon className="size-3" />
        Copy
      </span>
    </button>
  );
}
