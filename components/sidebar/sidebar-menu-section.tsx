"use client";

import { isPathActive, type MenuSection } from "@/components/sidebar/menu-config";
import { SidebarCollapsibleGroup } from "@/components/sidebar/sidebar-collapsible-group";
import { SidebarLink } from "@/components/sidebar/sidebar-link";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar";

type SidebarMenuSectionProps = {
  section: MenuSection;
  pathname: string;
};

export function SidebarMenuSection({ section, pathname }: SidebarMenuSectionProps) {
  return (
    <SidebarGroup>
      {section.label && <SidebarGroupLabel>{section.label}</SidebarGroupLabel>}
      <SidebarGroupContent className="min-w-0">
        <SidebarMenu>
          {section.items.map((item) => {
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
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
