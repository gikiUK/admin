"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ManagedCompany, resetOnboarding } from "@/lib/manage/api";

type OrgOnboardingPanelProps = {
  company: ManagedCompany;
  onUpdate: (company: ManagedCompany) => void;
};

export function OrgOnboardingPanel({ company, onUpdate }: OrgOnboardingPanelProps) {
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    setResetting(true);
    try {
      const result = await resetOnboarding(company.slug);
      onUpdate(result.company);
      toast.success("Onboarding reset");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset onboarding");
    } finally {
      setResetting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboarding</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Wipes all answered questions and reopens the onboarding flow for this organisation.
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" disabled={resetting}>
                <RotateCcw />
                {resetting ? "Resetting…" : "Reset onboarding"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset onboarding for {company.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This deletes every answered onboarding question and resets the completion flags. The next time someone
                  from this organisation signs in, they will be asked the questions again. Their tracked actions,
                  members, and settings stay intact.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleReset}>
                  Reset onboarding
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
