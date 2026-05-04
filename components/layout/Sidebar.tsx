"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Users,
  ShieldCheck,
  Flag,
  Zap,
  Award,
  ClipboardList,
  LayoutDashboard,
  GraduationCap,
  X,
} from "lucide-react";
import { useLayout } from "./LayoutContext";
import type { UserRole } from "@/types";

interface SidebarProps {
  role: Extract<UserRole, "university">;
  // Extend union to "admin" once UserRole includes it
}

type NavItem = {
  labelKey: string;
  href: string;
  icon: React.ReactNode;
};

const ADMIN_ITEMS: NavItem[] = [
  { labelKey: "sidebar.users", href: "/admin/users", icon: <Users size={18} /> },
  { labelKey: "sidebar.verifications", href: "/admin/verifications", icon: <ShieldCheck size={18} /> },
  { labelKey: "sidebar.moderation", href: "/admin/moderation", icon: <Flag size={18} /> },
  { labelKey: "sidebar.xp", href: "/admin/xp", icon: <Zap size={18} /> },
  { labelKey: "sidebar.certificates", href: "/admin/certificates", icon: <Award size={18} /> },
  { labelKey: "sidebar.auditLog", href: "/admin/audit", icon: <ClipboardList size={18} /> },
];

const UNIVERSITY_ITEMS: NavItem[] = [
  { labelKey: "sidebar.overview", href: "/university", icon: <LayoutDashboard size={18} /> },
  { labelKey: "sidebar.students", href: "/university/students", icon: <GraduationCap size={18} /> },
];

export function Sidebar({ role }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useLayout();

  const items = role === "university" ? UNIVERSITY_ITEMS : ADMIN_ITEMS;

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-bridge-blue border-e border-white/10 shrink-0 transition-[width] duration-200 ease-in-out overflow-hidden
          ${isSidebarOpen ? "w-56" : "w-14"}`}
        aria-label={t("sidebar.label")}
      >
        <SidebarContent
          items={items}
          isOpen={isSidebarOpen}
          pathname={pathname}
          t={t}
        />
      </aside>

      {/* Mobile drawer overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <aside
            className="relative z-50 flex flex-col w-64 bg-bridge-blue border-e border-white/10"
            aria-label={t("sidebar.label")}
          >
            <div className="flex items-center justify-between px-4 h-[var(--navbar-height)] border-b border-white/10 shrink-0">
              <span className="font-heading font-bold text-white">
                Bridge{" "}
                <span className="bg-gradient-to-r from-bridge-yellow to-bridge-orange bg-clip-text text-transparent">
                  Up
                </span>
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label={t("nav.closeMenu")}
                className="text-muted-dark hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarContent
              items={items}
              isOpen={true}
              pathname={pathname}
              t={t}
            />
          </aside>
        </div>
      )}
    </>
  );
}

// ── Internal content shared between desktop + mobile ─────────────────────────

function SidebarContent({
  items,
  isOpen,
  pathname,
  t,
}: {
  items: NavItem[];
  isOpen: boolean;
  pathname: string;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
      {items.map(({ labelKey, href, icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            title={!isOpen ? t(labelKey) : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group
              ${isActive
                ? "text-bridge-yellow bg-white/5"
                : "text-muted-dark hover:text-white hover:bg-white/5"
              }`}
          >
            {/* Active indicator stripe */}
            <span
              className={`w-0.5 h-4 rounded-full shrink-0 transition-colors ${
                isActive ? "bg-bridge-yellow" : "bg-transparent"
              }`}
            />
            <span className="shrink-0">{icon}</span>
            {isOpen && (
              <span className="truncate">{t(labelKey)}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}