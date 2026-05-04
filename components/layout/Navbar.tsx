"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
    Bell,
    Menu,
    X,
    ChevronDown,
    LogOut,
    User,
} from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/ui/Dropdown";
import { useLayout } from "./LayoutContext";
import type { UserRole } from "@/types";
import type { Locale } from "@/i18n/routing";

interface NavbarProps {
    role: UserRole;
    userAvatarUrl?: string;
    userName: string;
}

const NAV_LINKS: Record<UserRole, { labelKey: string; href: string }[]> = {
    student: [
        { labelKey: "nav.home", href: "/dashboard" },
        { labelKey: "nav.opportunities", href: "/opportunities" },
        { labelKey: "nav.freelance", href: "/freelance" },
        { labelKey: "nav.chat", href: "/chat" },
    ],
    recruiter: [
        { labelKey: "nav.dashboard", href: "/dashboard" },
        { labelKey: "nav.opportunities", href: "/opportunities" },
        { labelKey: "nav.chat", href: "/chat" },
    ],
    university: [
        { labelKey: "nav.overview", href: "/university" },
        { labelKey: "nav.students", href: "/university/students" },
    ],
};

const LOCALES: Locale[] = ["en", "fr", "ar"];
const LOCALE_LABELS: Record<Locale, string> = { en: "EN", fr: "FR", ar: "AR" };

export function Navbar({ role, userAvatarUrl, userName }: NavbarProps) {
    const t = useTranslations();
    const locale = useLocale() as Locale;
    const router = useRouter();
    const pathname = usePathname();
    const { toggleSidebar, isSidebarOpen } = useLayout();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const links = NAV_LINKS[role] ?? [];
    const isAdminOrUniversity = role === "university"; // admin added below when role includes it

    function handleLocaleSwitch(nextLocale: Locale) {
        router.replace(pathname, { locale: nextLocale });
    }

    return (
        <header className="fixed inset-block-start-0 inset-inline-0 z-50 h-[var(--navbar-height)] bg-bridge-blue flex items-center px-4 gap-4">
            {/* Sidebar toggle — admin/university only */}
            {isAdminOrUniversity && (
                <button
                    onClick={toggleSidebar}
                    aria-label={t(isSidebarOpen ? "nav.collapseSidebar" : "nav.expandSidebar")}
                    className="text-white hidden lg:flex items-center justify-center w-8 h-8 shrink-0"
                >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            )}

            {/* Mobile hamburger — admin/university only (triggers sidebar drawer) */}
            {isAdminOrUniversity && (
                <button
                    onClick={toggleSidebar}
                    aria-label={t("nav.openMenu")}
                    className="text-white flex lg:hidden items-center justify-center w-8 h-8 shrink-0"
                >
                    <Menu size={20} />
                </button>
            )}

            {/* Mobile hamburger — student/recruiter (in-navbar mobile menu) */}
            {!isAdminOrUniversity && (
                <button
                    onClick={() => setIsMobileMenuOpen((p) => !p)}
                    aria-label={t("nav.openMenu")}
                    className="text-white flex lg:hidden items-center justify-center w-8 h-8 shrink-0"
                >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            )}

            {/* Logo */}
            <Link href="/dashboard" className="font-heading font-bold text-xl text-white select-none shrink-0">
                Bridge{" "}
                <span className="bg-gradient-to-r from-bridge-yellow to-bridge-orange bg-clip-text text-transparent">
                    Up
                </span>
            </Link>

            {/* Center nav — desktop only */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center" aria-label={t("nav.primary")}>
                {links.map(({ labelKey, href }) => (
                    <NavLink key={href} href={href} label={t(labelKey)} />
                ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3 ms-auto">
                {/* Locale switcher */}
                <div className="hidden sm:flex items-center gap-1">
                    {LOCALES.map((loc) => (
                        <button
                            key={loc}
                            onClick={() => handleLocaleSwitch(loc)}
                            className={`text-sm font-medium px-2 py-1 rounded transition-colors ${locale === loc
                                    ? "text-bridge-yellow"
                                    : "text-muted-dark hover:text-white"
                                }`}
                            aria-current={locale === loc ? "true" : undefined}
                        >
                            {LOCALE_LABELS[loc]}
                        </button>
                    ))}
                </div>

                {/* Notification bell */}
                <button
                    aria-label={t("nav.notifications")}
                    className="relative text-muted-dark hover:text-white transition-colors"
                >
                    <Bell size={20} />
                    {/* Static 0 badge — wired up in Chat 12 */}
                    <Badge
                        variant="count"
                        className="absolute -top-1.5 -end-1.5 min-w-[16px] h-4 text-[10px]"
                    >
                        0
                    </Badge>
                </button>

                {/* User avatar dropdown */}
                <Dropdown>
                    <DropdownTrigger className="flex items-center gap-2 text-muted-dark hover:text-white transition-colors">
                        <Avatar src={userAvatarUrl} alt={userName} size="sm" />
                        <ChevronDown size={14} className="hidden sm:block" />
                    </DropdownTrigger>

                    <DropdownMenu align="end">
                        <DropdownItem onClick={() => router.push("/profile")}>
                            <User size={16} />
                            {t("nav.profile")}
                        </DropdownItem>

                        <DropdownSeparator />

                        <DropdownItem
                            destructive
                            onClick={() => router.push("/auth/logout")}
                        >
                            <LogOut size={16} />
                            {t("nav.logout")}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

            {/* Mobile nav drawer — student/recruiter only */}
            {!isAdminOrUniversity && isMobileMenuOpen && (
                <div className="absolute inset-block-start-[var(--navbar-height)] inset-inline-0 bg-bridge-blue border-t border-white/10 lg:hidden z-40">
                    <nav className="flex flex-col p-4 gap-1" aria-label={t("nav.primary")}>
                        {links.map(({ labelKey, href }) => (
                            <NavLink
                                key={href}
                                href={href}
                                label={t(labelKey)}
                                mobile
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                        ))}
                        {/* Locale switcher in mobile drawer */}
                        <div className="flex gap-2 pt-3 border-t border-white/10 mt-2">
                            {LOCALES.map((loc) => (
                                <button
                                    key={loc}
                                    onClick={() => { handleLocaleSwitch(loc); setIsMobileMenuOpen(false); }}
                                    className={`text-sm font-medium px-3 py-1.5 rounded ${locale === loc ? "text-bridge-yellow" : "text-muted-dark"
                                        }`}
                                >
                                    {LOCALE_LABELS[loc]}
                                </button>
                            ))}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}

// ── NavLink helper ────────────────────────────────────────────────────────────

function NavLink({
    href,
    label,
    mobile = false,
    onClick,
}: {
    href: string;
    label: string;
    mobile?: boolean;
    onClick?: () => void;
}) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(href + "/");

    if (mobile) {
        return (
            <Link
                href={href}
                onClick={onClick}
                className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${isActive ? "text-bridge-yellow" : "text-muted-dark hover:text-white"
                    }`}
            >
                {label}
            </Link>
        );
    }

    return (
        <Link
            href={href}
            className={`relative px-3 py-1.5 text-sm font-medium transition-colors rounded ${isActive ? "text-bridge-yellow" : "text-muted-dark hover:text-white"
                }`}
        >
            {label}
            {isActive && (
                <span className="absolute inset-block-end-0 inset-inline-0 h-0.5 bg-bridge-yellow rounded-full" />
            )}
        </Link>
    );
}