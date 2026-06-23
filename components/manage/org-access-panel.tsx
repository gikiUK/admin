"use client";

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ManagedCompany, ungiftPremium, updateCompany } from "@/lib/manage/api";

type OrgAccessPanelProps = {
  company: ManagedCompany;
  onUpdate: (company: ManagedCompany) => void;
};

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function fromDateInputValue(value: string): string | null {
  if (!value) return null;
  return new Date(`${value}T23:59:59Z`).toISOString();
}

export function OrgAccessPanel({ company, onUpdate }: OrgAccessPanelProps) {
  const [premiumDate, setPremiumDate] = useState(toDateInputValue(company.gifted_premium_until));
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    setPremiumDate(toDateInputValue(company.gifted_premium_until));
  }, [company.gifted_premium_until]);

  const premiumDirty = premiumDate !== toDateInputValue(company.gifted_premium_until);

  async function run<T>(action: string, fn: () => Promise<T>, successMessage: string): Promise<T | null> {
    setPendingAction(action);
    try {
      const result = await fn();
      toast.success(successMessage);
      return result;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed: ${action}`);
      return null;
    } finally {
      setPendingAction(null);
    }
  }

  async function handleSavePremium() {
    const result = await run(
      "save-premium",
      () => updateCompany(company.slug, { gifted_premium_until: fromDateInputValue(premiumDate) }),
      "Gifted premium updated"
    );
    if (result) onUpdate(result.company);
  }

  async function handleUngiftPremium() {
    const result = await run("ungift", () => ungiftPremium(company.slug), "Gifted premium revoked");
    if (result) {
      onUpdate(result.company);
      setPremiumDate("");
    }
  }

  const busy = pendingAction !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor={`premium-${company.id}`}>Gifted premium until</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id={`premium-${company.id}`}
              type="date"
              value={premiumDate}
              onChange={(e) => setPremiumDate(e.target.value)}
              disabled={busy}
              className="w-auto"
            />
            <Button size="sm" onClick={handleSavePremium} disabled={busy || !premiumDirty}>
              {pendingAction === "save-premium" ? "Saving…" : "Save"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy || !company.gifted_premium_until}
                  className="text-destructive hover:text-destructive"
                >
                  Revoke
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Revoke gifted premium?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes premium access from <strong>{company.name}</strong> immediately.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={handleUngiftPremium}>
                    Revoke premium
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <p className="text-xs text-muted-foreground">
            {company.gifted_premium_until ? "Currently gifted premium." : "No gift."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
