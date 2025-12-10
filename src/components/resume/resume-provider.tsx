"use client";

/* eslint-disable react-hooks/set-state-in-effect -- hydration из localStorage требует установки state в эффекте */

import {
  ReactNode,
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ResumeData, blankEducation, blankExperience, demoResume, emptyResume } from "@/lib/resume-data";
import { useAuth } from "@/components/auth/auth-provider";
import { fetchResume, updateResume } from "@/lib/supabase/resumes";

const applyPersonalDefaults = (data: ResumeData): ResumeData => {
  const experience =
    (data.experience && data.experience.length ? data.experience : [blankExperience()]).map((item) => ({
      ...item,
      location: item.location ?? "",
      current: item.current ?? false,
    }));
  const education =
    (data.education && data.education.length ? data.education : [blankEducation()]).map((item) => ({
      ...item,
      level: item.level ?? "",
      location: item.location ?? "",
      current: item.current ?? false,
      description: item.description ?? "",
    }));

  return {
    ...data,
    personal: {
      fullName: data.personal?.fullName ?? "",
      lastName: data.personal?.lastName ?? "",
      title: data.personal?.title ?? "",
      email: data.personal?.email ?? "",
      phone: data.personal?.phone ?? "",
      location: data.personal?.location ?? "",
      website: data.personal?.website ?? "",
      photo: data.personal?.photo ?? "",
    },
    experience,
    education,
  };
};

type ResumeContextValue = {
  resume: ResumeData;
  isReady: boolean;
  isSaving: boolean;
  update: (updater: (prev: ResumeData) => ResumeData) => void;
  reset: () => void;
  loadDemo: () => void;
};

const ResumeContext = createContext<ResumeContextValue | undefined>(undefined);

export const ResumeProvider = ({ children, resumeId }: { children: ReactNode; resumeId?: string }) => {
  const { session, isLoading: authLoading } = useAuth();
  const [resume, setResume] = useState<ResumeData>(emptyResume());
  const [isReady, setReady] = useState(false);
  const [isSaving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (authLoading) return;
      if (resumeId && session) {
      try {
          const remote = await fetchResume(resumeId);
          if (!active) return;
          if (remote) {
            startTransition(() => setResume(applyPersonalDefaults(remote)));
            setReady(true);
            return;
          }
      } catch (error) {
          console.error("Failed to fetch resume", error);
        }
      }
      startTransition(() => setResume(applyPersonalDefaults(demoResume)));
    setReady(true);
    };
    load();
    return () => {
      active = false;
    };
  }, [resumeId, session, authLoading]);

  useEffect(() => {
    if (!isReady || !resumeId || !session) return;
    setSaving(true);
    const timer = window.setTimeout(() => {
      updateResume(resumeId, resume)
        .catch((error) => console.error("Failed to save resume", error))
        .finally(() => setSaving(false));
    }, 700);
    return () => {
      window.clearTimeout(timer);
      setSaving(false);
    };
  }, [resume, resumeId, session, isReady]);

  const update = useCallback((updater: (prev: ResumeData) => ResumeData) => {
    setResume((prev) => updater(structuredClone(prev)));
  }, []);

  const reset = useCallback(() => {
    setResume(emptyResume());
  }, []);

  const loadDemo = useCallback(() => {
    setResume(applyPersonalDefaults(demoResume));
  }, []);

  const value = useMemo(
    () => ({ resume, update, reset, loadDemo, isReady, isSaving }),
    [resume, update, reset, loadDemo, isReady, isSaving],
  );

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
};

export const useResume = () => {
  const ctx = useContext(ResumeContext);
  if (!ctx) {
    throw new Error("useResume must be used inside ResumeProvider");
  }
  return ctx;
};
