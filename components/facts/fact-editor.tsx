"use client";

import { ArrowLeft, Trash2, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EnrichedFact, FactType, Question, Rule } from "@/lib/data/types";
import { RuleEditor } from "./rule-editor";

type FactEditorProps = {
  fact?: EnrichedFact;
  rules: Rule[];
  question?: Question | null;
  allFactIds: string[];
  isNew?: boolean;
};

export function FactEditor({ fact, rules: initialRules, question, allFactIds, isNew }: FactEditorProps) {
  const router = useRouter();

  const [id, setId] = useState(fact?.id ?? "");
  const [type, setType] = useState<FactType>(fact?.type ?? "boolean_state");
  const [core, setCore] = useState(fact?.core ?? true);
  const [valuesRef, setValuesRef] = useState(fact?.valuesRef ?? "");
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [saving, setSaving] = useState(false);

  // TODO: Wire up to Rails backend
  function handleSave() {
    setSaving(true);
    const _payload = {
      id,
      type,
      core,
      valuesRef: valuesRef || undefined,
      rules: rules.map((r) => ({ ...r, sets: id }))
    };
    // POST/PATCH to Rails API
    console.log(isNew ? "CREATE" : "UPDATE", _payload);
    setSaving(false);
  }

  // TODO: Wire up to Rails backend
  function handleDelete() {
    console.log("DELETE", fact?.id);
    router.push("/data/facts");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/data/facts"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to Facts
        </Link>

        {!isNew && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="size-3" /> Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete fact</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete <span className="font-mono font-semibold">{fact?.id}</span>? This will
                  also remove all associated rules.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">{isNew ? "New Fact" : `Edit: ${fact?.id}`}</h1>

      {/* Properties */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Properties</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fact-id">ID</Label>
            <Input
              id="fact-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. has_company_vehicles"
              className="font-mono"
              disabled={!isNew}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fact-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as FactType)}>
              <SelectTrigger id="fact-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boolean_state">boolean_state</SelectItem>
                <SelectItem value="enum">enum</SelectItem>
                <SelectItem value="array">array</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kind</Label>
            <RadioGroup
              value={core ? "core" : "derived"}
              onValueChange={(v) => setCore(v === "core")}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="core" id="kind-core" />
                <Label htmlFor="kind-core" className="font-normal">
                  Core
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="derived" id="kind-derived" />
                <Label htmlFor="kind-derived" className="font-normal">
                  Derived
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="values-ref">Values ref</Label>
            <Input
              id="values-ref"
              value={valuesRef}
              onChange={(e) => setValuesRef(e.target.value)}
              placeholder="e.g. industries"
              className="font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* Question info (read-only) */}
      {question && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">Set by Question</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <Badge variant="outline" className="mr-2">
                Q{question.index + 1}
              </Badge>
              &ldquo;{question.label}&rdquo;
            </p>
            {question.description && <p className="mt-1 text-xs text-muted-foreground">{question.description}</p>}
          </CardContent>
        </Card>
      )}

      {/* Rules */}
      <Card>
        <CardContent className="pt-6">
          <RuleEditor rules={rules} factId={id} factIds={allFactIds} onChange={setRules} />
        </CardContent>
      </Card>

      {/* Action count (read-only) */}
      {!isNew && fact && fact.relationships.actionCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="size-4 text-purple-500" />
          Referenced by {fact.relationships.actionCount} action
          {fact.relationships.actionCount !== 1 ? "s" : ""} (read-only)
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/data/facts">Cancel</Link>
        </Button>
        <Button onClick={handleSave} disabled={!id.trim() || saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
