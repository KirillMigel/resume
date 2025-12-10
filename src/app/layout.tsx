import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { SentryInit } from "@/components/sentry-init";

const inter = localFont({
  variable: "--font-inter",
  src: [
    {
      path: "../../public/fonts/Inter-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Inter-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Resume Lab — конструктор резюме",
  description:
    "Сервис для быстрого создания резюме с живым предпросмотром и экспортом в компактный PDF.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <SentryInit />
            <div className="flex-1">{children}</div>
            <footer className="border-t border-[#e5e7eb] bg-white px-6 py-4 text-xs text-[#6b7280]">
              <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4">
                <span>© {new Date().getFullYear()} Resumio</span>
                <a href="/legal/privacy" className="underline-offset-2 hover:underline">
                  Политика конфиденциальности
                </a>
                <a href="/legal/terms" className="underline-offset-2 hover:underline">
                  Условия использования
                </a>
                <span className="text-[#94a3b8]">support@example.com</span>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
