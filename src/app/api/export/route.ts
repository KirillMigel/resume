import { NextResponse } from "next/server";
import { createResumePdf } from "@/lib/pdf";
import type {
  ResumeData,
  Experience,
  Education,
  LinkItem,
} from "@/lib/resume-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ensureString = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const mapArray = <T, R>(value: unknown, mapper: (item: T) => R): R[] =>
  Array.isArray(value) ? (value as T[]).map(mapper) : [];

const normalizeResume = (payload: Partial<ResumeData>): ResumeData => ({
  personal: {
    fullName: ensureString(payload.personal?.fullName),
    lastName: ensureString(payload.personal?.lastName),
    title: ensureString(payload.personal?.title),
    email: ensureString(payload.personal?.email),
    phone: ensureString(payload.personal?.phone),
    location: ensureString(payload.personal?.location),
    website: ensureString(payload.personal?.website),
    photo: ensureString(payload.personal?.photo),
  },
  summary: ensureString(payload.summary),
  experience: mapArray<Experience, Experience>(payload.experience, (item) => ({
    id: item.id || crypto.randomUUID(),
    role: ensureString(item.role),
    company: ensureString(item.company),
    location: ensureString(item.location),
    startDate: ensureString(item.startDate),
    endDate: ensureString(item.endDate),
    current: Boolean(item.current),
    description: ensureString(item.description),
  })),
  education: mapArray<Education, Education>(payload.education, (item) => ({
    id: item.id || crypto.randomUUID(),
    school: ensureString(item.school),
    degree: ensureString(item.degree),
    level: ensureString(item.level),
    location: ensureString(item.location),
    startDate: ensureString(item.startDate),
    endDate: ensureString(item.endDate),
    current: Boolean(item.current),
    description: ensureString(item.description),
  })),
  skills: mapArray<string, string>(payload.skills, (item) => ensureString(item)).filter(Boolean),
  links: mapArray<LinkItem, LinkItem>(payload.links, (item) => ({
    id: item.id || crypto.randomUUID(),
    label: ensureString(item.label),
    url: ensureString(item.url),
  })),
  theme: {
    accent: ensureString(payload.theme?.accent) || "#2563eb",
    density: payload.theme?.density === "compact" ? "compact" : "normal",
  },
});

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<ResumeData>;
    const resume = normalizeResume(payload);
    const buffer = await createResumePdf(resume);

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume-${Date.now()}.pdf"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string; stack?: string };
    console.error("PDF export failed", err?.message, err?.stack);
    return NextResponse.json(
      { message: err?.message || "Не удалось собрать PDF" },
      {
        status: 400,
      },
    );
  }
}
