"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  title: ReactNode;
  description?: ReactNode;
  headerAction?: ReactNode;
  empty?: ReactNode;
  children?: ReactNode;
};

export function SectionCard({ title, description, headerAction, empty, children }: Props) {
  return (
    <Card>
      <CardHeader className={headerAction ? "flex flex-row items-start justify-between gap-3" : undefined}>
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {headerAction}
      </CardHeader>
      <CardContent>{empty ? <div className="text-sm text-muted-foreground">{empty}</div> : children}</CardContent>
    </Card>
  );
}
