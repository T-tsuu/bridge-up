import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ResetPasswordConfirmForm } from "@/components/forms/ResetPasswordForm";

export default async function ResetPasswordConfirmPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <AuthLayout>
      <div className="mb-6 text-center">
        <h1 className="font-montserrat text-2xl font-700 text-[#0F172A]">
          {t("reset_confirm_title")}
        </h1>
        <p className="mt-1 text-sm text-[#111827]/70">
          {t("reset_confirm_subtitle")}
        </p>
      </div>

      <ResetPasswordConfirmForm />

      <p className="mt-6 text-center text-sm text-[#111827]/70">
        <Link
          href={`/${locale}/auth/login`}
          className="font-semibold text-[#0F172A] underline underline-offset-4 hover:text-[#F97316]"
        >
          {t("reset_back_to_login")}
        </Link>
      </p>
    </AuthLayout>
  );
}