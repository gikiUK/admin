"use client";

import { LogOut } from "lucide-react";
import { isPathActive, SIDEBAR_MENU } from "@/components/sidebar/menu-config";
import { SidebarCollapsibleGroup } from "@/components/sidebar/sidebar-collapsible-group";
import { SidebarLink } from "@/components/sidebar/sidebar-link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";

interface TopLevelSidebarProps {
  pathname: string;
  logout: () => void;
}

export function TopLevelSidebar({ pathname, logout }: TopLevelSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="text-lg font-semibold">Giki Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {SIDEBAR_MENU.map((item) => {
            if (item.kind === "link") {
              return (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isPathActive(pathname, item.matchPaths)}
                />
              );
            }
            return (
              <SidebarCollapsibleGroup
                key={item.label}
                label={item.label}
                icon={item.icon}
                items={item.items.map((sub) => ({
                  href: sub.href,
                  label: sub.label,
                  icon: sub.icon,
                  isActive: isPathActive(pathname, sub.matchPaths)
                }))}
              />
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout}>
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
