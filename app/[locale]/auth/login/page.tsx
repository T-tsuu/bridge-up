import { getTranslations } from "next-intl/server"; // ← different import
import Link from "next/link";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoginForm } from "@/components/forms/LoginForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" }); // ← await it

  return (
    <AuthLayout>
      <div className="mb-6 text-center">
        <h1 className="font-montserrat text-2xl font-bold text-[#0F172A]">
          {t("login_title")}
        </h1>
        <p className="mt-1 text-sm text-[#111827]/70">{t("login_subtitle")}</p>
      </div>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-[#111827]/70">
        {t("login_no_account")}{" "}
        <Link
          href={`/${locale}/auth/register`}
          className="font-semibold text-[#0F172A] underline underline-offset-4 hover:text-[#F97316]"
        >
          {t("register_link")}
        </Link>
      </p>
    </AuthLayout>
  );
}