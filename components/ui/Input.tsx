// components/ui/Input.tsx
import { forwardRef, InputHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  /** Render a Lucide icon inside the start of the input */
  startIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, errorMessage, startIcon, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const hasError = Boolean(errorMessage);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-body font-semibold text-dark-text"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-dark-text/50 pointer-events-none">
              {startIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-describedby={
              [hasError && errorId, helperText && helperId]
                .filter(Boolean)
                .join(" ") || undefined
            }
            aria-invalid={hasError}
            className={cn(
              "w-full rounded-lg border bg-card-white font-body text-sm text-dark-text",
              "px-3 py-2 h-10 transition-colors duration-150",
              "placeholder:text-dark-text/40",
              "focus:outline-none focus:ring-2 focus:ring-bridge-yellow focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              startIcon && "ps-10",
              hasError
                ? "border-[--color-status-error] focus:ring-[--color-status-error]"
                : "border-dark-text/20 hover:border-dark-text/40",
              className
            )}
            {...props}
          />
        </div>
        {hasError && (
          <p id={errorId} role="alert" className="text-xs font-body text-[--color-status-error]">
            {errorMessage}
          </p>
        )}
        {!hasError && helperText && (
          <p id={helperId} className="text-xs font-body text-dark-text/60">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";