"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownPreview } from "../markdown-preview";

type Props = {
  title: string;
  body: string;
};

export function WelcomePagePreview({ title, body }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Welcome page</CardTitle>
      </CardHeader>
      <CardContent>
        <h2 className="mb-3 text-2xl font-semibold tracking-tight">{title}</h2>
        <MarkdownPreview body={body} />
      </CardContent>
    </Card>
  );
}
