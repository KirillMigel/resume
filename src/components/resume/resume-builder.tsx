"use client";

import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ExportButton } from "./export-button";
import { ResumeForm } from "./resume-form";
import { ResumePreview } from "./resume-preview";
import { ResumeProvider } from "./resume-provider";
import type { ResumeStep } from "./types";
import { useAuth } from "../auth/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Step = { id: ResumeStep; label: string; icon: StepIcon };
type StepIcon = "user" | "briefcase" | "book" | "target";

const steps: Step[] = [
  { id: "personal", label: "Личные данные", icon: "user" },
  { id: "experience", label: "Опыт работы", icon: "briefcase" },
  { id: "education", label: "Образование", icon: "book" },
  { id: "skills", label: "Навыки", icon: "target" },
];

export const ResumeBuilder = ({ resumeId }: { resumeId?: string }) => {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace("/auth");
    }
  }, [session, isLoading, router]);

  const [activeStep, setActiveStep] = useState<ResumeStep>("personal");
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeStep),
  );
  const activeConfig = steps[activeIndex];

  const { canPrev, canNext, prevStep, nextStep } = useMemo(() => {
    const index = activeIndex;
    return {
      canPrev: index > 0,
      canNext: index < steps.length - 1,
      prevStep: () => setActiveStep(steps[Math.max(index - 1, 0)].id),
      nextStep: () => setActiveStep(steps[Math.min(index + 1, steps.length - 1)].id),
    };
  }, [activeIndex]);

  return (
    <ResumeProvider resumeId={resumeId}>
      <div className="min-h-screen bg-white py-8">
        <div className="mx-auto max-w-[1380px] space-y-8 px-4 sm:px-6 lg:px-0">
          <header className="flex items-center justify-between">
            <Link
              href="/dashboard"
              aria-label="Назад к моим резюме"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#dfe8f4] text-[#5f6b84] transition hover:border-[#218dd0] hover:text-[#218dd0]"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M14.5 7L9.5 12L14.5 17"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <ExportButton />
          </header>

          <div className="builder-grid">
            <StepSidebar activeStep={activeStep} onSelect={setActiveStep} />
            <ResumeForm
              activeLabel={activeConfig?.label ?? ""}
              activeStep={activeStep}
              onPrev={prevStep}
              onNext={nextStep}
              canPrev={canPrev}
              canNext={canNext}
            />
            <ResumePreview />
          </div>
        </div>
      </div>
    </ResumeProvider>
  );
};

const iconMap: Record<StepIcon, ReactElement> = {
  user: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 11.5C14.4853 11.5 16.5 9.48528 16.5 7C16.5 4.51472 14.4853 2.5 12 2.5C9.51472 2.5 7.5 4.51472 7.5 7C7.5 9.48528 9.51472 11.5 12 11.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5 20.5C5 16.9101 8.358 14 12 14C15.642 14 19 16.9101 19 20.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  briefcase: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.9609 15.9232V13.6407"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.8889 11.5464L19.8638 11.5647C17.7602 12.8605 14.9826 13.6431 11.9567 13.6431C8.93073 13.6431 6.16099 12.8605 4.05828 11.5647L4.03223 11.5464"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.96094 13.1734C3.96094 7.83021 5.96116 6.04886 11.9609 6.04886C17.9616 6.04886 19.9609 7.83021 19.9609 13.1734C19.9609 18.5166 17.9616 20.2979 11.9609 20.2979C5.96116 20.2979 3.96094 18.5166 3.96094 13.1734Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.7951 6.24123V5.69406C14.7951 4.59624 13.9935 3.70599 13.006 3.70599H10.9171C9.92958 3.70599 9.12793 4.59624 9.12793 5.69406V6.24123"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  book: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 6.825C13.4648 6.0162 15.0599 5.44817 16.7195 5.14435C17.0935 5.05824 17.4832 5.05687 17.8578 5.14034C18.2325 5.2238 18.5818 5.38978 18.8782 5.62524C19.1746 5.86069 19.4099 6.15917 19.5656 6.49702C19.7212 6.83486 19.7929 7.20288 19.7751 7.57195V14.2945C19.7517 15.1289 19.4381 15.9317 18.8842 16.5748C18.3304 17.2179 17.5683 17.6642 16.7195 17.8425C15.0599 18.1464 13.4648 18.7145 12 19.5232"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.0004 6.825C10.5357 6.0162 8.9406 5.44817 7.28099 5.14435C6.90699 5.05824 6.51727 5.05687 6.14262 5.14034C5.76798 5.2238 5.4187 5.38978 5.12233 5.62524C4.82596 5.86069 4.5906 6.15917 4.43493 6.49702C4.27926 6.83486 4.2075 7.20288 4.22532 7.57195V14.2945C4.24871 15.1289 4.56236 15.9317 5.1162 16.5748C5.67006 17.2179 6.43222 17.6642 7.28099 17.8425C8.9406 18.1464 10.5357 18.7145 12.0004 19.5232"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 19.5232V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  target: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 12C20 16.4182 16.4182 20 12 20C7.58172 20 4 16.4182 4 12C4 7.58172 7.58172 4 12 4C16.4182 4 20 7.58172 20 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M4 12H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 20V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 6V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 12H12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 14V12V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const StepSidebar = ({
  activeStep,
  onSelect,
}: {
  activeStep: ResumeStep;
  onSelect: (step: ResumeStep) => void;
}) => (
  <aside className="w-full max-w-[260px] rounded-[26px] bg-white px-6 py-6 shadow-[0_25px_60px_rgba(28,64,128,0.08)]">
    <ul className="space-y-1 text-[15px] font-semibold text-[#2f3644]">
      {steps.map((step) => {
        const isActive = step.id === activeStep;
        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onSelect(step.id)}
              className={`builder-step flex w-full items-center gap-3 rounded-[20px] px-2 py-2 text-left transition ${
                isActive
                  ? "builder-step-active text-[#218dd0]"
                  : "text-[#2f3644] hover:text-[#576070]"
              }`}
            >
              <span
                className="text-[currentColor]"
                style={{ color: isActive ? "#218dd0" : "#565d6b" }}
              >
                {iconMap[step.icon]}
              </span>
              <span className="whitespace-nowrap">{step.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  </aside>
);
