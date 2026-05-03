// components/ui/Skeleton.tsx
import { cn } from "@/lib/utils";

type SkeletonShape = "line" | "block" | "circle";

interface SkeletonProps {
  shape?: SkeletonShape;
  /** Tailwind width class e.g. "w-full", "w-1/2" */
  width?: string;
  /** Tailwind height class e.g. "h-4", "h-32" */
  height?: string;
  className?: string;
}

export function Skeleton({
  shape = "line",
  width = "w-full",
  height,
  className,
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="loading"
      className={cn(
        "animate-pulse bg-dark-text/10",
        shape === "circle"
          ? "rounded-full"
          : shape === "block"
          ? "rounded-lg"
          : "rounded",
        width,
        height ?? (shape === "line" ? "h-4" : shape === "block" ? "h-32" : "h-10"),
        className
      )}
    />
  );
}