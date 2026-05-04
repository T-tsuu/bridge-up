import type { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  layout: "centered" | "with-sidebar";
}

export function PageWrapper({ children, layout }: PageWrapperProps) {
  if (layout === "with-sidebar") {
    return (
      <div className="flex min-h-screen pt-[var(--navbar-height)]">
        {/* Sidebar is rendered as a sibling in dashboard/layout.tsx and sits here via flex */}
        {children}
      </div>
    );
  }

  // centered — student and recruiter
  return (
    <div className="min-h-screen pt-[var(--navbar-height)] bg-page-bg">
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}