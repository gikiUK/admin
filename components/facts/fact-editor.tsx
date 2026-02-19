"use client";

import { ArrowLeft, Eye, EyeOff, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { computeEnrichedFacts } from "@/lib/blob/derived";
import type { BlobFact, BlobRule, FactType } from "@/lib/blob/types";
import { useDataset } from "@/lib/blob/use-dataset";
import { assignCategory } from "@/lib/data/fact-categories";
import { FactSourcesCard } from "./fact-sources-card";
import { RuleEditor } from "./rule-editor";

function FieldLabel({ htmlFor, label, hint }: { htmlFor?: string; label: string; hint: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="size-3.5 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-72">
          {hint}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function HintLine({ term, desc }: { term: string; desc: string }) {
  return (
    <div>
      <span className="font-semibold">{term}:</span> {desc}
    </div>
  );
}

const FIELD_HINTS = {
  id: (
    <div className="space-y-1">
      <div>Unique snake_case identifier for this fact.</div>
      <div>Used in rules and conditions.</div>
    </div>
  ),
  type: (
    <div className="space-y-1">
      <HintLine term="boolean_state" desc="true or false" />
      <HintLine term="enum" desc="one single value from a list" />
      <HintLine term="array" desc="multiple values from a list" />
    </div>
  ),
  kind: (
    <div className="space-y-1">
      <HintLine term="Core" desc="set directly by a user question" />
      <HintLine term="Derived" desc="computed by rules from other facts" />
    </div>
  ),
  valuesRef: (
    <div className="space-y-1">
      <div>The list of allowed values for this fact.</div>
      <div>Only relevant for enum and array types.</div>
    </div>
  )
};

type FactEditorProps = {
  factId?: string;
  isNew?: boolean;
};

export function FactEditor({ factId, isNew }: FactEditorProps) {
  const router = useRouter();
  const { blob, dispatch } = useDataset();

  const fact = factId && blob ? blob.facts[factId] : undefined;
  const allFactIds = blob ? Object.keys(blob.facts) : [];

  // Local state only for the "new fact" form
  const [newId, setNewId] = useState("");
  const [newType, setNewType] = useState<FactType>("boolean_state");
  const [newCore, setNewCore] = useState(true);
  const [newValuesRef, setNewValuesRef] = useState("");

  // Compute enriched fact for sources card
  const enriched = (() => {
    if (!blob || !factId) return null;
    const categories = computeEnrichedFacts(blob);
    for (const cat of categories) {
      const found = cat.facts.find((f) => f.id === factId);
      if (found) return found;
    }
    return null;
  })();

  // Rules for this fact
  const factRules = (() => {
    if (!blob || !factId) return [];
    return blob.rules.map((r, i) => ({ rule: r, index: i })).filter(({ rule }) => rule.sets === factId);
  })();

  function handleFieldChange(field: keyof BlobFact, value: string | boolean) {
    if (!fact || !factId) return;
    const updated = { ...fact };
    if (field === "type") updated.type = value as FactType;
    else if (field === "core") updated.core = value as boolean;
    else if (field === "values_ref") updated.values_ref = (value as string) || undefined;
    dispatch({ type: "SET_FACT", id: factId, fact: updated });
  }

  function handleToggleEnabled() {
    if (!factId) return;
    dispatch({ type: fact?.enabled ? "DISCARD_FACT" : "RESTORE_FACT", id: factId });
  }

  function handleCreate() {
    const id = newId.trim();
    if (!id) return;
    dispatch({
      type: "ADD_FACT",
      id,
      fact: {
        type: newType,
        core: newCore,
        category: assignCategory(id),
        enabled: true,
        ...(newValuesRef ? { values_ref: newValuesRef } : {})
      }
    });
    router.push(`/data/facts/${id}`);
  }

  function handleRuleChange(globalIndex: number, rule: BlobRule) {
    dispatch({ type: "SET_RULE", index: globalIndex, rule });
  }

  function handleAddRule() {
    if (!factId) return;
    dispatch({
      type: "ADD_RULE",
      rule: { sets: factId, value: false, source: "general", when: { "": true }, enabled: true }
    });
  }

  function handleDiscardRule(globalIndex: number) {
    dispatch({ type: "DISCARD_RULE", index: globalIndex });
  }

  function handleRestoreRule(globalIndex: number) {
    dispatch({ type: "RESTORE_RULE", index: globalIndex });
  }

  const constantKeys = blob ? Object.keys(blob.constants).sort() : [];

  if (isNew) {
    return (
      <TooltipProvider>
        <div className="mx-auto max-w-3xl space-y-6">
          <Link
            href="/data/facts"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to Facts
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight">New Fact</h1>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">Properties</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <FieldLabel htmlFor="fact-id" label="ID" hint={FIELD_HINTS.id} />
                <Input
                  id="fact-id"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="e.g. has_company_vehicles"
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="fact-type" label="Type" hint={FIELD_HINTS.type} />
                <Select value={newType} onValueChange={(v) => setNewType(v as FactType)}>
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
                <FieldLabel label="Kind" hint={FIELD_HINTS.kind} />
                <RadioGroup
                  value={newCore ? "core" : "derived"}
                  onValueChange={(v) => setNewCore(v === "core")}
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

              {newType !== "boolean_state" && (
                <div className="space-y-2">
                  <FieldLabel htmlFor="values-ref" label="Values ref" hint={FIELD_HINTS.valuesRef} />
                  <Select
                    value={newValuesRef || "___none"}
                    onValueChange={(v) => setNewValuesRef(v === "___none" ? "" : v)}
                  >
                    <SelectTrigger id="values-ref" className="font-mono">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="___none">None</SelectItem>
                      {constantKeys.map((key) => (
                        <SelectItem key={key} value={key} className="font-mono">
                          {key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/data/facts">Cancel</Link>
            </Button>
            <Button onClick={handleCreate} disabled={!newId.trim()}>
              Create
            </Button>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  if (!fact || !factId) return null;

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/data/facts"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to Facts
          </Link>

          <Button variant={fact.enabled ? "outline" : "default"} size="sm" onClick={handleToggleEnabled}>
            {fact.enabled ? (
              <>
                <EyeOff className="size-3" /> Disable
              </>
            ) : (
              <>
                <Eye className="size-3" /> Enable
              </>
            )}
          </Button>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          {!fact.enabled && <span className="text-muted-foreground line-through">Edit: {factId}</span>}
          {!!fact.enabled && `Edit: ${factId}`}
        </h1>

        {/* Properties */}
        <Card className={!fact.enabled ? "opacity-50" : undefined}>
          <CardHeader>
            <h2 className="text-sm font-semibold">Properties</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <FieldLabel htmlFor="fact-id" label="ID" hint={FIELD_HINTS.id} />
              <Input id="fact-id" value={factId} className="font-mono" disabled />
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="fact-type" label="Type" hint={FIELD_HINTS.type} />
              <Select value={fact.type} onValueChange={(v) => handleFieldChange("type", v)}>
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
              <FieldLabel label="Kind" hint={FIELD_HINTS.kind} />
              <RadioGroup
                value={fact.core ? "core" : "derived"}
                onValueChange={(v) => handleFieldChange("core", v === "core")}
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

            {fact.type !== "boolean_state" && (
              <div className="space-y-2">
                <FieldLabel htmlFor="values-ref" label="Values ref" hint={FIELD_HINTS.valuesRef} />
                <Select
                  value={fact.values_ref || "___none"}
                  onValueChange={(v) => handleFieldChange("values_ref", v === "___none" ? "" : v)}
                >
                  <SelectTrigger id="values-ref" className="font-mono">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="___none">None</SelectItem>
                    {constantKeys.map((key) => (
                      <SelectItem key={key} value={key} className="font-mono">
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sources (read-only) */}
        {enriched && <FactSourcesCard relationships={enriched.relationships} />}

        {/* Rules */}
        <Card className={!fact.enabled ? "opacity-50" : undefined}>
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center justify-end">
              <Link href="/data/rules" className="text-xs text-muted-foreground hover:text-foreground">
                View all rules
              </Link>
            </div>
            <RuleEditor
              rules={factRules}
              factId={factId}
              factIds={allFactIds}
              onChange={handleRuleChange}
              onAdd={handleAddRule}
              onDiscard={handleDiscardRule}
              onRestore={handleRestoreRule}
            />
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
