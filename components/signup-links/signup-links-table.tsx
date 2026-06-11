"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SignupLink } from "@/lib/signup-links/types";
import { formatShortDate, formatShortDateTime, formatUses } from "./format";
import { SignupLinkStatusBadge } from "./status-badge";

type Props = {
  links: SignupLink[];
  onDelete: (link: SignupLink) => void;
};

export function SignupLinksTable({ links, onDelete }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uses</TableHead>
            <TableHead>Expires on</TableHead>
            <TableHead>Created at</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No signup links yet.
              </TableCell>
            </TableRow>
          ) : (
            links.map((link) => (
              <TableRow key={link.uuid}>
                <TableCell className="font-medium">
                  <Link href={`/signup-links/${link.uuid}`} className="hover:underline">
                    {link.title}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs">{link.code}</TableCell>
                <TableCell>
                  <SignupLinkStatusBadge link={link} />
                </TableCell>
                <TableCell>{formatUses(link.uses_count, link.max_uses)}</TableCell>
                <TableCell>{formatShortDate(link.expires_on)}</TableCell>
                <TableCell>{formatShortDateTime(link.created_at ?? null)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" className="size-7" aria-label="View">
                      <Link href={`/signup-links/${link.uuid}`}>
                        <Eye className="size-3.5" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="size-7" aria-label="Edit">
                      <Link href={`/signup-links/${link.uuid}/edit`}>
                        <Pencil className="size-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(link)}
                      aria-label="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
