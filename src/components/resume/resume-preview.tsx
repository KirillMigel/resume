"use client";

import { useMemo } from "react";
import { useResume } from "./resume-provider";

export const ResumePreview = () => {
  const { resume } = useResume();

  const fullName = useMemo(
    () => [resume.personal.fullName, resume.personal.lastName].filter(Boolean).join(" ").trim(),
    [resume.personal.fullName, resume.personal.lastName],
  );

  const density = resume.theme?.density === "compact" ? "compact" : "normal";
  const sectionGap = density === "compact" ? "space-y-3" : "space-y-4";
  const lineGap = density === "compact" ? "leading-[1.45]" : "leading-[1.6]";
  const accent = resume.theme?.accent || "#218dd0";
  const photoSrc = resume.personal.photo?.trim() || "/avatar.jpg";

  const contacts = useMemo(
    () =>
      ({
        row1: [resume.personal.location, resume.personal.email].filter(Boolean),
        row2: [resume.personal.phone, resume.personal.website].filter(Boolean),
      }),
    [resume.personal.email, resume.personal.location, resume.personal.phone, resume.personal.website],
  );

  return (
    <div className="flex h-full flex-col rounded-[40px] bg-white px-8 py-8 shadow-[0_35px_90px_rgba(23,56,108,0.08)]">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-white shadow-[0_10px_25px_rgba(15,23,42,0.18)]">
          <img src={photoSrc} alt="Avatar" className="h-full w-full object-cover" />
        </div>
        <div className="space-y-1">
          <p className="text-[20px] font-semibold leading-[1.2] text-[#1d2433]">{fullName || "Имя Фамилия"}</p>
          <p className="text-[16px] font-normal text-[#3b4554]">{resume.personal.title || "Product Designer"}</p>
          <div className="mt-2 space-y-1 text-[14px] text-[#4b5565]">
            {contacts.row1.length ? (
              <div className="flex flex-wrap items-center gap-2">
                {contacts.row1.map((item, idx) => (
                  <span key={`c1-${item}-${idx}`} className="flex items-center gap-2">
                    {idx > 0 && <span className="text-[#9ca3af]">•</span>}
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
            {contacts.row2.length ? (
              <div className="flex flex-wrap items-center gap-2">
                {contacts.row2.map((item, idx) => (
                  <span key={`c2-${item}-${idx}`} className="flex items-center gap-2">
                    {idx > 0 && <span className="text-[#9ca3af]">•</span>}
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto">
        <div className="space-y-8">
          {resume.summary ? (
            <Section title=" " accent={accent}>
              <p className={`text-[14px] text-[#2f3644] ${lineGap}`}>{resume.summary}</p>
            </Section>
          ) : null}

          {resume.experience.length ? (
            <Section title="Опыт работы" accent={accent}>
              <div className="space-y-3">
                {resume.experience.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-[16px] font-semibold text-[#1f2937]">
                      <span>{item.role || "Должность"}</span>
                      <span className="text-[#9ca3af]">•</span>
                      <span>{item.company || "Компания"}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[14px] text-[#6b7280]">
                      <span>
                        {[item.startDate, item.current && !item.endDate ? "Настоящее время" : item.endDate]
                          .filter(Boolean)
                          .join(" — ")}
                      </span>
                      {item.location ? (
                        <>
                          <span className="text-[#9ca3af]">•</span>
                          <span>{item.location}</span>
                        </>
                      ) : null}
                    </div>
                    {item.description ? (
                      <p className={`text-[14px] text-[#2f3644] ${lineGap}`}>{item.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {resume.education.length ? (
            <Section title="Образование" accent={accent}>
              <div className="space-y-3">
                {resume.education.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <p className="text-[16px] font-semibold text-[#1f2937]">{item.school || "Учебное заведение"}</p>
                    <p className="text-[14px] text-[#2f3644]">
                      {[item.degree || "Специальность", item.level].filter(Boolean).join(" • ")}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[14px] text-[#6b7280]">
                      <span>{[item.startDate, item.current && !item.endDate ? "Настоящее время" : item.endDate].filter(Boolean).join(" — ")}</span>
                      {item.location ? (
                        <>
                          <span className="text-[#9ca3af]">•</span>
                          <span>{item.location}</span>
                        </>
                      ) : null}
                    </div>
                    {item.description ? (
                      <p className={`text-[14px] text-[#2f3644] ${lineGap}`}>{item.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {resume.skills.length ? (
            <Section title="Навыки" accent={accent}>
              <div className="flex flex-wrap gap-2 text-[14px] text-[#2f3644]">
                {resume.skills.map((skill, index) => (
                  <span key={`${skill}-${index}`} className="rounded-full bg-[#eef2f7] px-3 py-1">
                    {skill}
                  </span>
                ))}
              </div>
            </Section>
          ) : null}

          {resume.links.length ? (
            <Section title="" accent={accent}>
              <div className={sectionGap}>
                {resume.links.map((link) => (
                  <div key={link.id} className="flex flex-col text-[14px] text-[#1f2937]">
                    {link.label ? <span className="font-semibold">{link.label}</span> : null}
                    {link.url ? (
                      <a href={link.url} className="text-[#218dd0] underline-offset-2 hover:underline">
                        {link.url}
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </Section>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <div className="flex items-center gap-2">
      {title.trim() ? <p className="text-[15px] font-semibold text-[#6b7280]">{title}</p> : null}
    </div>
    {children}
  </section>
);
