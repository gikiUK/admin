"use client";

import { useState } from "react";
import { UploadDialog } from "@/components/downloads/upload-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type Downloadable, downloadableFileUrl } from "@/lib/downloads/api";

type DownloadablesTableProps = {
  downloadables: Downloadable[];
  onChange: () => void;
};

export function DownloadablesTable({ downloadables, onChange }: DownloadablesTableProps) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const active = downloadables.find((d) => d.key === uploadingKey) ?? null;

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead>File</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {downloadables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No downloadables found.
                </TableCell>
              </TableRow>
            ) : (
              downloadables.map((downloadable) => (
                <TableRow key={downloadable.key}>
                  <TableCell>
                    <div className="font-medium">{downloadable.title}</div>
                    {downloadable.description && (
                      <div className="text-xs text-muted-foreground line-clamp-2">{downloadable.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={downloadable.enabled ? "default" : "outline"}>
                      {downloadable.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {downloadable.has_file ? (
                      <a
                        className="text-sm text-primary underline"
                        href={downloadableFileUrl(downloadable.key)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">No file</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setUploadingKey(downloadable.key)}>
                      {downloadable.has_file ? "Replace" : "Upload"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {active && (
        <UploadDialog
          downloadable={active}
          open={uploadingKey !== null}
          onOpenChange={(open) => {
            if (!open) setUploadingKey(null);
          }}
          onUploaded={onChange}
        />
      )}
    </>
  );
}
