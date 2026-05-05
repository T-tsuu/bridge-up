"use client";

import { useActionState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  requestPasswordResetAction,
  confirmPasswordResetAction,
  ActionResult,
} from "@/app/[locale]/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";

// ── Request form (step 1) ──────────────────────────────────────────────────────

export function ResetPasswordRequestForm() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();

  const boundAction = requestPasswordResetAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    boundAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state?.success && (
        <Alert variant="success">{t("reset_email_sent")}</Alert>
      )}
      {!state?.success && state?.error && (
        <Alert variant="error">{t("error_generic")}</Alert>
      )}

      <Input
        id="email"
        name="email"
        type="email"
        label={t("field_email")}
        placeholder="you@example.com"
        autoComplete="email"
        required
        disabled={state?.success}
      />

      <Button type="submit" disabled={isPending || state?.success} className="w-full">
        {isPending ? <Spinner size="sm" /> : t("reset_submit")}
      </Button>
    </form>
  );
}

// ── Confirm form (step 2) ──────────────────────────────────────────────────────

export function ResetPasswordConfirmForm() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();

  const boundAction = confirmPasswordResetAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    boundAction,
    null
  );

  const errorMap: Record<string, string> = {
    password_too_short: t("error_password_short"),
    passwords_do_not_match: t("error_passwords_mismatch"),
    password_update_failed: t("error_generic"),
    rate_limited: t("error_rate_limited"),
  };

  function getError(field?: string): string | undefined {
    if (!state || state.success) return undefined;
    if (field && state.field !== field) return undefined;
    return errorMap[state.error] ?? state.error;
  }

  if (state?.success) {
    return <Alert variant="success">{t("reset_confirm_success")}</Alert>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {!state?.success && state?.error && !state.field && (
        <Alert variant="error">{getError()}</Alert>
      )}

      <Input
        id="password"
        name="password"
        type="password"
        label={t("field_new_password")}
        autoComplete="new-password"
        required
        minLength={8}
        errorMessage={getError("password")}
      />

      <Input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label={t("field_confirm_password")}
        autoComplete="new-password"
        required
        errorMessage={getError("confirmPassword")}
      />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Spinner size="sm" /> : t("reset_confirm_submit")}
      </Button>
    </form>
  );
}