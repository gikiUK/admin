"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { INPUT_COMMIT_DELAY_MS } from "@/lib/debounce";

type DebouncedInputProps = Omit<React.ComponentProps<typeof Input>, "onChange" | "defaultValue"> & {
  value: string;
  onCommit: (value: string) => void;
};

export function DebouncedInput({ value, onCommit, ...props }: DebouncedInputProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setLocal(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (next !== valueRef.current) onCommit(next);
    }, INPUT_COMMIT_DELAY_MS);
  }

  function handleBlur() {
    clearTimeout(timerRef.current);
    if (local !== valueRef.current) onCommit(local);
  }

  return <Input {...props} value={local} onChange={handleChange} onBlur={handleBlur} />;
}

type DebouncedTextareaProps = Omit<React.ComponentProps<typeof Textarea>, "onChange" | "defaultValue"> & {
  value: string;
  onCommit: (value: string) => void;
};

export function DebouncedTextarea({ value, onCommit, ...props }: DebouncedTextareaProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    setLocal(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (next !== valueRef.current) onCommit(next);
    }, INPUT_COMMIT_DELAY_MS);
  }

  function handleBlur() {
    clearTimeout(timerRef.current);
    if (local !== valueRef.current) onCommit(local);
  }

  return <Textarea {...props} value={local} onChange={handleChange} onBlur={handleBlur} />;
}
