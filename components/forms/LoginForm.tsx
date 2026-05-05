"use client";

import { useActionState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { loginAction, ActionResult } from "@/app/[locale]/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";

export function LoginForm() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const boundAction = loginAction.bind(null, locale, redirectTo);
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    boundAction,
    null
  );

  const errorMap: Record<string, string> = {
    invalid_credentials: t("error_invalid_credentials"),
    email_not_confirmed: t("error_email_not_confirmed"),
    account_suspended: t("error_account_suspended"),
    account_banned: t("error_account_banned"),
    rate_limited: t("error_rate_limited"),
  };

  const errorMessage =
    !state?.success && state?.error
      ? (errorMap[state.error] ?? t("error_generic"))
      : null;

  // Detect rate-limit with retry-after
  const isRateLimited = state && !state.success && state.error?.startsWith("too_many_requests:");
  const retryAfterSecs = isRateLimited ? state.error.split(":")[1] : "0";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {errorMessage && (
        <Alert variant="error">
          {isRateLimited
            ? t("error_rate_limited_countdown", { seconds: retryAfterSecs })
            : errorMessage}
        </Alert>
      )}

      <Input
        id="email"
        name="email"
        type="email"
        label={t("field_email")}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />

      <div>
        <Input
          id="password"
          name="password"
          type="password"
          label={t("field_password")}
          autoComplete="current-password"
          required
        />
        <div className="mt-1 flex justify-end">
          <Link
            href={`/${locale}/auth/reset-password`}
            className="text-sm text-[#0F172A] underline underline-offset-4 hover:text-[#F97316]"
          >
            {t("login_forgot_password")}
          </Link>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Spinner size="sm" /> : t("login_submit")}
      </Button>
    </form>
  );
}