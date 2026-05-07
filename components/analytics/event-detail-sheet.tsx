"use client";

import { ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { EventResource } from "@/components/analytics/event-resource";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { AnalyticsEvent } from "@/lib/analytics/api";
import { formatRelative, getEventDisplay, summarizeEvent, TONE_ICON_CLASS } from "@/lib/analytics/event-display";

type EventDetailSheetProps = {
  event: AnalyticsEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EventDetailSheet({ event, open, onOpenChange }: EventDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        {event ? <EventDetailContent event={event} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function EventDetailContent({ event }: { event: AnalyticsEvent }) {
  const display = getEventDisplay(event.action_type);
  const Icon = display.icon;
  const sentence = summarizeEvent(event);
  const absolute = new Date(event.created_at).toLocaleString();
  const relative = formatRelative(event.created_at);
  const hasDetails = Object.keys(event.details ?? {}).length > 0;

  return (
    <div className="flex flex-col gap-5">
      <SheetHeader className="px-4 pt-4 pb-0">
        <div className="flex items-center gap-2">
          <Icon className={`size-4 ${TONE_ICON_CLASS[display.tone]}`} />
          <SheetTitle>{display.label}</SheetTitle>
        </div>
        <SheetDescription>
          <span title={absolute}>{relative}</span> · {absolute}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-5 px-4 pb-6">
        <p className="text-sm leading-relaxed">{sentence}</p>

        <ActorsBlock event={event} />

        <EventResource event={event} />

        {hasDetails ? (
          <Collapsible className="group/raw">
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ChevronDown className="size-3 transition-transform group-data-[state=open]/raw:rotate-180" />
              <span>Raw payload</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="mt-2 max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(event.details, null, 2)}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        ) : null}
      </div>
    </div>
  );
}

function ActorsBlock({ event }: { event: AnalyticsEvent }) {
  const rows: Array<{ label: string; node: React.ReactNode } | null> = [
    event.acting_user
      ? {
          label: "Acting user",
          node: <UserLink id={event.acting_user.id} name={event.acting_user.name} />
        }
      : null,
    event.about_user && event.about_user.id !== event.acting_user?.id
      ? {
          label: "Subject user",
          node: <UserLink id={event.about_user.id} name={event.about_user.name} />
        }
      : null,
    event.about_company
      ? {
          label: "Org",
          node: <CompanyChip id={event.about_company.id} name={event.about_company.name} />
        }
      : null
  ];

  const items = rows.filter((row): row is { label: string; node: React.ReactNode } => row !== null);
  if (items.length === 0) return null;

  return (
    <section className="rounded-lg border bg-card p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actors</h3>
      <dl className="mt-3 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
        {items.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground self-center">{row.label}</dt>
            <dd>{row.node}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function UserLink({ id, name }: { id: number; name: string }) {
  return (
    <Link
      href={`/manage/users/${id}`}
      className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-sm hover:bg-muted"
    >
      <span>{name}</span>
      <ExternalLink className="size-3 text-muted-foreground" />
    </Link>
  );
}

function CompanyChip({ id, name }: { id: number; name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-sm">
      <span>{name}</span>
      <span className="text-xs text-muted-foreground">#{id}</span>
    </span>
  );
}
