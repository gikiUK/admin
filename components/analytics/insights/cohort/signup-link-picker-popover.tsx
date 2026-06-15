"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { SignupLink } from "@/lib/signup-links/types";
import { cn } from "@/lib/utils";

type Props = {
  links: SignupLink[] | null;
  totalCount: number | null;
  selectedUuids: string[];
  triggerLabel: string;
  onToggle: (uuid: string) => void;
};

export function SignupLinkPickerPopover({ links, totalCount, selectedUuids, triggerLabel, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const truncated = totalCount !== null && links !== null && totalCount > links.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <ChevronsUpDown className="size-3" />
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start" portal={false}>
        <Command>
          <CommandInput placeholder="Search signup links…" />
          <CommandList>
            {links === null ? (
              <CommandEmpty>Loading…</CommandEmpty>
            ) : links.length === 0 ? (
              <CommandEmpty>No signup links yet.</CommandEmpty>
            ) : (
              <CommandGroup>
                {links.map((link) => {
                  const isSelected = selectedUuids.includes(link.uuid);
                  return (
                    <CommandItem
                      key={link.uuid}
                      value={`${link.title} ${link.code}`}
                      onSelect={() => onToggle(link.uuid)}
                      className="flex items-center gap-2"
                    >
                      <Check className={cn("size-4", isSelected ? "opacity-100" : "opacity-0")} />
                      <span className="truncate">{link.title}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
          {truncated && (
            <div className="border-t px-2 py-1.5 text-[11px] text-muted-foreground">
              Showing {links?.length} of {totalCount} signup links (most recent first).
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
