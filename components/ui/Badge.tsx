// components/ui/Badge.tsx
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "error" | "xp" | "level";
type BadgeLevel = 1 | 2 | 3 | 4 | 5;

const variantMap: Record<Exclude<BadgeVariant, "level">, string> = {
  default: "bg-dark-text/10 text-dark-text",
  success: "bg-[--color-status-success]/15 text-[--color-status-success]",
  warning: "bg-[--color-status-warning]/15 text-[--color-status-warning]",
  error:   "bg-[--color-status-error]/15 text-[--color-status-error]",
  xp:      "bg-bridge-gradient text-bridge-blue",
};

// Level 1–5 maps to Starter → Elite
const levelMap: Record<BadgeLevel, string> = {
  1: "bg-slate-200 text-slate-700",                         // Starter
  2: "bg-blue-100 text-blue-700",                           // Rising Talent
  3: "bg-violet-100 text-violet-700",                       // Experienced
  4: "bg-amber-100 text-amber-700",                         // Pro
  5: "bg-bridge-gradient text-bridge-blue",                  // Elite
};

interface BadgeProps {
  variant?: BadgeVariant;
  level?: BadgeLevel;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = "default", level, className, children }: BadgeProps) {
  const isLevel = variant === "level" && level !== undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2.5 py-0.5",
        "text-xs font-heading font-semibold leading-none whitespace-nowrap",
        isLevel ? levelMap[level!] : variantMap[variant as Exclude<BadgeVariant, "level">],
        className
      )}
    >
      {children}
    </span>
  );
}