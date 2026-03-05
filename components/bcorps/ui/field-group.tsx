"use client";

import { Info, Loader2, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type FieldGroupProps = {
  label: string;
  description?: string;
  hint?: string;
  filled?: boolean;
  isAI?: boolean;
  isPopulating?: boolean;
  aiHasData?: boolean;
  onAiGenerate?: () => void;
  children: React.ReactNode;
};

export function FieldGroup({
  label,
  description,
  hint,
  filled,
  isAI,
  isPopulating,
  aiHasData,
  onAiGenerate,
  children
}: FieldGroupProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Label>{label}</Label>
        {hint && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info
                  className={`size-3.5 shrink-0 cursor-default ${filled ? "text-muted-foreground/50" : "text-amber-500"}`}
                />
              </TooltipTrigger>
              <TooltipContent className="max-w-60">{hint}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {isAI && (
          <div className="ml-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <button
                      type="button"
                      disabled={isPopulating || aiHasData}
                      onClick={() => onAiGenerate?.()}
                      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, #a855f7, #6366f1, #3b82f6)",
                        color: "white"
                      }}
                    >
                      {isPopulating ? <Loader2 className="size-2.5 animate-spin" /> : <Sparkles className="size-2.5" />}
                      AI Generate
                    </button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {aiHasData
                    ? "Already populated — edit to make changes"
                    : "Generate this field with AI from plan data"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {isAI ? (
        <div
          className={`rounded-[9px] p-px transition-all duration-500 ${
            isPopulating
              ? "shadow-[0_0_8px_2px_rgba(139,92,246,0.4)]"
              : "hover:shadow-[0_0_4px_1px_rgba(139,92,246,0.2)]"
          }`}
          style={{
            background: isPopulating
              ? "linear-gradient(135deg, #a855f7, #6366f1, #3b82f6, #a855f7)"
              : "linear-gradient(135deg, #a855f740, #6366f140, #3b82f640)"
          }}
        >
          {isPopulating ? (
            <div className="relative overflow-hidden rounded-[8px] bg-background [&_textarea]:rounded-[8px] [&_textarea]:border-0">
              <div className="pointer-events-none select-none opacity-0">{children}</div>
              <div className="absolute inset-0 flex flex-col gap-1.5 p-3">
                <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[8px] bg-background [&_textarea]:rounded-[8px] [&_textarea]:border-0">
              {children}
            </div>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
