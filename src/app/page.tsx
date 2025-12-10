import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 text-center">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Image src="/resumio-logo.svg" alt="Resumio" width={143} height={40} priority />
            <Link
              href="/dashboard"
              className="text-base font-medium text-[#333948] transition hover:text-[#218dd0]"
            >
              Блог
            </Link>
          </div>
          <Link
            href="/dashboard"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e3e2e7] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition hover:border-[#218dd0]"
            aria-label="Профиль"
          >
            <Image src="/user.svg" alt="Профиль" width={24} height={24} />
          </Link>
        </header>

        <div className="mt-16 flex flex-col items-center gap-6">
          <Image
            src="/resume-hero.png"
            alt="Пример резюме Resumio"
            width={127}
            height={112}
            priority
          />
          <h1 className="text-[42px] font-semibold leading-[1.2] tracking-[-0.04em] text-[#212633]">
            Создайте эффективное резюме
            <br />
            <span className="text-[#218dd0]">с правильной подачей опыта</span>
            <br />
            за несколько минут
          </h1>
          <p className="text-[20px] font-normal leading-[130%] tracking-[-0.02em] text-[#8a95a8] mt-0">
            Чтобы увеличить шанс пройти первичный скрининг
            <br />
            и повысить шансы на трудоустройство
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-[#218DD0] px-6 py-3 text-[16px] font-semibold text-white shadow-[0_5px_20px_rgba(24,145,228,0.35)] transition hover:bg-[#0c74c1] mt-2"
          >
            Создать резюме
          </Link>
        </div>
      </div>
    </main>
  );
}
