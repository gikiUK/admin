"use client";

import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useBcorpHeader } from "@/lib/bcorp/bcorp-header-context";

export function BcorpHeader({ orgId }: { orgId: string }) {
  const { saveState, saveError, saveRef, populateState, populateError, populateRef, isDirty } = useBcorpHeader();
  const name = useSearchParams().get("name") ?? orgId;
  const busy = saveState === "saving" || populateState === "populating";

  return (
    <>
      <Separator orientation="vertical" className="!h-4" />
      <Button variant="ghost" size="icon" asChild className="-ml-1 size-7">
        <Link href="/bcorps">
          <ArrowLeft className="size-4" />
        </Link>
      </Button>
      <span className="text-sm font-medium">{name}</span>
      <div className="ml-auto flex items-center gap-3">
        {saveState === "saved" && <span className="text-sm text-green-600">Saved</span>}
        {saveState === "error" && <span className="text-sm text-destructive">{saveError}</span>}
        {populateState === "error" && <span className="text-sm text-destructive">{populateError}</span>}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => populateRef.current?.()}>
                <Sparkles className="size-3.5" />
                {populateState === "populating" ? "Populating..." : "Populate"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Use AI to populate fields from plan data</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button size="sm" disabled={busy} onClick={() => saveRef.current?.()} className="relative">
          {saveState === "saving" ? "Saving..." : "Save"}
          {isDirty && saveState !== "saving" && (
            <span className="absolute -top-1 -right-1 size-2 rounded-full bg-amber-400" />
          )}
        </Button>
      </div>
    </>
  );
}
