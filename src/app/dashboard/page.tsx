"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { demoResume } from "@/lib/resume-data";
import { createResume, deleteResume, fetchResumes, type ResumeListItem } from "@/lib/supabase/resumes";

export default function DashboardPage() {
  const router = useRouter();
  const { session, isLoading, signOut } = useAuth();
  const [items, setItems] = useState<ResumeListItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const userEmail = session?.user?.email || "";
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isProfileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-menu-button]") || target?.closest("[data-menu-content]")) return;
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace("/auth");
      return;
    }
    setStatus("loading");
    fetchResumes()
      .then((data) => setItems(data))
      .catch((error) => {
        console.error(error);
        setMessage("Не удалось загрузить резюме.");
        setStatus("error");
      })
      .finally(() => setStatus("idle"));
  }, [session, isLoading, router]);

  const handleCreate = async () => {
    if (!session?.user?.id) {
      setMessage("Нет сессии пользователя.");
      return;
    }
    try {
      setStatus("loading");
      const id = await createResume({
        title: "Новое резюме",
        data: {
          ...demoResume,
          personal: { ...demoResume.personal, title: "Новое резюме" },
        },
        userId: session.user.id,
      });
      router.push(`/builder?id=${id}`);
    } catch (error) {
      console.error(error);
      setMessage("Не удалось создать резюме.");
    } finally {
      setStatus("idle");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setStatus("loading");
      await deleteResume(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      setMessage("Не удалось удалить резюме.");
    } finally {
      setStatus("idle");
    }
  };

  const handleDuplicate = async (id: string) => {
    const src = items.find((item) => item.id === id);
    if (!session?.user?.id) {
      setMessage("Нет сессии пользователя.");
      return;
    }
    try {
      setStatus("loading");
      const newId = await createResume({
        title: `${src?.title || "Резюме"} копия`,
        data: {
          ...demoResume,
          personal: { ...demoResume.personal, title: src?.title || "Резюме" },
        },
        userId: session.user.id,
      });
      setItems((prev) => [{ id: newId, title: src?.title || "Резюме", updated_at: new Date().toISOString() }, ...prev]);
    } catch (error) {
      console.error(error);
      setMessage("Не удалось дублировать резюме.");
    } finally {
      setStatus("idle");
    }
  };

  const formatDate = (value: string | null) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("ru-RU");
  };

  const handleOpenResume = (id: string) => {
    router.push(`/builder?id=${id}`);
  };

  return (
    <main className="min-h-screen bg-white pb-16">
      <div className="mx-auto max-w-[1240px] px-4 pt-12 lg:px-0">
        <section className="space-y-8">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
            <Image src="/resumio-logo.svg" alt="Resumio" width={143} height={40} priority />
            </div>
            <div
              className="relative"
              onMouseEnter={() => setProfileOpen(true)}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e3e2e7] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
                <Image src="/user.svg" alt="Профиль" width={24} height={24} />
              </div>
              {isProfileOpen && (
                <div className="absolute right-0 z-20 mt-3 w-44 rounded-2xl bg-white p-3 text-sm text-[#2f3644] shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                  <p className="truncate font-semibold">{userEmail || "Гость"}</p>
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      router.replace("/auth");
                    }}
                    className="mt-2 w-full rounded-full bg-[#f5f7fb] px-3 py-2 text-xs font-semibold text-[#d03b3b] hover:bg-[#f0f2f8]"
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#1c2335]">Мои резюме</h1>
            <button
              type="button"
              onClick={handleCreate}
              disabled={status === "loading"}
              className="flex items-center gap-2 rounded-full bg-[#218dd0] px-4 py-2.5 text-[15px] font-semibold tracking-[-0.01em] text-white shadow-[0_8px_24px_rgba(33,141,208,0.25)] transition hover:bg-[#0a78d2] disabled:cursor-not-allowed disabled:bg-[#8bbfed]"
            >
              <Image src="/plus.svg" alt="+" width={20} height={20} />
              <span className="leading-none">Создать резюме</span>
            </button>
          </div>

          {status === "loading" && <p className="text-sm text-[#6b7280]">Загружаем...</p>}
          {message && <p className="text-sm text-[#d03b3b]">{message}</p>}
          {items.length === 0 && status === "idle" ? (
            <div className="rounded-[28px] bg-white p-6 text-sm text-[#6b7280] shadow-[0_5px_25px_rgba(120,120,120,0.1)]">
              У вас пока нет резюме. Нажмите «Создать новое», чтобы начать.
            </div>
          ) : (
          <div className="grid gap-6 md:grid-cols-2">
              {items.map((resume) => {
                const date = formatDate(resume.updated_at) || "—";
                const isMenuOpen = openMenuId === resume.id;
                return (
              <article
                key={resume.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOpenResume(resume.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleOpenResume(resume.id);
                      }
                    }}
                    className="group relative flex cursor-pointer items-center justify-between rounded-[28px] bg-white px-5 py-4 shadow-[0_5px_25px_rgba(120,120,120,0.1)] transition hover:shadow-[0_7px_30px_rgba(120,120,120,0.12)] focus:outline-none focus:ring-2 focus:ring-[#0b85e9]/50"
              >
                <div className="flex items-center gap-4">
                      <img
                        src={resume.photo || "/avatar.jpg"}
                    alt="avatar"
                        width={58}
                        height={58}
                        className="h-[58px] w-[58px] rounded-2xl object-cover"
                  />
                  <div>
                        <p className="text-lg font-semibold text-[#1c2335] transition-colors group-hover:text-[#218dd0]">
                          {resume.role || resume.title || "Резюме"}
                        </p>
                        <p className="text-sm text-[#8a96ad]">{date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(isMenuOpen ? null : resume.id);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[#5b6b83] transition hover:border hover:border-[#0b85e9] hover:text-[#0b85e9]"
                        data-menu-button
                  >
                        <Image src="/edit-3.svg" alt="Меню" width={18} height={18} />
                      </button>
                      {isMenuOpen && (
                        <div
                          className="absolute right-4 top-14 z-30 w-40 rounded-2xl bg-white p-3 text-sm text-[#2f3644] shadow-[0_20px_50px_rgba(15,23,42,0.14)]"
                          data-menu-content
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              handleDuplicate(resume.id);
                              setOpenMenuId(null);
                            }}
                            className="block w-full rounded-[12px] px-3 py-2 text-left transition hover:bg-[#f5f7fb]"
                          >
                            Дублировать
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleDelete(resume.id);
                              setOpenMenuId(null);
                            }}
                            className="mt-1 block w-full rounded-[12px] px-3 py-2 text-left text-[#d03b3b] transition hover:bg-[#fff2f2]"
                          >
                            Удалить
                  </button>
                        </div>
                      )}
                </div>
              </article>
                );
              })}
          </div>
          )}
        </section>
      </div>
    </main>
  );
}
