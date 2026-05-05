import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(`/${locale}/onboarding`, request.url));
    }
  }

  // Code missing or exchange failed → back to verify page with error flag
  return NextResponse.redirect(
    new URL(`/${locale}/auth/verify?error=confirmation_failed`, request.url)
  );
}