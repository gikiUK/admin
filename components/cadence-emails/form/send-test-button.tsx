"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendCadenceEmailTest } from "@/lib/cadence-emails/api";

/**
 * Sends the saved email to the logged-in admin. It records nothing, so it
 * neither counts as a send nor stops the real email arriving later.
 */
export function SendTestButton({ emailKey, disabled }: { emailKey: string; disabled?: boolean }) {
  const [sending, setSending] = useState(false);

  async function handleClick() {
    setSending(true);
    try {
      await sendCadenceEmailTest(emailKey);
      toast.success("Test sent to you.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send the test email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleClick} disabled={sending || disabled}>
      <Send className="size-3.5" />
      {sending ? "Sending…" : "Send test to me"}
    </Button>
  );
}
