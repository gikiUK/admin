import { AlertTriangle, MailOpen, MailX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EmailHealthProps = {
  health: { bounced: number; complained: number; opened_recently: number };
};

export function EmailHealth({ health }: EmailHealthProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Email health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Bounced" value={health.bounced} tone="destructive" icon={MailX} />
          <Stat label="Complaints" value={health.complained} tone="warning" icon={AlertTriangle} />
          <Stat label="Opened (30d)" value={health.opened_recently} tone="success" icon={MailOpen} />
        </div>
      </CardContent>
    </Card>
  );
}

type Tone = "destructive" | "warning" | "success";

const TONE_CLASSES: Record<Tone, string> = {
  destructive: "bg-destructive/10 text-destructive",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400"
};

function Stat({ label, value, tone, icon: Icon }: { label: string; value: number; tone: Tone; icon: typeof MailX }) {
  return (
    <div className="flex items-center gap-3 rounded-md border p-3">
      <div className={`flex size-9 items-center justify-center rounded-md ${TONE_CLASSES[tone]}`}>
        <Icon className="size-4" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold tabular-nums">{value}</div>
      </div>
    </div>
  );
}
