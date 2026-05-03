// components/ui/Tooltip.tsx
import { cn } from "@/lib/utils";

type TooltipSide = "top" | "bottom" | "start" | "end";

const positionMap: Record<TooltipSide, string> = {
  top:    "bottom-full mb-2 start-1/2 -translate-x-1/2",
  bottom: "top-full mt-2 start-1/2 -translate-x-1/2",
  start:  "end-full me-2 top-1/2 -translate-y-1/2",
  end:    "start-full ms-2 top-1/2 -translate-y-1/2",
};

interface TooltipProps {
  content: string;
  side?: TooltipSide;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({
  content,
  side = "top",
  children,
  className,
}: TooltipProps) {
  return (
    <span className={cn("relative inline-flex group", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "absolute z-50 w-max max-w-[14rem] rounded-lg",
          "bg-bridge-blue text-muted-dark text-xs font-body px-2.5 py-1.5 shadow-lg",
          "pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
          "transition-opacity duration-150 whitespace-normal text-center",
          positionMap[side]
        )}
      >
        {content}
      </span>
    </span>
  );
}