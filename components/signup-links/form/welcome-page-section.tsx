"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownPreview } from "../markdown-preview";

type Props = {
  enabled: boolean;
  title: string;
  body: string;
  onEnabledChange: (next: boolean) => void;
  onTitleChange: (next: string) => void;
  onBodyChange: (next: string) => void;
};

export function WelcomePageSection({ enabled, title, body, onEnabledChange, onTitleChange, onBodyChange }: Props) {
  return (
    <section className="space-y-4 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Welcome page</h3>
          <p className="text-xs text-muted-foreground">
            Shown to users before they complete signup. Title and body must both be set.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} aria-label="Enable welcome page" />
      </div>
      {enabled && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="welcome_page_title">Title</Label>
            <Input
              id="welcome_page_title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Welcome to Giki!"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="welcome_page_body">Body (markdown)</Label>
            <Tabs defaultValue="write">
              <TabsList>
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write">
                <Textarea
                  id="welcome_page_body"
                  value={body}
                  onChange={(e) => onBodyChange(e.target.value)}
                  rows={10}
                  placeholder="Markdown is supported. Use tables, lists, links, etc."
                />
              </TabsContent>
              <TabsContent value="preview">
                <div className="min-h-40 rounded-md border bg-muted/40 p-4">
                  {body.trim() ? (
                    <MarkdownPreview body={body} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </section>
  );
}
