import { Badge } from "@/components/ui/badge";

export function EnabledBadge({ enabled }: { enabled: boolean }) {
  return <Badge variant={enabled ? "default" : "secondary"}>{enabled ? "Enabled" : "Skipped"}</Badge>;
}
