// components/ui/Card.tsx
import { cn } from "@/lib/utils";

type CardPadding = "none" | "sm" | "md" | "lg";

const paddingMap: Record<CardPadding, string> = {
  none: "",
  sm:   "p-3",
  md:   "p-5",
  lg:   "p-8",
};

interface CardProps {
  padding?: CardPadding;
  className?: string;
  children: React.ReactNode;
}

interface CardSectionProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ padding = "md", className, children }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card-white rounded-xl shadow-sm border border-dark-text/8",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: CardSectionProps) {
  return (
    <div
      className={cn(
        "border-b border-dark-text/8 pb-4 mb-4 font-heading font-semibold text-dark-text",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardFooter({ className, children }: CardSectionProps) {
  return (
    <div
      className={cn(
        "border-t border-dark-text/8 pt-4 mt-4",
        className
      )}
    >
      {children}
    </div>
  );
}