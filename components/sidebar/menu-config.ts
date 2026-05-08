import {
  Activity,
  Award,
  BarChart3,
  Building2,
  Database,
  Download,
  GitBranch,
  Layers,
  ListOrdered,
  type LucideIcon,
  Settings,
  Table2,
  Users,
  Video,
  Zap
} from "lucide-react";

export type MenuLink = {
  kind: "link";
  href: string;
  label: string;
  icon: LucideIcon;
  matchPaths: string[];
};

export type MenuGroup = {
  kind: "group";
  label: string;
  icon: LucideIcon;
  items: Array<Omit<MenuLink, "kind">>;
};

export type MenuItem = MenuLink | MenuGroup;

export type MenuSection = {
  label?: string;
  items: MenuItem[];
};

export const SIDEBAR_MENU: MenuSection[] = [
  {
    items: [
      {
        kind: "link",
        href: "/workshops",
        label: "Workshops",
        icon: Video,
        matchPaths: ["/workshops"]
      },
      {
        kind: "group",
        label: "Analytics",
        icon: BarChart3,
        items: [
          {
            href: "/analytics/activity",
            label: "Activity",
            icon: Activity,
            matchPaths: ["/analytics/activity"]
          },
          {
            href: "/analytics/users",
            label: "Users",
            icon: Users,
            matchPaths: ["/analytics/users"]
          },
          {
            href: "/analytics/orgs",
            label: "Orgs",
            icon: Building2,
            matchPaths: ["/analytics/orgs"]
          },
          {
            href: "/analytics/conversion",
            label: "Conversion",
            icon: GitBranch,
            matchPaths: ["/analytics/conversion"]
          },
          {
            href: "/analytics/breakdowns",
            label: "Breakdowns",
            icon: Layers,
            matchPaths: ["/analytics/breakdowns"]
          },
          {
            href: "/analytics/events",
            label: "Events",
            icon: ListOrdered,
            matchPaths: ["/analytics/events"]
          }
        ]
      },
      {
        kind: "group",
        label: "Manage",
        icon: Settings,
        items: [
          {
            href: "/manage/organisations",
            label: "Orgs",
            icon: Building2,
            matchPaths: ["/manage/organisations"]
          },
          {
            href: "/manage/users",
            label: "Users",
            icon: Users,
            matchPaths: ["/manage/users"]
          }
        ]
      },
      {
        kind: "group",
        label: "Data",
        icon: Database,
        items: [
          {
            href: "/airtable",
            label: "Airtable",
            icon: Table2,
            matchPaths: ["/airtable"]
          },
          {
            href: "/downloads",
            label: "Downloads",
            icon: Download,
            matchPaths: ["/downloads"]
          },
          {
            href: "/data/facts",
            label: "Facts Engine",
            icon: Zap,
            matchPaths: ["/data", "/docs"]
          }
        ]
      }
    ]
  },
  {
    label: "Legacy",
    items: [
      {
        kind: "link",
        href: "/bcorps",
        label: "BCorps",
        icon: Award,
        matchPaths: ["/bcorps"]
      }
    ]
  }
];

export function isPathActive(pathname: string, matchPaths: string[]) {
  return matchPaths.some((path) => pathname.startsWith(path));
}
