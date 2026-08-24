"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownPreview } from "../markdown-preview";

type Props = {
  title: string;
  body: string;
  imageUrl: string | null;
};

export function WelcomePagePreview({ title, body, imageUrl }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Welcome page</CardTitle>
      </CardHeader>
      <CardContent>
        <h2 className="mb-3 text-2xl font-semibold tracking-tight">{title}</h2>
        {imageUrl && (
          // biome-ignore lint/performance/noImgElement: image is served from the API host, not the Next image loader
          <img src={imageUrl} alt={title} className="mb-3 max-h-64 w-auto rounded-md border object-contain" />
        )}
        <MarkdownPreview body={body} />
      </CardContent>
    </Card>
  );
}
