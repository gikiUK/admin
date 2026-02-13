"use client";

import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CheckboxRadioOption, Condition, Question, QuestionType } from "@/lib/data/types";
import { QuestionConditionsSection } from "./question-conditions-section";
import { QuestionTypeFields } from "./question-type-fields";

type FactsMap = Record<string, Record<string, string | boolean>>;

type QuestionEditorProps = {
  question?: Question;
  allFactIds: string[];
  constantGroupNames: string[];
  isNew?: boolean;
  onSave: (payload: Partial<Omit<Question, "index">>) => Promise<void>;
  onDelete?: () => Promise<void>;
};

const QUESTION_TYPES: QuestionType[] = ["boolean_state", "single-select", "multi-select", "checkbox-radio-hybrid"];

export function QuestionEditor({
  question,
  allFactIds,
  constantGroupNames,
  isNew,
  onSave,
  onDelete
}: QuestionEditorProps) {
  const router = useRouter();

  const [label, setLabel] = useState(question?.label ?? "");
  const [description, setDescription] = useState(question?.description ?? "");
  const [type, setType] = useState<QuestionType>(question?.type ?? "boolean_state");
  const [fact, setFact] = useState(question?.fact ?? "");
  const [optionsRef, setOptionsRef] = useState(question?.optionsRef ?? "");
  const [options, setOptions] = useState<CheckboxRadioOption[]>(question?.options ?? []);
  const [factsMapping, setFactsMapping] = useState<FactsMap>(question?.facts ?? {});
  const [showWhen, setShowWhen] = useState<Condition | undefined>(question?.showWhen);
  const [hideWhen, setHideWhen] = useState<Condition | undefined>(question?.hideWhen);
  const [unknowable, setUnknowable] = useState(question?.unknowable ?? false);
  const [saving, setSaving] = useState(false);

  function handleTypeChange(newType: QuestionType) {
    setType(newType);
    if (newType === "boolean_state") {
      setOptionsRef("");
      setOptions([]);
      setFactsMapping({});
    } else if (newType === "single-select" || newType === "multi-select") {
      setOptions([]);
      setFactsMapping({});
    } else {
      setFact("");
      setOptionsRef("");
    }
  }

  async function handleSave() {
    setSaving(true);
    const payload: Partial<Omit<Question, "index">> = { label, type, description: description || undefined };

    if (type === "boolean_state") {
      payload.fact = fact || undefined;
    } else if (type === "single-select" || type === "multi-select") {
      payload.fact = fact || undefined;
      payload.optionsRef = optionsRef || undefined;
    } else {
      payload.options = options;
      payload.facts = factsMapping;
    }

    payload.showWhen = showWhen;
    payload.hideWhen = hideWhen;
    payload.unknowable = unknowable || undefined;

    await onSave(payload);
    setSaving(false);
    router.push("/data/questions");
  }

  async function handleDelete() {
    await onDelete?.();
    router.push("/data/questions");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/data/questions"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to Questions
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
                <DialogTitle>Delete question</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete <span className="font-semibold">Q{(question?.index ?? 0) + 1}</span>?
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

      <h1 className="text-2xl font-semibold tracking-tight">
        {isNew ? "New Question" : `Edit: Q${(question?.index ?? 0) + 1}`}
      </h1>

      {/* Properties */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Properties</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="q-label">Label</Label>
            <Input id="q-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Question text" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-description">Description</Label>
            <Textarea
              id="q-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-type">Type</Label>
            <Select value={type} onValueChange={(v) => handleTypeChange(v as QuestionType)}>
              <SelectTrigger id="q-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Type-specific fields */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Type configuration</h2>
        </CardHeader>
        <CardContent>
          <QuestionTypeFields
            type={type}
            fact={fact}
            optionsRef={optionsRef}
            options={options}
            factsMapping={factsMapping}
            allFactIds={allFactIds}
            constantGroupNames={constantGroupNames}
            onFactChange={setFact}
            onOptionsRefChange={setOptionsRef}
            onOptionsChange={setOptions}
            onFactsMappingChange={setFactsMapping}
          />
        </CardContent>
      </Card>

      {/* Conditions */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Conditions</h2>
        </CardHeader>
        <CardContent>
          <QuestionConditionsSection
            showWhen={showWhen}
            hideWhen={hideWhen}
            unknowable={unknowable}
            factIds={allFactIds}
            onShowWhenChange={setShowWhen}
            onHideWhenChange={setHideWhen}
            onUnknowableChange={setUnknowable}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/data/questions">Cancel</Link>
        </Button>
        <Button onClick={handleSave} disabled={!label.trim() || saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
