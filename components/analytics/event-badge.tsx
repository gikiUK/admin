import { type EventDisplay, TONE_BADGE_CLASS } from "@/lib/analytics/event-display";
import { cn } from "@/lib/utils";

type EventBadgeProps = {
  display: EventDisplay;
  size?: "sm" | "md";
};

export function EventBadge({ display, size = "sm" }: EventBadgeProps) {
  const Icon = display.icon;
  const padding = size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        padding,
        TONE_BADGE_CLASS[display.tone]
      )}
    >
      <Icon className="size-3" />
      {display.label}
    </span>
  );
}
