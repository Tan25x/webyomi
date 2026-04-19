import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect("/settings?error=supabase_not_configured");
  }
  
  const { createServerClient } = await import("@supabase/ssr");
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return []; },
      setAll() {},
    },
  });
  
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Auth error:", error);
      return NextResponse.redirect("/settings?error=auth_failed");
    }
  }

  return NextResponse.redirect("/settings?signed_in=true");
}