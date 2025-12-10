"use client";

import { useState } from "react";
import { useResume } from "./resume-provider";

export const ExportButton = () => {
  const { resume, isSaving } = useResume();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const handleDownload = async () => {
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resume),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || "export_failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus("success");
      setMessage("");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Не удалось сформировать PDF. Проверьте данные и попробуйте снова.");
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
    <button
      onClick={handleDownload}
      disabled={status === "loading"}
        className="flex items-center gap-1 rounded-full bg-[#1891e4] px-[12px] py-[12px] text-sm font-semibold text-white shadow-[0_12px_30px_rgba(24,145,228,0.35)] transition hover:bg-[#0c74c1] disabled:cursor-not-allowed disabled:bg-[#8bbfed]"
      type="button"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 16V4"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 12L12 16L16 12"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 20H18"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {status === "loading" ? "Сохраняем..." : "Скачать"}
    </button>
      <div className="flex flex-col items-end gap-1">
        {isSaving && <p className="text-xs text-[#6b7280]">Сохраняем черновик…</p>}
        {message ? (
          <p
            className={`text-xs ${status === "error" ? "text-[#d03b3b]" : "text-[#2563eb]"}`}
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
};
