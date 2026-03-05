"use client";

import { Info, Loader2, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type TextareaSectionProps = {
  label: string;
  description?: string;
  hint?: string;
  filled?: boolean;
  isAI?: boolean;
  isPopulating?: boolean;
  aiHasData?: boolean;
  aiDisabled?: boolean;
  onAiGenerate?: () => void;
  children: React.ReactNode;
};

export function TextareaSection({
  label,
  description,
  hint,
  filled,
  isAI,
  isPopulating,
  aiHasData,
  aiDisabled,
  onAiGenerate,
  children
}: TextareaSectionProps) {
  return (
    <div className={`textarea-section ${isPopulating ? "is-populating" : ""}`}>
      <div className="textarea-header">
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
                      disabled={isPopulating || aiHasData || aiDisabled}
                      onClick={() => onAiGenerate?.()}
                      className="ai-generate-btn"
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
        {description && <aside>{description}</aside>}
      </div>
      {isPopulating ? (
        <div className="textarea-body">
          <div className="pointer-events-none select-none opacity-0">{children}</div>
          <div className="absolute inset-0 flex flex-col gap-1.5 p-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ) : (
        <div className="textarea-body">{children}</div>
      )}
    </div>
  );
}
