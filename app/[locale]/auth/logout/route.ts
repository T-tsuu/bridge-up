import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
}