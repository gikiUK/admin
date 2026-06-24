"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

type Props = {
  url: string;
  title: string;
};

export function CopyActionUrlButton({ url, title }: Props) {
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
    toast.success("Action URL copied to clipboard.");
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-sm text-primary hover:underline"
      aria-label={`Copy URL for ${title}`}
    >
      Copy
      <Copy className="size-3.5" />
    </button>
  );
}
