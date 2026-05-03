// components/ui/Tabs.tsx
"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  KeyboardEvent,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// ── Context ───────────────────────────────────────────────────────────────────
interface TabsCtx {
  activeTab: string;
  setActiveTab: (id: string) => void;
  baseId: string;
}
const TabsContext = createContext<TabsCtx | null>(null);
const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs subcomponents must be inside <Tabs>");
  return ctx;
};

// ── Root ──────────────────────────────────────────────────────────────────────
export function Tabs({
  defaultTab,
  children,
  className,
}: {
  defaultTab: string;
  children: ReactNode;
  className?: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const baseId = useId();

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, baseId }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

// ── List ──────────────────────────────────────────────────────────────────────
export function TabsList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { baseId } = useTabs();

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(
      (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="tab"]')
    );
    const currentIndex = tabs.findIndex((t) => t === document.activeElement);
    let nextIndex = currentIndex;

    if (e.key === "ArrowInlineEnd" || e.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === "ArrowInlineStart" || e.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== currentIndex) {
      e.preventDefault();
      tabs[nextIndex]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-labelledby={baseId}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex border-b border-dark-text/12 gap-1 overflow-x-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

// ── Tab ───────────────────────────────────────────────────────────────────────
export function Tab({
  tabId,
  children,
  className,
}: {
  tabId: string;
  children: ReactNode;
  className?: string;
}) {
  const { activeTab, setActiveTab, baseId } = useTabs();
  const isActive = activeTab === tabId;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${tabId}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${tabId}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveTab(tabId)}
      className={cn(
        "relative shrink-0 px-4 py-2.5 text-sm font-heading font-semibold transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bridge-yellow rounded-t-md",
        isActive
          ? "text-bridge-blue after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-bridge-yellow"
          : "text-dark-text/60 hover:text-dark-text",
        className
      )}
    >
      {children}
    </button>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────
export function TabPanel({
  tabId,
  children,
  className,
}: {
  tabId: string;
  children: ReactNode;
  className?: string;
}) {
  const { activeTab, baseId } = useTabs();
  const isActive = activeTab === tabId;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${tabId}`}
      aria-labelledby={`${baseId}-tab-${tabId}`}
      hidden={!isActive}
      tabIndex={0}
      className={cn("pt-4 focus:outline-none", className)}
    >
      {isActive ? children : null}
    </div>
  );
}