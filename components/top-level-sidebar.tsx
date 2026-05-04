"use client";

import { LogOut } from "lucide-react";
import { Fragment } from "react";
import { SIDEBAR_MENU } from "@/components/sidebar/menu-config";
import { SidebarMenuSection } from "@/components/sidebar/sidebar-menu-section";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator
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
        {SIDEBAR_MENU.map((section, index) => (
          <Fragment key={section.label ?? `section-${index}`}>
            {index > 0 && <SidebarSeparator className="mx-0 w-full" />}
            <SidebarMenuSection section={section} pathname={pathname} />
          </Fragment>
        ))}
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
