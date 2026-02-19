"use client";

import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DebouncedInput, DebouncedTextarea } from "@/components/ui/debounced-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { BlobCondition, BlobOption, BlobQuestion, QuestionType } from "@/lib/blob/types";
import { useDataset } from "@/lib/blob/use-dataset";
import { QuestionConditionsSection } from "./question-conditions-section";
import { QuestionTypeFields } from "./question-type-fields";

type FactsMap = Record<string, Record<string, string | boolean>>;

type QuestionEditorProps = {
  questionIndex?: number;
  isNew?: boolean;
};

const QUESTION_TYPES: QuestionType[] = ["boolean_state", "single-select", "multi-select", "checkbox-radio-hybrid"];

// ── Edit existing question ──────────────────────────────

function ExistingQuestionEditor({ questionIndex }: { questionIndex: number }) {
  const { blob, dispatch } = useDataset();

  const question = blob?.questions[questionIndex];
  const allFactIds = blob ? Object.keys(blob.facts) : [];
  const constantGroupNames = blob ? Object.keys(blob.constants) : [];

  if (!blob || !question) {
    return <div className="p-6 text-muted-foreground">Question not found.</div>;
  }

  function dispatchUpdate(patch: Partial<BlobQuestion>) {
    if (!question) return;
    dispatch({ type: "SET_QUESTION", index: questionIndex, question: { ...question, ...patch } });
  }

  function handleTypeChange(newType: QuestionType) {
    if (!question) return;
    const patch: Partial<BlobQuestion> = { type: newType };
    if (newType === "boolean_state") {
      patch.options_ref = undefined;
      patch.options = undefined;
      patch.facts = undefined;
    } else if (newType === "single-select" || newType === "multi-select") {
      patch.options = undefined;
      patch.facts = undefined;
    } else {
      patch.fact = undefined;
      patch.options_ref = undefined;
    }
    dispatchUpdate(patch);
  }

  function handleToggleEnabled() {
    dispatch({ type: question?.enabled ? "DISCARD_QUESTION" : "RESTORE_QUESTION", index: questionIndex });
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

        <Button variant={question.enabled ? "outline" : "default"} size="sm" onClick={handleToggleEnabled}>
          {question.enabled ? (
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

      <h1 className="text-2xl font-semibold tracking-tight">Edit: Q{questionIndex + 1}</h1>

      {/* Properties */}
      <Card className={!question.enabled ? "opacity-50" : undefined}>
        <CardHeader>
          <h2 className="text-sm font-semibold">Properties</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="q-label">Label</Label>
            <DebouncedInput
              id="q-label"
              value={question.label}
              onCommit={(v) => dispatchUpdate({ label: v })}
              placeholder="Question text"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-description">Description</Label>
            <DebouncedTextarea
              id="q-description"
              value={question.description ?? ""}
              onCommit={(v) => dispatchUpdate({ description: v || undefined })}
              placeholder="Optional description"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-type">Type</Label>
            <Select value={question.type} onValueChange={(v) => handleTypeChange(v as QuestionType)}>
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
      <Card className={!question.enabled ? "opacity-50" : undefined}>
        <CardHeader>
          <h2 className="text-sm font-semibold">Type configuration</h2>
        </CardHeader>
        <CardContent>
          <QuestionTypeFields
            type={question.type}
            fact={question.fact ?? ""}
            optionsRef={question.options_ref ?? ""}
            options={question.options ?? []}
            factsMapping={question.facts ?? {}}
            allFactIds={allFactIds}
            constantGroupNames={constantGroupNames}
            onFactChange={(fact) => dispatchUpdate({ fact: fact || undefined })}
            onOptionsRefChange={(ref) => dispatchUpdate({ options_ref: ref || undefined })}
            onOptionsChange={(options) => dispatchUpdate({ options })}
            onFactsMappingChange={(facts) => dispatchUpdate({ facts })}
          />
        </CardContent>
      </Card>

      {/* Conditions */}
      <Card className={!question.enabled ? "opacity-50" : undefined}>
        <CardHeader>
          <h2 className="text-sm font-semibold">Conditions</h2>
        </CardHeader>
        <CardContent>
          <QuestionConditionsSection
            showWhen={question.show_when}
            hideWhen={question.hide_when}
            unknowable={question.unknowable ?? false}
            factIds={allFactIds}
            onShowWhenChange={(c) => dispatchUpdate({ show_when: c })}
            onHideWhenChange={(c) => dispatchUpdate({ hide_when: c })}
            onUnknowableChange={(v) => dispatchUpdate({ unknowable: v || undefined })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ── Create new question ─────────────────────────────────

function NewQuestionEditor() {
  const router = useRouter();
  const { blob, dispatch } = useDataset();

  const allFactIds = blob ? Object.keys(blob.facts) : [];
  const constantGroupNames = blob ? Object.keys(blob.constants) : [];

  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<QuestionType>("boolean_state");
  const [fact, setFact] = useState("");
  const [optionsRef, setOptionsRef] = useState("");
  const [options, setOptions] = useState<BlobOption[]>([]);
  const [factsMapping, setFactsMapping] = useState<FactsMap>({});
  const [showWhen, setShowWhen] = useState<BlobCondition | undefined>(undefined);
  const [hideWhen, setHideWhen] = useState<BlobCondition | undefined>(undefined);
  const [unknowable, setUnknowable] = useState(false);

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

  function handleCreate() {
    const payload: BlobQuestion = {
      label,
      type,
      enabled: true,
      description: description || undefined,
      show_when: showWhen,
      hide_when: hideWhen,
      unknowable: unknowable || undefined
    };

    if (type === "boolean_state") {
      payload.fact = fact || undefined;
    } else if (type === "single-select" || type === "multi-select") {
      payload.fact = fact || undefined;
      payload.options_ref = optionsRef || undefined;
    } else {
      payload.options = options;
      payload.facts = factsMapping;
    }

    dispatch({ type: "ADD_QUESTION", question: payload });
    router.push("/data/questions");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/data/questions"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Questions
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">New Question</h1>

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
        <Button onClick={handleCreate} disabled={!label.trim()}>
          Create
        </Button>
      </div>
    </div>
  );
}

// ── Entrypoint ──────────────────────────────────────────

export function QuestionEditor({ questionIndex, isNew }: QuestionEditorProps) {
  if (isNew) return <NewQuestionEditor />;
  if (questionIndex !== undefined) return <ExistingQuestionEditor questionIndex={questionIndex} />;
  return null;
}
