// components/ui/Button.tsx
import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

const variantMap: Record<ButtonVariant, string> = {
  primary:
    "bg-bridge-yellow text-bridge-blue font-heading font-semibold hover:bg-bridge-orange focus-visible:ring-bridge-yellow",
  secondary:
    "bg-bridge-blue text-card-white font-heading font-semibold hover:bg-bridge-blue/80 focus-visible:ring-bridge-blue",
  outline:
    "border border-bridge-yellow text-bridge-blue bg-transparent hover:bg-bridge-yellow/10 focus-visible:ring-bridge-yellow",
  ghost:
    "bg-transparent text-dark-text hover:bg-page-bg focus-visible:ring-bridge-blue",
  destructive:
    "bg-[--color-status-error] text-card-white font-heading font-semibold hover:bg-[--color-status-error]/80 focus-visible:ring-[--color-status-error]",
};

const sizeMap: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Icon placed before the label */
  startIcon?: React.ReactNode;
  /** Icon placed after the label */
  endIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      startIcon,
      endIcon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          "inline-flex items-center justify-center rounded-lg transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantMap[variant],
          sizeMap[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner size={size === "lg" ? "md" : "sm"} className="shrink-0" />
        ) : (
          startIcon && <span className="shrink-0">{startIcon}</span>
        )}
        {children}
        {!loading && endIcon && <span className="shrink-0">{endIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";