"use client";

import Image from "next/image";
import { useState } from "react";
import { useResume } from "./resume-provider";

export const ExportPanel = () => {
  const { resume } = useResume();
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState<string>("");

  const handleDownload = async () => {
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resume),
      });

      if (!response.ok) {
        throw new Error("export_failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setStatus("success");
      setMessage(`PDF готов (${(blob.size / 1024).toFixed(0)} КБ)`);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Не удалось сформировать PDF. Попробуйте еще раз.");
    }
  };

  return (
    <div className="rounded-[32px] border border-[#1d7ec2]/20 bg-gradient-to-br from-[#1d8cd0] to-[#0f4984] p-6 text-white shadow-[0_35px_80px_rgba(15,73,132,0.35)]">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-white/15 p-3">
          <Image src="/icon.svg" alt="" width={32} height={32} />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold">Экспорт в PDF</h3>
            <p className="text-sm text-white/80">
              Сервер собирает документ из JSON — верстка повторяет предпросмотр, а вес не превышает 200 КБ.
            </p>
          </div>
          <button
            className="inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#0f4984] shadow-lg transition hover:bg-[#f1f5ff] disabled:cursor-not-allowed disabled:bg-white/60"
            onClick={handleDownload}
            disabled={status === "loading"}
            type="button"
          >
            {status === "loading" ? "Формируем..." : "Скачать PDF"}
          </button>
          {message ? (
            <p className={`text-sm ${status === "error" ? "text-[#fed7d7]" : "text-emerald-200"}`}>{message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
