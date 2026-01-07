"use client";

import { useRef, useState } from "react";
import type { Experience, Education, LinkItem } from "@/lib/resume-data";
import { blankExperience, blankEducation, blankLink } from "@/lib/resume-data";
import { useResume } from "./resume-provider";
import type { ResumeStep } from "./types";

const inputBubble =
  "w-full rounded-[999px] border border-[#EBECEE] bg-white px-5 py-3 text-sm text-[#1f2937] placeholder-[#a1aec6] focus:border-[#218dd0] focus:outline-none";
const textAreaBubble =
  "w-full rounded-[32px] border border-[#EBECEE] bg-white px-5 py-4 text-sm text-[#1f2937] placeholder-[#a1aec6] focus:border-[#218dd0] focus:outline-none";

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentExperienceIndex, setCurrentExperienceIndex] = useState(0);
  const [currentEducationIndex, setCurrentEducationIndex] = useState(0);
  const [currentLinkIndex, setCurrentLinkIndex] = useState(0);
  const [skillInput, setSkillInput] = useState("");

  const updatePersonal = (field: keyof typeof resume.personal, value: string) => {
    update((draft) => {
      draft.personal[field] = value;
      return draft;
    });
  };

  const handlePhotoUpload = (file: File | null) => {
    if (!file) return;
    
    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, выберите изображение");
      return;
    }
    
    // Проверка размера файла (максимум 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      alert("Размер файла не должен превышать 5MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result?.toString() || "";
      // Дополнительная проверка размера base64
      if (base64.length > 10 * 1024 * 1024) { // ~7.5MB в base64
        alert("Изображение слишком большое");
        return;
      }
      update((draft) => {
        draft.personal.photo = base64;
        return draft;
      });
    };
    reader.onerror = () => {
      alert("Ошибка при загрузке изображения");
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoRemove = () => {
    update((draft) => {
      draft.personal.photo = "";
      return draft;
    });
  };

  const ensureExperience = (draft: typeof resume) => {
    if (!draft.experience.length) {
      draft.experience.push(blankExperience());
    }
    return draft.experience;
  };

  const addExperience = () => {
    update((draft) => {
      draft.experience.push(blankExperience());
      return draft;
    });
    setCurrentExperienceIndex(resume.experience.length);
  };

  const removeExperience = (id: string) => {
    update((draft) => {
      draft.experience = draft.experience.filter((exp) => exp.id !== id);
      if (!draft.experience.length) {
        draft.experience.push(blankExperience());
      }
      return draft;
    });
    if (currentExperienceIndex >= resume.experience.length - 1) {
      setCurrentExperienceIndex(Math.max(0, resume.experience.length - 2));
    }
  };

  const updateExperience = <K extends keyof Experience>(id: string, field: K, value: Experience[K]) => {
    update((draft) => {
      const target = draft.experience.find((exp) => exp.id === id);
      if (target) {
        target[field] = value;
      }
      return draft;
    });
  };

  const ensureEducation = (draft: typeof resume) => {
    if (!draft.education.length) {
      draft.education.push(blankEducation());
    }
    return draft.education;
  };

  const addEducation = () => {
    update((draft) => {
      draft.education.push(blankEducation());
      return draft;
    });
    setCurrentEducationIndex(resume.education.length);
  };

  const removeEducation = (id: string) => {
    update((draft) => {
      draft.education = draft.education.filter((edu) => edu.id !== id);
      if (!draft.education.length) {
        draft.education.push(blankEducation());
      }
      return draft;
    });
    if (currentEducationIndex >= resume.education.length - 1) {
      setCurrentEducationIndex(Math.max(0, resume.education.length - 2));
    }
  };

  const updateEducation = <K extends keyof Education>(id: string, field: K, value: Education[K]) => {
    update((draft) => {
      const target = draft.education.find((edu) => edu.id === id);
      if (target) {
        target[field] = value;
      }
      return draft;
    });
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      update((draft) => {
        if (!draft.skills.includes(skillInput.trim())) {
          draft.skills.push(skillInput.trim());
        }
        return draft;
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    update((draft) => {
      draft.skills = draft.skills.filter((s) => s !== skill);
      return draft;
    });
  };

  const addLink = () => {
    update((draft) => {
      draft.links.push(blankLink());
      return draft;
    });
  };

  const removeLink = (id: string) => {
    update((draft) => {
      draft.links = draft.links.filter((item) => item.id !== id);
      if (!draft.links.length) {
        draft.links.push(blankLink());
      }
      return draft;
    });
  };

  const updateLink = <K extends keyof LinkItem>(id: string, field: K, value: LinkItem[K]) => {
    update((draft) => {
      const target = draft.links.find((item) => item.id === id);
      if (target) {
        target[field] = value;
      }
      return draft;
    });
  };

  if (activeStep === "experience") {
    const experiences = ensureExperience(resume);
    const currentExp = experiences[currentExperienceIndex] || experiences[0];

    return (
      <Card title="Опыт работы">
        {experiences.length > 1 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {experiences.map((exp, idx) => (
              <button
                key={exp.id}
                type="button"
                onClick={() => setCurrentExperienceIndex(idx)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
                  idx === currentExperienceIndex
                    ? "bg-[#218dd0] text-white"
                    : "border border-[#dfe7f4] bg-white text-[#5f6b84] hover:bg-[#f4f7fb]"
                }`}
              >
                <span>{exp.role || exp.company || `Опыт ${idx + 1}`}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeExperience(exp.id);
                  }}
                  className="ml-1 text-lg leading-none hover:opacity-70"
                >
                  ×
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className={inputBubble}
            placeholder="Должность"
            value={currentExp?.role || ""}
            onChange={(event) => updateExperience(currentExp.id, "role", event.target.value)}
          />
          <input
            className={inputBubble}
            placeholder="Компания"
            value={currentExp?.company || ""}
            onChange={(event) => updateExperience(currentExp.id, "company", event.target.value)}
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            className={inputBubble}
            placeholder="Начало работы"
            value={currentExp?.startDate || ""}
            onChange={(event) => updateExperience(currentExp.id, "startDate", event.target.value)}
          />
          <input
            className={inputBubble}
            placeholder="Конец работы"
            value={currentExp?.endDate || ""}
            onChange={(event) => updateExperience(currentExp.id, "endDate", event.target.value)}
          />
        </div>
        <input
          className={`${inputBubble} mt-4`}
          placeholder="Локация"
          value={currentExp?.location || ""}
          onChange={(event) => updateExperience(currentExp.id, "location", event.target.value)}
        />
        <textarea
          className={`${textAreaBubble} mt-4 min-h-[140px]`}
          placeholder="Обязанности"
          value={currentExp?.description || ""}
          onChange={(event) => updateExperience(currentExp.id, "description", event.target.value)}
        />
        <div className="mt-4 flex justify-start">
          <button className="rounded-full border border-[#dfe7f4] px-4 py-2 text-sm font-semibold text-[#218dd0] shadow-[0_10px_25px_rgba(33,141,208,0.15)]">
            ✦ Улучшить с ИИ
          </button>
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={addExperience}
            className="w-full rounded-[24px] bg-[#f4f7fb] px-5 py-3 text-center text-sm font-semibold text-[#5f6b84] hover:bg-[#eef2f7]"
          >
            + Добавить опыт
          </button>
        </div>
        <FormNav canPrev={canPrev} canNext={canNext} onPrev={onPrev} onNext={onNext} />
      </Card>
    );
  }

  if (activeStep === "education") {
    const educations = ensureEducation(resume);
    const currentEdu = educations[currentEducationIndex] || educations[0];

    return (
      <Card title="Образование">
        {educations.length > 1 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {educations.map((edu, idx) => (
              <button
                key={edu.id}
                type="button"
                onClick={() => setCurrentEducationIndex(idx)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
                  idx === currentEducationIndex
                    ? "bg-[#218dd0] text-white"
                    : "border border-[#dfe7f4] bg-white text-[#5f6b84] hover:bg-[#f4f7fb]"
                }`}
              >
                <span>{edu.school || `Образование ${idx + 1}`}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeEducation(edu.id);
                  }}
                  className="ml-1 text-lg leading-none hover:opacity-70"
                >
                  ×
                </span>
              </button>
            ))}
          </div>
        )}
        <input
          className={inputBubble}
          placeholder="Учебное заведение"
          value={currentEdu?.school || ""}
          onChange={(event) => updateEducation(currentEdu.id, "school", event.target.value)}
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            className={inputBubble}
            placeholder="Специальность"
            value={currentEdu?.degree || ""}
            onChange={(event) => updateEducation(currentEdu.id, "degree", event.target.value)}
          />
          <input
            className={inputBubble}
            placeholder="Уровень (например, Магистратура)"
            value={currentEdu?.level || ""}
            onChange={(event) => updateEducation(currentEdu.id, "level", event.target.value)}
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            className={inputBubble}
            placeholder="Начало обучения"
            value={currentEdu?.startDate || ""}
            onChange={(event) => updateEducation(currentEdu.id, "startDate", event.target.value)}
          />
          <input
            className={inputBubble}
            placeholder="Конец обучения"
            value={currentEdu?.endDate || ""}
            onChange={(event) => updateEducation(currentEdu.id, "endDate", event.target.value)}
          />
        </div>
        <input
          className={`${inputBubble} mt-4`}
          placeholder="Локация"
          value={currentEdu?.location || ""}
          onChange={(event) => updateEducation(currentEdu.id, "location", event.target.value)}
        />
        <textarea
          className={`${textAreaBubble} mt-4 min-h-[140px]`}
          placeholder="Описание"
          value={currentEdu?.description || ""}
          onChange={(event) => updateEducation(currentEdu.id, "description", event.target.value)}
        />
        <div className="mt-6">
          <button
            type="button"
            onClick={addEducation}
            className="w-full rounded-[24px] bg-[#f4f7fb] px-5 py-3 text-center text-sm font-semibold text-[#5f6b84] hover:bg-[#eef2f7]"
          >
            + Добавить образование
          </button>
        </div>
        <FormNav canPrev={canPrev} canNext={canNext} onPrev={onPrev} onNext={onNext} />
      </Card>
    );
  }

  if (activeStep === "skills") {
    return (
      <Card title="Навыки и ссылки">
        <div className="space-y-6">
          <div>
            <input
              className={inputBubble}
              placeholder="Навыки через Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
            />
            {resume.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {resume.skills.map((skill, index) => (
                  <div
                    key={`${skill}-${index}`}
                    className="flex items-center gap-2 rounded-full bg-[#eef2f7] px-3 py-1.5 text-sm text-[#2f3644]"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-[#6b7280] hover:text-[#d03b3b]"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            {resume.links.length > 1 && (
              <div className="mb-4 flex gap-2 overflow-x-auto">
                {resume.links.map((link, idx) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => setCurrentLinkIndex(idx)}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
                      idx === currentLinkIndex
                        ? "bg-[#218dd0] text-white"
                        : "border border-[#dfe7f4] bg-white text-[#5f6b84] hover:bg-[#f4f7fb]"
                    }`}
                  >
                    <span>{link.label || `Ссылка ${idx + 1}`}</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLink(link.id);
                        if (currentLinkIndex >= resume.links.length - 1) {
                          setCurrentLinkIndex(Math.max(0, resume.links.length - 2));
                        }
                      }}
                      className="ml-1 text-lg leading-none hover:opacity-70"
                    >
                      ×
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="space-y-4">
              {resume.links.length > 0 && (() => {
                const currentLink = resume.links[currentLinkIndex] || resume.links[0];
                return (
                  <div key={currentLink.id} className="space-y-3">
                    <input
                      className={inputBubble}
                      placeholder="Название (например, LinkedIn)"
                      value={currentLink.label || ""}
                      onChange={(event) => updateLink(currentLink.id, "label", event.target.value)}
                    />
                    <input
                      className={inputBubble}
                      placeholder="URL (например, https://linkedin.com/in/username)"
                      value={currentLink.url || ""}
                      onChange={(event) => updateLink(currentLink.id, "url", event.target.value)}
                    />
                  </div>
                );
              })()}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={addLink}
                  className="w-full rounded-[24px] bg-[#f4f7fb] px-5 py-3 text-center text-sm font-semibold text-[#5f6b84] hover:bg-[#eef2f7]"
                >
                  + Добавить ссылку
                </button>
              </div>
            </div>
          </div>
        </div>
        <FormNav canPrev={canPrev} canNext={canNext} onPrev={onPrev} onNext={onNext} />
      </Card>
    );
  }

  if (activeStep === "personal") {
    return (
      <Card title="Личные данные">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="h-24 w-24 overflow-hidden rounded-full border border-[#e0e6f2] bg-[#f9fbff]">
              <img
                src={resume.personal.photo || "/avatar.jpg"}
                alt="Аватар"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border border-[#dfe7f4] px-4 py-2 text-xs font-semibold text-[#218dd0] hover:bg-[#f4f7fb]"
              >
                Загрузить фото
              </button>
              {resume.personal.photo && (
                <button
                  type="button"
                  onClick={handlePhotoRemove}
                  className="rounded-full border border-[#f0dada] px-4 py-2 text-xs font-semibold text-[#d03b3b] hover:bg-[#fff2f2]"
                >
                  Удалить фото
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handlePhotoUpload(event.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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
            <div className="flex gap-4">
              <input
                className={`${inputBubble} flex-1`}
                placeholder="Email"
                value={resume.personal.email}
                onChange={(event) => updatePersonal("email", event.target.value)}
              />
              <input
                className={`${inputBubble} flex-1`}
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
  <section className="rounded-[40px] bg-white p-8 shadow-[0_35px_80px_rgba(28,64,128,0.08)]">
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
  <div className="mt-8 flex items-center justify-between">
    <button
      type="button"
      onClick={onPrev}
      disabled={!canPrev}
      className="rounded-full border border-[#dfe7f4] px-6 py-2 text-sm font-semibold text-[#5f6b84] disabled:cursor-not-allowed disabled:opacity-50"
    >
      Назад
    </button>
    <button
      type="button"
      onClick={onNext}
      disabled={!canNext}
      className="rounded-full bg-[#1891e4] px-8 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(24,145,228,0.35)] disabled:cursor-not-allowed disabled:bg-[#8bbfed]"
    >
      Далее
    </button>
  </div>
);
