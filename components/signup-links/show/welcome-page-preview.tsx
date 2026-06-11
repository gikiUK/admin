"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <h2>{title}</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
