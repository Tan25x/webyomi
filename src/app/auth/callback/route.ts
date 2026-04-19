import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Auth error:", error);
      return NextResponse.redirect("/settings?error=auth_failed");
    }
  }

  // Redirect to settings after auth
  return NextResponse.redirect("/settings?signed_in=true");
}