import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import * as db from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }
    
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from Server Component
          }
        },
      },
    });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case "push": {
        const localData = await db.exportData();
        
        const { error: upsertError } = await supabase
          .from("user_data")
          .upsert({
            user_id: user.id,
            data: localData,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
        
        if (upsertError) {
          return NextResponse.json({ error: upsertError.message }, { status: 500 });
        }
        
        return NextResponse.json({ success: true, data: localData });
      }
      
      case "pull": {
        const { data: cloudData, error: fetchError } = await supabase
          .from("user_data")
          .select("data, updated_at")
          .eq("user_id", user.id)
          .single();
        
        if (fetchError || !cloudData) {
          return NextResponse.json({ error: "No cloud data found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: cloudData.data, updatedAt: cloudData.updated_at });
      }
      
      case "merge": {
        const localData = await db.exportData();
        
        const { data: cloudData, error: fetchError } = await supabase
          .from("user_data")
          .select("data")
          .eq("user_id", user.id)
          .single();
        
        if (fetchError || !cloudData) {
          const { error: upsertError } = await supabase
            .from("user_data")
            .upsert({
              user_id: user.id,
              data: localData,
              updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" });
          
          if (upsertError) {
            return NextResponse.json({ error: upsertError.message }, { status: 500 });
          }
          
          return NextResponse.json({ success: true, data: localData });
        }
        
        const merged = mergeData(localData, cloudData.data as { manga?: { id: string }[]; chapters?: { id: string }[] });
        
        const { error: upsertError } = await supabase
          .from("user_data")
          .upsert({
            user_id: user.id,
            data: merged,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
        
        if (upsertError) {
          return NextResponse.json({ error: upsertError.message }, { status: 500 });
        }
        
        return NextResponse.json({ success: true, data: merged });
      }
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Sync API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function mergeData(
  local: { manga?: { id: string }[]; chapters?: { id: string }[] },
  cloud: { manga?: { id: string }[]; chapters?: { id: string }[] }
) {
  const mergedManga = mergeArraysById(local.manga || [], cloud.manga || []);
  const mergedChapters = mergeArraysById(local.chapters || [], cloud.chapters || []);
  
  return {
    manga: mergedManga,
    chapters: mergedChapters,
  };
}

function mergeArraysById<T extends { id: string }>(local: T[], cloud: T[]): T[] {
  const map = new Map<string, T>();
  
  for (const item of cloud) {
    map.set(item.id, item);
  }
  
  for (const item of local) {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  }
  
  return Array.from(map.values());
}