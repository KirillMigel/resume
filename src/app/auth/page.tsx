"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage("Введите почту и пароль.");
      setStatus("error");
      return;
    }
    
    // Проверка конфигурации Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === "https://example.supabase.co") {
      setStatus("error");
      setMessage("Supabase не настроен. Создайте файл .env.local с переменными NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY");
      return;
    }
    
    setStatus("loading");
    setMessage("");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setStatus("sent");
        setMessage("Аккаунт создан. Вы вошли в систему.");
        router.replace("/dashboard");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setStatus("error");
      setMessage(err?.message || "Не удалось выполнить вход.");
    } finally {
      setStatus((prev) => (prev === "sent" ? "sent" : "idle"));
    }
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey && supabaseUrl !== "https://example.supabase.co";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7fbff] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_25px_80px_rgba(23,56,108,0.08)]">
        <h1 className="text-2xl font-semibold text-[#1f2937]">Вход по email и паролю</h1>
        <p className="mt-2 text-sm text-[#6b7280]">
          Укажите почту и пароль, чтобы войти или создать аккаунт.
        </p>
        {!isSupabaseConfigured && (
          <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Supabase не настроен</p>
            <p className="text-xs text-yellow-700">
              Создайте файл <code className="bg-yellow-100 px-1 rounded">.env.local</code> в корне проекта с переменными:
            </p>
            <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...`}
            </pre>
            <p className="text-xs text-yellow-700 mt-2">
              Получите эти значения на{" "}
              <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline">
                app.supabase.com
              </a>
            </p>
          </div>
        )}
        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-[999px] border border-[#ebecee] bg-white px-5 py-3 text-sm text-[#1f2937] placeholder-[#9aa3b5] focus:border-[#218dd0] focus:outline-none"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-[999px] border border-[#ebecee] bg-white px-5 py-3 text-sm text-[#1f2937] placeholder-[#9aa3b5] focus:border-[#218dd0] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="w-full rounded-full bg-[#1891e4] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(24,145,228,0.35)] transition hover:bg-[#0c74c1] disabled:cursor-not-allowed disabled:bg-[#8bbfed]"
          >
            {status === "loading"
              ? "Обрабатываем..."
              : mode === "login"
                ? "Войти"
                : "Создать аккаунт"}
          </button>
          <div className="flex items-center justify-center gap-2 text-xs text-[#6b7280]">
            <span>{mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}</span>
            <button
              type="button"
              onClick={() => {
                setMode((prev) => (prev === "login" ? "signup" : "login"));
                setMessage("");
              }}
              className="font-semibold text-[#218dd0] hover:text-[#0c74c1]"
            >
              {mode === "login" ? "Создать" : "Войти"}
            </button>
          </div>
        </div>
        {message ? (
          <p
            className={`mt-3 text-sm ${
              status === "error" ? "text-[#d03b3b]" : "text-[#0f766e]"
            }`}
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}
      </div>
    </main>
  );
}

