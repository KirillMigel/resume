import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Health check endpoint
 * Используется для проверки работоспособности сервиса
 */
export async function GET() {
  const checks: Record<string, { status: "ok" | "error"; message?: string }> = {};

  // Проверка Supabase подключения
  try {
    const { error } = await supabase.from("resumes").select("id").limit(1);
    if (error) {
      checks.database = { status: "error", message: error.message };
    } else {
      checks.database = { status: "ok" };
    }
  } catch (error) {
    const err = error as { message?: string };
    checks.database = { status: "error", message: err?.message || "Unknown error" };
  }

  // Проверка переменных окружения
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  checks.environment = {
    status: hasSupabaseUrl && hasSupabaseKey ? "ok" : "error",
    message: !hasSupabaseUrl || !hasSupabaseKey 
      ? "Missing Supabase environment variables" 
      : undefined,
  };

  // Общий статус
  const allOk = Object.values(checks).every((check) => check.status === "ok");
  const status = allOk ? 200 : 503;

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status }
  );
}

