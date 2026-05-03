// components/ui/FileUpload.tsx
"use client";

import { useId, useRef, useState, DragEvent, ChangeEvent } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface FileUploadProps {
  /** Accepted MIME types e.g. ["application/pdf", "image/png"] */
  accept?: string[];
  /** Max file size in bytes */
  maxSize?: number;
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  accept = [],
  maxSize,
  onFileSelect,
  onFileRemove,
  className,
  disabled = false,
}: FileUploadProps) {
  const t = useTranslations("ui");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File): string | null => {
    if (accept.length > 0 && !accept.includes(file.type)) {
      return t("fileUpload.errorType", { types: accept.join(", ") });
    }
    if (maxSize && file.size > maxSize) {
      const mb = (maxSize / 1_048_576).toFixed(1);
      return t("fileUpload.errorSize", { max: mb });
    }
    return null;
  };

  const handleFile = (file: File) => {
    const err = validate(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input value so the same file can be re-selected after removal
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    onFileRemove?.();
  };

  const acceptAttr = accept.length > 0 ? accept.join(",") : undefined;

  return (
    <div className={cn("w-full", className)}>
      {!selectedFile ? (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed",
            "px-6 py-10 cursor-pointer transition-colors duration-150 text-center",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bridge-yellow",
            dragging
              ? "border-bridge-yellow bg-bridge-yellow/5"
              : "border-dark-text/20 hover:border-bridge-yellow hover:bg-bridge-yellow/5",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-[--color-status-error]"
          )}
        >
          <UploadCloud size={32} className="text-dark-text/40" aria-hidden="true" />
          <div>
            <p className="text-sm font-body font-semibold text-dark-text">
              {t("fileUpload.prompt")}
            </p>
            <p className="text-xs font-body text-dark-text/50 mt-0.5">
              {accept.length > 0
                ? t("fileUpload.accepted", { types: accept.join(", ") })
                : t("fileUpload.anyType")}
              {maxSize ? ` — ${t("fileUpload.maxSize", { max: (maxSize / 1_048_576).toFixed(1) })}` : ""}
            </p>
          </div>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={acceptAttr}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            aria-label={t("fileUpload.inputLabel")}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-dark-text/12 bg-card-white px-4 py-3">
          <FileText size={20} className="shrink-0 text-bridge-blue" aria-hidden="true" />
          <span className="flex-1 min-w-0 truncate text-sm font-body text-dark-text">
            {selectedFile.name}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            aria-label={t("fileUpload.remove")}
            className="shrink-0 rounded p-1 text-dark-text/50 hover:text-[--color-status-error] transition-colors"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-body text-[--color-status-error]">
          {error}
        </p>
      )}
    </div>
  );
}