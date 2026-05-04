"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Home,
  Briefcase,
  MessageCircle,
  User,
  MoreHorizontal,
  LayoutDashboard,
} from "lucide-react";
import type { UserRole } from "@/types";

interface MobileNavProps {
  role: Extract<UserRole, "student" | "recruiter">;
}

type Tab = {
  labelKey: string;
  href: string;
  icon: React.ReactNode;
};

const STUDENT_TABS: Tab[] = [
  { labelKey: "mobile.home", href: "/dashboard", icon: <Home size={20} /> },
  { labelKey: "mobile.opportunities", href: "/opportunities", icon: <Briefcase size={20} /> },
  { labelKey: "mobile.chat", href: "/chat", icon: <MessageCircle size={20} /> },
  { labelKey: "mobile.profile", href: "/profile", icon: <User size={20} /> },
  { labelKey: "mobile.more", href: "/more", icon: <MoreHorizontal size={20} /> },
];

const RECRUITER_TABS: Tab[] = [
  { labelKey: "mobile.dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { labelKey: "mobile.opportunities", href: "/opportunities", icon: <Briefcase size={20} /> },
  { labelKey: "mobile.chat", href: "/chat", icon: <MessageCircle size={20} /> },
  { labelKey: "mobile.profile", href: "/profile", icon: <User size={20} /> },
  { labelKey: "mobile.more", href: "/more", icon: <MoreHorizontal size={20} /> },
];

export function MobileNav({ role }: MobileNavProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const tabs = role === "recruiter" ? RECRUITER_TABS : STUDENT_TABS;

  return (
    <nav
      className="fixed inset-block-end-0 inset-inline-0 z-50 flex lg:hidden bg-bridge-blue border-t border-white/10 safe-bottom"
      aria-label={t("mobile.nav")}
    >
      {tabs.map(({ labelKey, href, icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 text-[10px] font-medium transition-colors
              ${isActive ? "text-bridge-yellow" : "text-muted-dark hover:text-white"}`}
            aria-current={isActive ? "page" : undefined}
          >
            {icon}
            <span>{t(labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}