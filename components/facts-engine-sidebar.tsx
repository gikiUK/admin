"use client";

import {
  BookOpen,
  Braces,
  ChevronLeft,
  ChevronRight,
  Database,
  FileQuestion,
  GitBranch,
  ListChecks,
  LogOut,
  Scale,
  SearchCheck,
  Zap
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";

const dataItems = [
  { title: "Facts", href: "/data/facts", icon: Database },
  { title: "Questions", href: "/data/questions", icon: FileQuestion },
  { title: "Rules", href: "/data/rules", icon: Scale },
  { title: "Constants", href: "/data/constants", icon: ListChecks },
  { title: "Actions", href: "/data/actions", icon: Zap },
  { title: "Raw JSON", href: "/data/raw", icon: Braces },
  { title: "Analysis", href: "/data/analysis", icon: SearchCheck }
];

const docsItems = [
  { title: "How It Works", href: "/docs/how-it-works", icon: GitBranch },
  { title: "Facts", href: "/docs/facts", icon: Database },
  { title: "Questions", href: "/docs/questions", icon: FileQuestion },
  { title: "Rules", href: "/docs/rules", icon: Scale },
  { title: "Constants", href: "/docs/constants", icon: ListChecks },
  { title: "Conditions", href: "/docs/conditions", icon: Braces },
  { title: "Analysis", href: "/docs/analysis", icon: SearchCheck }
];

interface FactsEngineSidebarProps {
  pathname: string;
  logout: () => void;
}

export function FactsEngineSidebar({ pathname, logout }: FactsEngineSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <ChevronLeft />
                <span>Back</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center gap-2 px-2 py-1">
          <Zap className="size-4" />
          <span className="text-lg font-semibold">Facts Engine</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center">
                Data
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {dataItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
        <SidebarGroup>
          <Collapsible defaultOpen={pathname.startsWith("/docs")} className="group/docs">
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center">
                <BookOpen className="mr-2 size-4" />
                Docs
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/docs:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {docsItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
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
