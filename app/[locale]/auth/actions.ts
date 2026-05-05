"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function getIP(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

function parseRateLimitError(err: unknown): string | null {
  if (err instanceof Error && err.message.startsWith("rate_limited:")) {
    const secs = err.message.split(":")[1];
    return `too_many_requests:${secs}`;
  }
  return null;
}

// ─── Schemas ───────────────────────────────────────────────────────────────────

const RegisterSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, "password_too_short"),
    confirmPassword: z.string(),
    role: z.enum(["student", "recruiter", "university", "freelancer"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "passwords_do_not_match",
    path: ["confirmPassword"],
  });

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ResendSchema = z.object({
  email: z.string().email(),
});

const ResetRequestSchema = z.object({
  email: z.string().email(),
});

const ResetConfirmSchema = z
  .object({
    password: z.string().min(8, "password_too_short"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "passwords_do_not_match",
    path: ["confirmPassword"],
  });

// ─── Action return type ────────────────────────────────────────────────────────

export type ActionResult =
  | { success: true; redirectTo?: string }
  | { success: false; error: string; field?: string };

// ─── registerAction ────────────────────────────────────────────────────────────

export async function registerAction(
  locale: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const ip = await getIP();

  try {
    await checkRateLimit("register", ip);
  } catch (e) {
    const msg = parseRateLimitError(e);
    return { success: false, error: msg ?? "rate_limited" };
  }

  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first.message, field: first.path[0] as string };
  }

  const { email, password, role } = parsed.data;

  // Map UX role to DB role family + metadata flags
  const roleMap: Record<
    string,
    { app_role: string; freelance_mode: boolean; is_student: boolean }
  > = {
    student: { app_role: "student", freelance_mode: false, is_student: true },
    recruiter: { app_role: "recruiter", freelance_mode: false, is_student: false },
    university: { app_role: "university", freelance_mode: false, is_student: false },
    freelancer: { app_role: "student", freelance_mode: true, is_student: false },
  };
  const meta = roleMap[role];

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/verify/callback`,
      data: meta,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { success: false, error: "email_already_registered" };
    }
    return { success: false, error: "registration_failed" };
  }

  redirect(`/${locale}/auth/verify?email=${encodeURIComponent(email)}`);
}

// ─── loginAction ───────────────────────────────────────────────────────────────

export async function loginAction(
  locale: string,
  redirectTo: string | null,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const ip = await getIP();

  try {
    await checkRateLimit("login", ip);
  } catch (e) {
    const msg = parseRateLimitError(e);
    return { success: false, error: msg ?? "rate_limited" };
  }

  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "invalid_credentials" };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { success: false, error: "email_not_confirmed" };
    }
    return { success: false, error: "invalid_credentials" };
  }

  // Check account_status from public.users
  const { data: dbUser } = await supabase
    .from("users")
    .select("account_status")
    .eq("id", data.user.id)
    .single();

  if (dbUser?.account_status === "suspended") {
    await supabase.auth.signOut();
    return { success: false, error: "account_suspended" };
  }
  if (dbUser?.account_status === "banned") {
    await supabase.auth.signOut();
    return { success: false, error: "account_banned" };
  }

  const destination =
    redirectTo && redirectTo.startsWith("/")
      ? redirectTo
      : `/${locale}/dashboard`;

  redirect(destination);
}

// ─── logoutAction ──────────────────────────────────────────────────────────────

export async function logoutAction(locale: string): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/auth/login`);
}

// ─── resendVerificationAction ──────────────────────────────────────────────────

export async function resendVerificationAction(
  locale: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = { email: formData.get("email") };
  const parsed = ResendSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "invalid_email" };

  const { email } = parsed.data;

  try {
    await checkRateLimit("resendVerification", email);
  } catch (e) {
    const msg = parseRateLimitError(e);
    return { success: false, error: msg ?? "rate_limited" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/verify/callback`,
    },
  });

  if (error) return { success: false, error: "resend_failed" };
  return { success: true };
}

// ─── requestPasswordResetAction ────────────────────────────────────────────────

export async function requestPasswordResetAction(
  locale: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = { email: formData.get("email") };
  const parsed = ResetRequestSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "invalid_email" };

  const { email } = parsed.data;

  try {
    await checkRateLimit("passwordResetRequest", email);
  } catch (e) {
    const msg = parseRateLimitError(e);
    return { success: false, error: msg ?? "rate_limited" };
  }

  const supabase = await createClient();
  // Always return success to avoid email enumeration
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/reset-password/confirm`,
  });

  return { success: true };
}

// ─── confirmPasswordResetAction ────────────────────────────────────────────────

export async function confirmPasswordResetAction(
  _locale: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const ip = await getIP();

  try {
    await checkRateLimit("passwordResetConfirm", ip);
  } catch (e) {
    const msg = parseRateLimitError(e);
    return { success: false, error: msg ?? "rate_limited" };
  }

  const raw = {
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = ResetConfirmSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first.message, field: first.path[0] as string };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return { success: false, error: "password_update_failed" };
  return { success: true };
}