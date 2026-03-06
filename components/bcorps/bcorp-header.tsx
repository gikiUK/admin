"use client";

import { AlertCircle, ArrowLeft, Check, FileText, Loader2, PenLine, Save, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getApiUrl } from "@/lib/api/config";
import { useBcorpHeader } from "@/lib/bcorp/bcorp-header-context";

export function PillTab({
  value,
  active,
  onClick,
  children
}: {
  value: string;
  active: string;
  onClick: (v: string) => void;
  children: React.ReactNode;
}) {
  const isActive = active === value;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`px-3 py-1 h-7 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isActive ? "bg-foreground/15 text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function BcorpHeader({ orgId }: { orgId: string }) {
  const { saveState, saveRef, populateState, populateError, populateRef, isDirty, allAiFilled } = useBcorpHeader();
  const name = useSearchParams().get("name") ?? orgId;
  const busy = saveState === "saving" || populateState === "populating";
  const populateDisabled = busy || allAiFilled;
  const [pdfState, setPdfState] = useState<"idle" | "generating" | "error">("idle");
  const [confirmBack, setConfirmBack] = useState(false);
  const popstateDeltaRef = useRef<number>(0);
  const router = useRouter();

  useEffect(() => {
    if (!isDirty) return;
    function handlePopState() {
      history.pushState(null, "", window.location.href);
      popstateDeltaRef.current = -1;
      setConfirmBack(true);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDirty]);

  async function handleGeneratePdf() {
    setPdfState("generating");
    try {
      if (isDirty) {
        await saveRef.current?.();
      }
      const jwtRes = await fetch(getApiUrl("/internal/jwt_token"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valid_endpoints: "admin/legacy/*" })
      });
      if (!jwtRes.ok) throw new Error("Failed to get JWT token");
      const { token: jwt } = await jwtRes.json();

      const res = await fetch("/api/bcorp/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, jwt })
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bcorp-report-${orgId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setPdfState("idle");
    } catch {
      setPdfState("error");
    }
  }

  function handleBack() {
    if (isDirty) {
      popstateDeltaRef.current = 0;
      setConfirmBack(true);
    } else {
      router.push("/bcorps");
    }
  }

  function handleLeave() {
    if (popstateDeltaRef.current !== 0) {
      history.go(popstateDeltaRef.current);
    } else {
      router.push("/bcorps");
    }
    popstateDeltaRef.current = 0;
  }

  return (
    <>
      <AlertDialog open={confirmBack} onOpenChange={setConfirmBack}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost if you leave. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleLeave}>
              Leave without saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Separator orientation="vertical" className="!h-4" />
      <Button variant="ghost" size="icon" className="-ml-1 size-7" onClick={handleBack}>
        <ArrowLeft className="size-4" />
      </Button>
      <span className="text-sm font-medium">{name}</span>
      <div className="ml-auto flex items-center gap-3">
        {populateState === "error" && <span className="text-sm text-destructive">{populateError}</span>}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={populateDisabled}
                  onClick={() => populateRef.current?.()}
                  className="!h-[32px] text-[17px] rounded-[5px] shadow-[0_0_5px_rgba(0,0,0,0.2)] transition-all duration-200"
                >
                  {populateState === "populating" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  {populateState === "populating" ? "Populating..." : "Populate"}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {allAiFilled
                ? "All AI fields populated - edit to make changes"
                : "Use AI to populate fields from plan data"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={busy || pdfState === "generating"}
                onClick={handleGeneratePdf}
                className="!h-[32px] text-[17px] rounded-[5px] shadow-[0_0_5px_rgba(0,0,0,0.2)]"
              >
                <FileText className="size-3.5" />
                {pdfState === "generating" ? "Generating..." : "PDF Report"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{pdfState === "error" ? "Failed - try again" : "Generate PDF report"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                disabled={busy}
                onClick={() => saveRef.current?.()}
                className={`!h-[32px] text-[17px] rounded-[5px] shadow-[0_0_5px_rgba(0,0,0,0.2)] transition-colors duration-300 ${
                  saveState === "saved"
                    ? "bg-green-600 hover:bg-green-700 text-white border-transparent"
                    : saveState === "error"
                      ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground border-transparent"
                      : isDirty
                        ? "bg-amber-500 hover:bg-amber-600 text-white border-transparent"
                        : ""
                }`}
              >
                <span className="relative size-3.5 flex items-center justify-center">
                  <Save
                    className={`absolute size-3.5 transition-all duration-300 ${saveState === "idle" && !isDirty ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                  />
                  <Loader2
                    className={`absolute size-3.5 transition-all duration-300 ${saveState === "saving" ? "opacity-100 animate-spin" : "opacity-0"}`}
                  />
                  <Check
                    className={`absolute size-3.5 transition-all duration-300 ${saveState === "saved" ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                  />
                  <AlertCircle
                    className={`absolute size-3.5 transition-all duration-300 ${saveState === "error" ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                  />
                  <PenLine
                    className={`absolute size-3.5 transition-all duration-300 ${isDirty && saveState === "idle" ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                  />
                </span>
                Save
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {saveState === "error" ? "Save failed - try again" : isDirty ? "Unsaved changes" : "Save"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
}
