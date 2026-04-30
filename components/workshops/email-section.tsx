"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  title: string;
  description: string;
  initialBody: string;
  sendLabel: string;
  onSave: (body: string) => Promise<void>;
  onSend: () => Promise<void>;
};

export function EmailSection({ title, description, initialBody, sendLabel, onSave, onSend }: Props) {
  const [body, setBody] = useState(initialBody);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [sending, setSending] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveState("saving");
      try {
        await onSaveRef.current(body);
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } catch {
        setSaveState("idle");
      }
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [body]);

  async function handleSend() {
    setSending(true);
    try {
      await onSend();
      toast.success(`${sendLabel} sent.`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Send failed.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <Textarea
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your email here. Use {title}, {datetime}, {streaming_url} as placeholders."
        />
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
        </span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={sending || saveState === "saving"}>{sending ? "Sending…" : sendLabel}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{sendLabel}</AlertDialogTitle>
              <AlertDialogDescription>
                This will send emails to all recipients immediately. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSend}>Send</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
