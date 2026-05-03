// components/ui/ProgressBar.tsx
import { cn } from "@/lib/utils";

type ProgressVariant = "default" | "xp";

interface ProgressBarProps {
  value: number;        // 0–100
  max?: number;
  variant?: ProgressVariant;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = "default",
  label,
  showValue = false,
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className="text-xs font-body font-semibold text-dark-text">{label}</span>
          )}
          {showValue && (
            <span className="text-xs font-body tabular-nums text-dark-text/60">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="w-full h-2.5 rounded-full bg-dark-text/10 overflow-hidden"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            variant === "xp" ? "bg-bridge-gradient" : "bg-bridge-yellow"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}