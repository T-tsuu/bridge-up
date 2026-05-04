"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";

interface SubNavTab {
  label: string;
  href: string;
}

interface SubNavProps {
  tabs: SubNavTab[];
}

export function SubNav({ tabs }: SubNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="flex items-center gap-0 border-b border-white/10 bg-bridge-blue px-4 overflow-x-auto"
      aria-label="Sub navigation"
    >
      {tabs.map(({ label, href }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
              ${isActive
                ? "text-white border-b-2 border-bridge-yellow -mb-px"
                : "text-muted-dark hover:text-white border-b-2 border-transparent -mb-px"
              }`}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}