import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  heightClass: string;
};

export function ChartPlaceholder({ icon: Icon, title, description, heightClass }: Props) {
  return (
    <div className={`flex ${heightClass} flex-col items-center justify-center gap-2 text-center`}>
      <Icon className="size-8 text-muted-foreground/60" aria-hidden />
      <div className="text-sm font-medium text-foreground">{title}</div>
      <div className="max-w-xs text-xs text-muted-foreground">{description}</div>
    </div>
  );
}
