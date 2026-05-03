// components/ui/Dropdown.tsx
"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useId,
  KeyboardEvent,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// ── Context ──────────────────────────────────────────────────────────────────
interface DropdownCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerId: string;
  menuId: string;
}
const DropdownContext = createContext<DropdownCtx | null>(null);
const useDropdown = () => {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error("Dropdown subcomponents must be inside <Dropdown>");
  return ctx;
};

// ── Root ─────────────────────────────────────────────────────────────────────
export function Dropdown({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  // Close when focus leaves the widget
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
  };

  return (
    <DropdownContext.Provider
      value={{ open, setOpen, triggerId: `${id}-trigger`, menuId: `${id}-menu` }}
    >
      <div ref={ref} className="relative inline-block" onBlur={handleBlur}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// ── Trigger ───────────────────────────────────────────────────────────────────
export function DropdownTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { open, setOpen, triggerId, menuId } = useDropdown();

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <button
      type="button"
      id={triggerId}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={menuId}
      onClick={() => setOpen(!open)}
      onKeyDown={handleKeyDown}
      className={cn("inline-flex items-center", className)}
    >
      {children}
    </button>
  );
}

// ── Menu ──────────────────────────────────────────────────────────────────────
export function DropdownMenu({
  children,
  align = "start",
  className,
}: {
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const { open, menuId, triggerId } = useDropdown();

  if (!open) return null;

  return (
    <ul
      id={menuId}
      role="menu"
      aria-labelledby={triggerId}
      className={cn(
        "absolute z-50 mt-1 min-w-[11rem] rounded-xl bg-card-white border border-dark-text/10 shadow-lg py-1",
        "focus:outline-none",
        align === "end" ? "end-0" : "start-0",
        className
      )}
    >
      {children}
    </ul>
  );
}

// ── Item ──────────────────────────────────────────────────────────────────────
export function DropdownItem({
  children,
  onClick,
  disabled,
  className,
  destructive,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  destructive?: boolean;
}) {
  const { setOpen } = useDropdown();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    setOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLLIElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <li
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm font-body cursor-pointer select-none",
        "transition-colors duration-100 focus:outline-none",
        destructive
          ? "text-[--color-status-error] hover:bg-[--color-status-error]/8 focus:bg-[--color-status-error]/8"
          : "text-dark-text hover:bg-page-bg focus:bg-page-bg",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {children}
    </li>
  );
}

// ── Separator ─────────────────────────────────────────────────────────────────
export function DropdownSeparator() {
  return <li role="separator" className="my-1 border-t border-dark-text/8" />;
}