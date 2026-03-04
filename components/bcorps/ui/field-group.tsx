import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type FieldGroupProps = {
  label: string;
  description?: string;
  hint?: string;
  filled?: boolean;
  children: React.ReactNode;
};

export function FieldGroup({ label, description, hint, filled, children }: FieldGroupProps) {
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
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}
