import { ResumeBuilder } from "@/components/resume/resume-builder";

export default function BuilderPage({ searchParams }: { searchParams: { id?: string } }) {
  return <ResumeBuilder resumeId={searchParams.id} />;
}
