import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { generateResumeHTML } from "@/lib/pdf-html";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { validatePersonal, validateSkills, validateLinks } from "@/lib/validation";
import { initSentryServer } from "@/lib/sentry-server";
import { measureTime, incrementCounter } from "@/lib/metrics";
import type {
  ResumeData,
  Experience,
  Education,
  LinkItem,
} from "@/lib/resume-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Rate limiting: 5 PDF генераций в минуту на IP
const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW = 60000; // 1 минута

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
  await initSentryServer();
  let browser;
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`export:${clientIP}`, RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          message: "Слишком много запросов. Попробуйте позже.",
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.resetAt.toString(),
          },
        }
      );
    }

    const payload = (await request.json()) as Partial<ResumeData>;
    
    // Валидация размера payload (максимум 10MB)
    const payloadSize = JSON.stringify(payload).length;
    const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10MB
    if (payloadSize > MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        { message: "Размер данных слишком большой. Максимум 10MB." },
        { status: 400 }
      );
    }
    
    const resume = normalizeResume(payload);
    
    // Дополнительная валидация критичных полей
    const validatedPersonal = validatePersonal(resume.personal);
    resume.personal = { ...resume.personal, ...validatedPersonal };
    
    resume.skills = validateSkills(resume.skills);
    resume.links = validateLinks(resume.links);
    
    const html = generateResumeHTML(resume);

    // Launch browser с таймаутом
    const browserLaunchPromise = puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      timeout: 30000, // 30 секунд на запуск
    });
    
    browser = await Promise.race([
      browserLaunchPromise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Browser launch timeout")), 30000)
      ),
    ]);

    const page = await browser.newPage();
    
    // Генерация PDF с измерением времени
    const pdfBuffer = await measureTime("api.export.pdf_generation", async () => {
      // Устанавливаем таймаут для генерации PDF (максимум 30 секунд)
      return await Promise.race([
        (async () => {
          // Set content with base64 images support
          await page.setContent(html, {
            waitUntil: "networkidle0",
            timeout: 20000, // 20 секунд на загрузку контента
          });

          // Generate PDF
          return await page.pdf({
            format: "A4",
            margin: {
              top: "40px",
              right: "40px",
              bottom: "40px",
              left: "40px",
            },
            printBackground: true,
            timeout: 20000, // 20 секунд на генерацию
          });
        })(),
        new Promise<Buffer>((_, reject) => 
          setTimeout(() => reject(new Error("PDF generation timeout")), 30000)
        ),
      ]);
    });

    await browser.close();
    incrementCounter("api.export.success");

    // Конвертируем Buffer в Uint8Array для NextResponse
    const pdfArray = new Uint8Array(pdfBuffer);

    return new NextResponse(pdfArray, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume-${Date.now()}.pdf"`,
        "Content-Length": pdfArray.length.toString(),
      },
    });
  } catch (error: unknown) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    const err = error as { message?: string; stack?: string };
    
    incrementCounter("api.export.errors", { error: err?.message || "unknown" });
    
    // Логируем в Sentry (если настроен)
    try {
      const Sentry = await import("@sentry/nextjs");
      Sentry.captureException(error, {
        tags: { endpoint: "/api/export" },
        extra: { message: err?.message },
      });
    } catch {
      // Sentry не настроен или не доступен
    }
    
    console.error("PDF export failed", err?.message, err?.stack);
    return NextResponse.json(
      { message: err?.message || "Не удалось собрать PDF" },
      {
        status: 400,
      },
    );
  }
}
