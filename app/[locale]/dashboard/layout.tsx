import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { LayoutProvider } from "@/components/layout/LayoutContext";
import type { UserRole } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function DashboardLayout({
  children,
  params: { locale },
}: DashboardLayoutProps) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect({
      href: `/auth/login?redirectTo=/${locale}/dashboard`,
      locale,
    });
  }

  // Read user record for role — adjust column name to match your actual schema
  const { data: user } = await supabase
    .from("users")
    .select("role, full_name, avatar_url")
    .eq("id", session?.user.id)
    .single();

  const role = (user?.role ?? "student") as UserRole;
  const isAdminOrUniversity = role === "university";
  // Extend to: role === "admin" || role === "university" once admin is in UserRole
  const isStudentOrRecruiter = role === "student" || role === "recruiter";
  const layoutMode = isAdminOrUniversity ? "with-sidebar" : "centered";

  return (
    <LayoutProvider>
      <Navbar
        role={role}
        userName={user?.full_name ?? ""}
        userAvatarUrl={user?.avatar_url ?? undefined}
      />

      <PageWrapper layout={layoutMode}>
        {isAdminOrUniversity && (
          <Sidebar role={role as Extract<UserRole, "university">} />
        )}

        <main className={isAdminOrUniversity ? "flex-1 overflow-y-auto p-6 bg-page-bg" : ""}>
          {children}
        </main>
      </PageWrapper>

      {isStudentOrRecruiter && (
        <MobileNav role={role as Extract<UserRole, "student" | "recruiter">} />
      )}
    </LayoutProvider>
  );
}