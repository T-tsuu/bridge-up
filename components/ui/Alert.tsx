// components/ui/Alert.tsx
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type AlertVariant = "success" | "warning" | "error" | "info";

const configMap: Record<
  AlertVariant,
  { icon: React.ReactNode; classes: string }
> = {
  success: {
    icon: <CheckCircle2 size={16} aria-hidden="true" />,
    classes: "bg-[--color-status-success]/10 border-[--color-status-success]/30 text-[--color-status-success]",
  },
  warning: {
    icon: <AlertTriangle size={16} aria-hidden="true" />,
    classes: "bg-[--color-status-warning]/10 border-[--color-status-warning]/30 text-[--color-status-warning]",
  },
  error: {
    icon: <XCircle size={16} aria-hidden="true" />,
    classes: "bg-[--color-status-error]/10 border-[--color-status-error]/30 text-[--color-status-error]",
  },
  info: {
    icon: <Info size={16} aria-hidden="true" />,
    classes: "bg-bridge-blue/8 border-bridge-blue/20 text-bridge-blue",
  },
};

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  onDismiss,
  className,
}: AlertProps) {
  const t = useTranslations("ui");
  const { icon, classes } = configMap[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3",
        classes,
        className
      )}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0 font-body text-sm">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="opacity-90">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t("alert.dismiss")}
          className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}