import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link
        href="/"
        className="font-heading font-bold text-2xl text-bridge-blue mb-8 select-none"
      >
        Bridge{" "}
        <span className="bg-gradient-to-r from-bridge-yellow to-bridge-orange bg-clip-text text-transparent">
          Up
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-[480px] bg-card-white rounded-2xl shadow-sm p-8">
        {children}
      </div>
    </div>
  );
}