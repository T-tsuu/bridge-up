// components/ui/Spinner.tsx
import { cn } from "@/lib/utils";

type SpinnerSize = "sm" | "md" | "lg";

const sizeMap: Record<SpinnerSize, string> = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-10 border-[3px]",
};

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="loading"
      className={cn(
        "inline-block rounded-full border-current border-b-transparent animate-spin",
        sizeMap[size],
        className
      )}
    />
  );
}