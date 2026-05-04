import { Award, BarChart3, Database, Download, type LucideIcon, Table2, Video, Zap } from "lucide-react";

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
            href: "/analytics",
            label: "Analytics",
            icon: BarChart3,
            matchPaths: ["/analytics"]
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
