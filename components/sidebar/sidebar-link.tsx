"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

type SidebarLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
};

export function SidebarLink({ href, label, icon: Icon, isActive }: SidebarLinkProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={href}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
