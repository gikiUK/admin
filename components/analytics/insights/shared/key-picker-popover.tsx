"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  triggerLabel: string;
  inputPlaceholder: string;
  emptyLabel: ReactNode;
  /** Render the list of selectable items. The `close` callback should be called after onSelect. */
  children: (close: () => void) => ReactNode;
  /** PopoverContent width class, e.g. "w-[340px]" or "w-[280px]". */
  contentWidthClassName?: string;
  align?: "start" | "end";
};

export function KeyPickerPopover({
  triggerLabel,
  inputPlaceholder,
  emptyLabel,
  children,
  contentWidthClassName = "w-[340px]",
  align = "end"
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="size-3" />
          {triggerLabel}
          <ChevronsUpDown className="size-3 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`${contentWidthClassName} p-0`} align={align}>
        <Command>
          <CommandInput placeholder={inputPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>{children(() => setOpen(false))}</CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
