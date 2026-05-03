// components/ui/Textarea.tsx
"use client";

import { forwardRef, TextareaHTMLAttributes, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  errorMessage?: string;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, errorMessage, maxLength, className, id, onChange, value, defaultValue, ...props }, ref) => {
    const t = useTranslations("ui");
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const errorId = `${textareaId}-error`;
    const counterId = `${textareaId}-counter`;
    const hasError = Boolean(errorMessage);

    const [charCount, setCharCount] = useState<number>(
      typeof value === "string"
        ? value.length
        : typeof defaultValue === "string"
        ? defaultValue.length
        : 0
    );

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-body font-semibold text-dark-text"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          aria-describedby={
            [hasError && errorId, maxLength && counterId]
              .filter(Boolean)
              .join(" ") || undefined
          }
          aria-invalid={hasError}
          onChange={(e) => {
            setCharCount(e.target.value.length);
            onChange?.(e);
          }}
          className={cn(
            "w-full rounded-lg border bg-card-white font-body text-sm text-dark-text",
            "px-3 py-2 min-h-[120px] resize-y transition-colors duration-150",
            "placeholder:text-dark-text/40",
            "focus:outline-none focus:ring-2 focus:ring-bridge-yellow focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            hasError
              ? "border-[--color-status-error] focus:ring-[--color-status-error]"
              : "border-dark-text/20 hover:border-dark-text/40",
            className
          )}
          {...props}
        />
        <div className="flex items-center justify-between">
          {hasError ? (
            <p id={errorId} role="alert" className="text-xs font-body text-[--color-status-error]">
              {errorMessage}
            </p>
          ) : (
            <span />
          )}
          {maxLength && (
            <p
              id={counterId}
              aria-live="polite"
              className={cn(
                "text-xs font-body tabular-nums",
                charCount >= maxLength ? "text-[--color-status-error]" : "text-dark-text/60"
              )}
            >
              {t("textarea.counter", { current: charCount, max: maxLength })}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";