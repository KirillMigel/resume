"use client";

import type { Experience } from "@/lib/resume-data";
import { blankExperience } from "@/lib/resume-data";
import { useResume } from "./resume-provider";
import type { ResumeStep } from "./types";

const inputBubble =
  "w-full rounded-[999px] border border-[#e0e6f2] bg-[#f9fbff] px-4 py-3 text-sm text-[#1f2937] placeholder-[#a1aec6] focus:border-[#218dd0] focus:bg-white focus:outline-none sm:px-5";
const textAreaBubble =
  "w-full rounded-[32px] border border-[#e0e6f2] bg-[#f9fbff] px-4 py-4 text-sm text-[#1f2937] placeholder-[#a1aec6] focus:border-[#218dd0] focus:bg-white focus:outline-none sm:px-5";

type ResumeFormProps = {
  activeStep: ResumeStep;
  activeLabel: string;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
};

export const ResumeForm = ({
  activeStep,
  activeLabel,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: ResumeFormProps) => {
  const { resume, update } = useResume();
  const experience = resume.experience[0];

  const updatePersonal = (field: keyof typeof resume.personal, value: string) => {
    update((draft) => {
      draft.personal[field] = value;
      return draft;
    });
  };

  const ensureExperience = (draft: typeof resume) => {
    if (!draft.experience.length) {
      draft.experience.push(blankExperience());
    }
    return draft.experience[0];
  };

  const updateExperience = <K extends keyof Experience>(field: K, value: Experience[K]) => {
    update((draft) => {
      const target = ensureExperience(draft);
      target[field] = value;
      return draft;
    });
  };

  if (activeStep === "experience") {
    return (
      <Card title="Опыт работы">
        <div className="grid gap-3 md:gap-4 md:grid-cols-2">
          <input
            className={inputBubble}
            placeholder="Должность"
            value={experience?.role || ""}
            onChange={(event) => updateExperience("role", event.target.value)}
          />
          <input
            className={inputBubble}
            placeholder="Компания"
            value={experience?.company || ""}
            onChange={(event) => updateExperience("company", event.target.value)}
          />
        </div>
        <div className="mt-4 grid gap-3 md:gap-4 md:grid-cols-2">
          <input
            className={inputBubble}
            placeholder="Начало работы"
            value={experience?.startDate || ""}
            onChange={(event) => updateExperience("startDate", event.target.value)}
          />
          <input
            className={inputBubble}
            placeholder="Конец работы"
            value={experience?.endDate || ""}
            onChange={(event) => updateExperience("endDate", event.target.value)}
          />
        </div>
        <button
          type="button"
          className={`mt-4 rounded-full border px-4 py-2 text-sm font-semibold ${
            experience?.current ? "border-[#1891e4] text-[#1891e4]" : "border-[#dfe7f4] text-[#7a879d]"
          }`}
          onClick={() => updateExperience("current", !experience?.current)}
        >
          Сейчас работаю тут
        </button>
        <input
          className={`${inputBubble} mt-4`}
          placeholder="Локация"
          value={experience?.location || ""}
          onChange={(event) => updateExperience("location", event.target.value)}
        />
        <textarea
          className={`${textAreaBubble} mt-4 min-h-[140px]`}
          placeholder="Обязанности"
          value={experience?.description || ""}
          onChange={(event) => updateExperience("description", event.target.value)}
        />
        <div className="mt-4 flex justify-start">
          <button className="w-full rounded-full border border-[#dfe7f4] px-4 py-2 text-sm font-semibold text-[#218dd0] shadow-[0_10px_25px_rgba(33,141,208,0.15)] sm:w-auto">
            ✦ Улучшить с ИИ
          </button>
        </div>
        <div className="mt-6 rounded-[24px] bg-[#f4f7fb] px-5 py-3 text-center text-sm font-semibold text-[#5f6b84]">
          + Добавить опыт
        </div>
        <FormNav canPrev={canPrev} canNext={canNext} onPrev={onPrev} onNext={onNext} />
      </Card>
    );
  }

  if (activeStep === "personal") {
    return (
      <Card title="Личные данные">
        <div className="grid gap-3 md:gap-4 md:grid-cols-2">
          <input
            className={inputBubble}
            placeholder="Имя"
            value={resume.personal.fullName}
            onChange={(event) => updatePersonal("fullName", event.target.value)}
          />
          <input
            className={inputBubble}
            placeholder="Фамилия"
            value={resume.personal.lastName}
            onChange={(event) => updatePersonal("lastName", event.target.value)}
          />
        </div>
        <div className="mt-4 space-y-4">
          <input
            className={inputBubble}
            placeholder="Желаемая должность"
            value={resume.personal.title}
            onChange={(event) => updatePersonal("title", event.target.value)}
          />
          <input
            className={inputBubble}
            placeholder="Локация"
            value={resume.personal.location}
            onChange={(event) => updatePersonal("location", event.target.value)}
          />
          <div className="grid gap-3 md:gap-4 md:grid-cols-2">
            <input
              className={inputBubble}
              placeholder="Email"
              value={resume.personal.email}
              onChange={(event) => updatePersonal("email", event.target.value)}
            />
            <input
              className={inputBubble}
              placeholder="Телефон"
              value={resume.personal.phone}
              onChange={(event) => updatePersonal("phone", event.target.value)}
            />
          </div>
          <textarea
            className={`${textAreaBubble} min-h-[120px]`}
            placeholder="О себе"
            value={resume.summary}
            onChange={(event) =>
              update((draft) => {
                draft.summary = event.target.value;
                return draft;
              })
            }
          />
        </div>
        <FormNav canPrev={canPrev} canNext={canNext} onPrev={onPrev} onNext={onNext} />
      </Card>
    );
  }

  return (
    <Card title={activeLabel || "Раздел"}>
      <p className="text-sm text-[#7c8aa5]">Этот шаг мы ещё отрисовываем. Но вы уже можете заполнить другие данные.</p>
      <FormNav canPrev={canPrev} canNext={canNext} onPrev={onPrev} onNext={onNext} />
    </Card>
  );
};

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-[32px] bg-white p-6 shadow-[0_25px_60px_rgba(28,64,128,0.08)] sm:rounded-[40px] sm:p-8">
    <p className="mb-5 text-base font-semibold text-[#1f2937] sm:mb-6">{title}</p>
    {children}
  </section>
);

const FormNav = ({
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) => (
  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <button
      type="button"
      onClick={onPrev}
      disabled={!canPrev}
      className="w-full rounded-full border border-[#dfe7f4] px-6 py-2 text-sm font-semibold text-[#5f6b84] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      Назад
    </button>
    <button
      type="button"
      onClick={onNext}
      disabled={!canNext}
      className="w-full rounded-full bg-[#1891e4] px-8 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(24,145,228,0.35)] disabled:cursor-not-allowed disabled:bg-[#8bbfed] sm:w-auto"
    >
      Далее
    </button>
  </div>
);
