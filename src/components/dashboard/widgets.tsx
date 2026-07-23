"use client";

import { useState, type KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function SkillsInput({
  value,
  onChange,
  placeholder,
  className,
  max = 20,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
  max?: number;
}) {
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const v = raw.trim();
    if (!v) return;
    if (value.includes(v)) {
      setDraft("");
      return;
    }
    if (value.length >= max) return;
    onChange([...value, v]);
    setDraft("");
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  function remove(s: string) {
    onChange(value.filter((v) => v !== s));
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 min-h-9 rounded-md border border-input bg-transparent px-2 py-1.5 text-sm shadow-xs focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        className,
      )}
    >
      {value.map((s) => (
        <Badge
          key={s}
          variant="secondary"
          className="gap-1 pr-1 font-medium"
        >
          {s}
          <button
            type="button"
            aria-label={`Remove ${s}`}
            onClick={() => remove(s)}
            className="grid place-items-center h-4 w-4 rounded hover:bg-destructive/20 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => commit(draft)}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

/** Drag-and-drop file upload zone. Returns the chosen File via onFile. */
export function FileDropZone({
  accept,
  onFile,
  busy,
  progress,
  title,
  hint,
  icon,
  className,
}: {
  accept: string;
  onFile: (file: File) => void;
  busy?: boolean;
  progress?: number;
  title: string;
  hint: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  const [dragging, setDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    onFile(files[0]);
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer",
        dragging
          ? "border-saffron bg-saffron/5 ring-brand"
          : "border-border hover:border-saffron/50 hover:bg-saffron/5",
        busy && "pointer-events-none opacity-70",
        className,
      )}
    >
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="grid place-items-center h-12 w-12 rounded-xl bg-saffron/15 text-saffron group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div>
        <p className="font-display font-bold">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
      {typeof progress === "number" && (
        <div className="w-full max-w-xs h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-brand-gradient transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </label>
  );
}
