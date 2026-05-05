"use client";

import { useActionState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { registerAction, ActionResult } from "@/app/[locale]/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";

const ROLES = [
  { value: "student", labelKey: "role_student" },
  { value: "recruiter", labelKey: "role_recruiter" },
  { value: "university", labelKey: "role_university" },
  { value: "freelancer", labelKey: "role_freelancer" },
] as const;

export function RegisterForm() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();

  const boundAction = registerAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    boundAction,
    null
  );

  const errorMap: Record<string, string> = {
    email_already_registered: t("error_email_taken"),
    registration_failed: t("error_generic"),
    password_too_short: t("error_password_short"),
    passwords_do_not_match: t("error_passwords_mismatch"),
    rate_limited: t("error_rate_limited"),
  };

  function getError(field?: string): string | undefined {
    if (!state || state.success) return undefined;
    if (field && state.field !== field) return undefined;
    return errorMap[state.error] ?? state.error;
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Global error (not field-specific) */}
      {!state?.success && state?.error && !state.field && (
        <Alert variant="error">{getError()}</Alert>
      )}

      {/* Role selection */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-[#111827]">
          {t("register_role_label")}
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map(({ value, labelKey }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-medium text-[#111827] transition-colors has-[:checked]:border-[#FACC15] has-[:checked]:bg-[#FACC15]/10"
            >
              <input
                type="radio"
                name="role"
                value={value}
                className="sr-only"
                required
              />
              {t(labelKey)}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Email */}
      <div>
        <Input
          id="email"
          name="email"
          type="email"
          label={t("field_email")}
          placeholder="you@example.com"
          autoComplete="email"
          required
          errorMessage={getError("email")}
        />
      </div>

      {/* Password */}
      <div>
        <Input
          id="password"
          name="password"
          type="password"
          label={t("field_password")}
          autoComplete="new-password"
          required
          minLength={8}
          errorMessage={getError("password")}
        />
      </div>

      {/* Confirm password */}
      <div>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label={t("field_confirm_password")}
          autoComplete="new-password"
          required
          errorMessage={getError("confirmPassword")}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Spinner size="sm" /> : t("register_submit")}
      </Button>
    </form>
  );
}