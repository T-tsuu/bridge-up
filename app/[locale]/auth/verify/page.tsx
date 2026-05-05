"use client";

import { useEffect, useState, useActionState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { resendVerificationAction, ActionResult } from "@/app/[locale]/auth/actions";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";

const COOLDOWN_SECS = 60;

export default function VerifyPage() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const error = searchParams.get("error");

  const [cooldown, setCooldown] = useState(0);

  const boundAction = resendVerificationAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    boundAction,
    null
  );

  // Start cooldown after successful resend
  useEffect(() => {
    if (state?.success) {
      setCooldown(COOLDOWN_SECS);
    }
  }, [state]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const canResend = cooldown === 0 && !isPending;

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-5 text-center">
        {/* Icon placeholder — replace with Lucide MailCheck when available */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FACC15]/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-[#0F172A]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 17.25V6.75M21.75 6.75L12 13.5 2.25 6.75M21.75 6.75A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25"
            />
          </svg>
        </div>

        <div>
          <h1 className="font-montserrat text-2xl font-700 text-[#0F172A]">
            {t("verify_title")}
          </h1>
          <p className="mt-2 text-sm text-[#111827]/70">
            {t("verify_subtitle", { email })}
          </p>
        </div>

        {state?.success && (
          <Alert variant="success">{t("verify_resent")}</Alert>
        )}
        {!state?.success && state?.error && (
          <Alert variant="error">{t("error_generic")}</Alert>
        )}

        <form action={formAction} className="w-full">
          <input type="hidden" name="email" value={email} />
          <Button
            type="submit"
            variant="outline"
            disabled={!canResend}
            className="w-full"
          >
            {isPending ? (
              <Spinner size="sm" />
            ) : cooldown > 0 ? (
              t("verify_resend_cooldown", { seconds: cooldown })
            ) : (
              t("verify_resend")
            )}
          </Button>
        </form>

        <p className="text-xs text-[#111827]/50">{t("verify_spam_note")}</p>
        {error && (
          <Alert variant="error">{t("verify_confirmation_failed")}</Alert>
        )}
      </div>
    </AuthLayout>
  );
}