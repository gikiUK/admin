"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar";

export type SidebarCollapsibleItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
};

type SidebarCollapsibleGroupProps = {
  label: string;
  icon: LucideIcon;
  items: SidebarCollapsibleItem[];
  defaultOpen?: boolean;
};

export function SidebarCollapsibleGroup({ label, icon: Icon, items, defaultOpen }: SidebarCollapsibleGroupProps) {
  const hasActive = items.some((item) => item.isActive);
  return (
    <Collapsible asChild defaultOpen={defaultOpen ?? hasActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={hasActive}>
            <Icon />
            <span>{label}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map(({ href, label: itemLabel, icon: ItemIcon, isActive }) => (
              <SidebarMenuSubItem key={href}>
                <SidebarMenuSubButton asChild isActive={isActive}>
                  <Link href={href}>
                    <ItemIcon />
                    <span>{itemLabel}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
