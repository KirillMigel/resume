import { supabase } from "@/lib/supabase/client";
import { ResumeData } from "@/lib/resume-data";

export type ResumeListItem = {
  id: string;
  title: string;
  updated_at: string | null;
  photo?: string | null;
  role?: string | null;
};

export const fetchResumes = async (): Promise<ResumeListItem[]> => {
  const { data, error } = await supabase
    .from("resumes")
    .select("id,title,updated_at,photo:data->personal->>photo,role:data->personal->>title")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as ResumeListItem[]) ?? [];
};

export const fetchResume = async (id: string): Promise<ResumeData | null> => {
  const { data, error } = await supabase.from("resumes").select("data").eq("id", id).single();
  if (error) throw error;
  return (data as { data: ResumeData } | null)?.data ?? null;
};

export const createResume = async (payload: { title: string; data: ResumeData; userId: string }) => {
  const { data, error } = await supabase
    .from("resumes")
    .insert({ title: payload.title, data: payload.data, user_id: payload.userId })
    .select("id")
    .single();
  if (error) throw error;
  return data?.id as string;
};

export const updateResume = async (id: string, data: ResumeData) => {
  const { error } = await supabase.from("resumes").update({ title: data.personal.title || "Резюме", data }).eq("id", id);
  if (error) throw error;
};

export const deleteResume = async (id: string) => {
  const { error } = await supabase.from("resumes").delete().eq("id", id);
  if (error) throw error;
};

