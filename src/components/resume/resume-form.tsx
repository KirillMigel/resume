"use client";

import { useState } from "react";
import type { Education, Experience } from "@/lib/resume-data";
import { blankEducation, blankExperience } from "@/lib/resume-data";
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
  const experience = resume.experience;
  const education = resume.education;
  const [skillInput, setSkillInput] = useState("");

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
  };

  const updateExperience = <K extends keyof Experience>(id: string, field: K, value: Experience[K]) => {
    update((draft) => {
      ensureExperience(draft);
      const target = draft.experience.find((item) => item.id === id);
      if (target) {
        target[field] = value;
      }
      return draft;
    });
  };
  const addExperience = () => {
    update((draft) => {
      draft.experience.push(blankExperience());
      return draft;
    });
  };

  const updateEducation = <K extends keyof Education>(id: string, field: K, value: Education[K]) => {
    update((draft) => {
      const target = draft.education.find((item) => item.id === id);
      if (target) {
        target[field] = value;
      }
      return draft;
    });
  };

  const addEducation = () => {
    update((draft) => {
      draft.education.push(blankEducation());
      return draft;
    });
  };

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    update((draft) => {
      draft.skills = Array.from(new Set([...(draft.skills || []), value]));
      return draft;
    });
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    update((draft) => {
      draft.skills = draft.skills.filter((item) => item !== skill);
      return draft;
    });
  };

  if (activeStep === "experience") {
    return (
      <Card title="Опыт работы">
        <div className="space-y-6">
          {experience.map((item) => (
            <div key={item.id} className="rounded-3xl border border-[#eef1f7] bg-[#f9fbff] p-4 sm:p-5">
              <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                <input
                  className={inputBubble}
                  placeholder="Должность"
                  value={item.role || ""}
                  onChange={(event) => updateExperience(item.id, "role", event.target.value)}
                />
                <input
                  className={inputBubble}
                  placeholder="Компания"
                  value={item.company || ""}
                  onChange={(event) => updateExperience(item.id, "company", event.target.value)}
                />
              </div>
              <div className="mt-4 grid gap-3 md:gap-4 md:grid-cols-2">
                <input
                  className={inputBubble}
                  placeholder="Начало работы"
                  value={item.startDate || ""}
                  onChange={(event) => updateExperience(item.id, "startDate", event.target.value)}
                />
                <input
                  className={inputBubble}
                  placeholder="Конец работы"
                  value={item.endDate || ""}
                  onChange={(event) => updateExperience(item.id, "endDate", event.target.value)}
                />
              </div>
              <button
                type="button"
                className={`mt-4 rounded-full border px-4 py-2 text-sm font-semibold ${
                  item.current ? "border-[#1891e4] text-[#1891e4]" : "border-[#dfe7f4] text-[#7a879d]"
                }`}
                onClick={() => updateExperience(item.id, "current", !item.current)}
              >
                Сейчас работаю тут
              </button>
              <input
                className={`${inputBubble} mt-4`}
                placeholder="Локация"
                value={item.location || ""}
                onChange={(event) => updateExperience(item.id, "location", event.target.value)}
              />
              <textarea
                className={`${textAreaBubble} mt-4 min-h-[140px]`}
                placeholder="Обязанности"
                value={item.description || ""}
                onChange={(event) => updateExperience(item.id, "description", event.target.value)}
              />
            </div>
          ))}
          <div className="flex items-center justify-start">
            <button
              type="button"
              onClick={addExperience}
              className="w-full rounded-[20px] border border-dashed border-[#dfe7f4] px-4 py-3 text-sm font-semibold text-[#218dd0] hover:bg-[#f4f7fb] sm:w-auto"
            >
              + Добавить опыт
            </button>
          </div>
          <FormNav canPrev={canPrev} canNext={canNext} onPrev={onPrev} onNext={onNext} />
        </div>
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

  if (activeStep === "education") {
    return (
      <Card title="">
        <div className="space-y-6">
          {education.map((item) => (
            <div key={item.id} className="space-y-4">
              <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                <input
                  className={inputBubble}
                  placeholder="Учебное заведение"
                  value={item.school || ""}
                  onChange={(event) => updateEducation(item.id, "school", event.target.value)}
                />
                <input
                  className={inputBubble}
                  placeholder="Направление / степень"
                  value={item.degree || ""}
                  onChange={(event) => updateEducation(item.id, "degree", event.target.value)}
                />
              </div>
              <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                <input
                  className={inputBubble}
                  placeholder="Уровень (бакалавр, магистр...)"
                  value={item.level || ""}
                  onChange={(event) => updateEducation(item.id, "level", event.target.value)}
                />
                <input
                  className={inputBubble}
                  placeholder="Локация"
                  value={item.location || ""}
                  onChange={(event) => updateEducation(item.id, "location", event.target.value)}
                />
              </div>
              <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                <input
                  className={inputBubble}
                  placeholder="Начало"
                  value={item.startDate || ""}
                  onChange={(event) => updateEducation(item.id, "startDate", event.target.value)}
                />
                <input
                  className={inputBubble}
                  placeholder="Окончание"
                  value={item.endDate || ""}
                  onChange={(event) => updateEducation(item.id, "endDate", event.target.value)}
                />
              </div>
              <textarea
                className={`${textAreaBubble} mt-4 min-h-[120px]`}
                placeholder="Описание / достижения"
                value={item.description || ""}
                onChange={(event) => updateEducation(item.id, "description", event.target.value)}
              />
            </div>
          ))}
          <div className="flex items-center justify-start">
            <button
              type="button"
              onClick={addEducation}
              className="w-full rounded-[20px] border border-dashed border-[#dfe7f4] px-4 py-3 text-sm font-semibold text-[#218dd0] hover:bg-[#f4f7fb] sm:w-auto"
            >
              + Добавить образование
            </button>
          </div>
          <FormNav canPrev={canPrev} canNext={canNext} onPrev={onPrev} onNext={onNext} />
        </div>
      </Card>
    );
  }

  if (activeStep === "skills") {
    return (
      <Card title="Навыки и ссылки">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className={inputBubble}
              placeholder="Навык"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
            />
            <button
              type="button"
              onClick={addSkill}
              className="rounded-full bg-[#1891e4] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(24,145,228,0.3)] transition hover:bg-[#0c74c1]"
            >
              Добавить
            </button>
          </div>
          {resume.skills.length ? (
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-2 rounded-full bg-[#eef2f7] px-4 py-2 text-sm text-[#2f3644]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-[#9ca3af] transition hover:text-[#d03b3b]"
                    aria-label={`Удалить ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#7c8aa5]">Добавьте навыки, чтобы показать вашу экспертизу.</p>
          )}
          <FormNav canPrev={canPrev} canNext={canNext} onPrev={onPrev} onNext={onNext} />
        </div>
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

const Card = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <section className="rounded-[32px] bg-white p-6 shadow-[0_25px_60px_rgba(28,64,128,0.08)] sm:rounded-[40px] sm:p-8">
    {title ? <p className="mb-5 text-base font-semibold text-[#1f2937] sm:mb-6">{title}</p> : null}
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
