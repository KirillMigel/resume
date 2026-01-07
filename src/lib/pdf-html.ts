import { ResumeData } from "@/lib/resume-data";
import { sanitizeString } from "@/lib/validation";

const ensureString = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const ensureArray = <T>(value: T[] | undefined | null): T[] =>
  Array.isArray(value) ? value : [];

// Максимальные длины для HTML генерации
const MAX_LENGTHS = {
  fullName: 100,
  lastName: 100,
  title: 200,
  email: 255,
  phone: 50,
  location: 200,
  website: 500,
  summary: 2000,
  role: 200,
  company: 200,
  school: 200,
  degree: 200,
  level: 100,
  description: 5000,
  skill: 50,
  linkLabel: 100,
  linkUrl: 500,
} as const;

/**
 * Экранирование HTML для защиты от XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export const generateResumeHTML = (resume: ResumeData): string => {
  const fullName = [
    sanitizeString(resume.personal.fullName || "", MAX_LENGTHS.fullName),
    sanitizeString(resume.personal.lastName || "", MAX_LENGTHS.lastName),
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "Имя Фамилия";

  const contacts = [
    sanitizeString(resume.personal.email || "", MAX_LENGTHS.email),
    sanitizeString(resume.personal.phone || "", MAX_LENGTHS.phone),
    sanitizeString(resume.personal.location || "", MAX_LENGTHS.location),
    sanitizeString(resume.personal.website || "", MAX_LENGTHS.website),
  ]
    .filter(Boolean)
    .join("  •  ");

  const accent = resume.theme?.accent || "#218dd0";
  // Handle base64 images or default avatar
  let photoSrc = resume.personal.photo?.trim() || "";
  if (!photoSrc || (!photoSrc.startsWith("data:") && !photoSrc.startsWith("http"))) {
    photoSrc = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODYiIGhlaWdodD0iODYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9Ijg2IiBoZWlnaHQ9Ijg2IiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IiM5Y2EzYWYiIGR5PSIuM2VtIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7QkNCy0Lw8L3RleHQ+PC9zdmc+";
  }

  const experience = ensureArray(resume.experience)
    .filter((item) => item.role || item.company || item.description)
    .slice(0, 20); // Ограничение количества

  const education = ensureArray(resume.education)
    .filter((item) => item.school || item.degree || item.level || item.description)
    .slice(0, 20); // Ограничение количества

  const skills = ensureArray<string>(resume.skills)
    .filter(Boolean)
    .slice(0, 50) // Ограничение количества
    .map((skill) => sanitizeString(skill, MAX_LENGTHS.skill));
    
  const links = ensureArray(resume.links)
    .filter((link) => link.label || link.url)
    .slice(0, 10); // Ограничение количества

  // Экранирование всех пользовательских данных
  const safeFullName = escapeHtml(fullName);
  const safeTitle = escapeHtml(sanitizeString(resume.personal.title || "Желаемая должность", MAX_LENGTHS.title));
  const safeContacts = escapeHtml(contacts);
  const safeSummary = escapeHtml(sanitizeString(resume.summary || "", MAX_LENGTHS.summary));

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Резюме</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #1f2937;
      padding: 40px;
      background: white;
    }
    .header {
      display: flex;
      gap: 18px;
      margin-bottom: 30px;
    }
    .photo {
      width: 86px;
      height: 86px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }
    .header-info {
      flex-grow: 1;
    }
    .name {
      font-size: 20px;
      font-weight: 600;
      color: #1d2433;
      margin-bottom: 4px;
    }
    .title {
      font-size: 16px;
      color: #3b4554;
      margin-bottom: 8px;
    }
    .contacts {
      font-size: 14px;
      color: #4b5565;
    }
    .section {
      margin-bottom: 18px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .summary {
      font-size: 14px;
      color: #2f3644;
      line-height: 1.6;
      margin-bottom: 18px;
      white-space: pre-wrap;
    }
    .experience-item, .education-item {
      margin-bottom: 16px;
    }
    .item-header {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 2px;
    }
    .item-meta {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .item-description {
      font-size: 14px;
      color: #2f3644;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .skill-tag {
      background: #eef2f7;
      color: #2f3644;
      padding: 6px 14px;
      border-radius: 16px;
      font-size: 14px;
    }
    .links {
      margin-top: 8px;
    }
    .link-item {
      margin-bottom: 8px;
    }
    .link-label {
      font-weight: 600;
      color: #1f2937;
      font-size: 14px;
    }
    .link-url {
      color: ${accent};
      font-size: 14px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="header">
    ${photoSrc ? `<img src="${photoSrc}" alt="Photo" class="photo" />` : '<div class="photo"></div>'}
    <div class="header-info">
      <div class="name">${safeFullName}</div>
      <div class="title">${safeTitle}</div>
      ${safeContacts ? `<div class="contacts">${safeContacts}</div>` : ""}
    </div>
  </div>

  ${safeSummary ? `<div class="summary">${safeSummary.replace(/\n/g, "<br>")}</div>` : ""}

  ${experience.length > 0 ? `
    <div class="section">
      <div class="section-title">Опыт работы</div>
      ${experience
        .map(
          (item) => `
        <div class="experience-item">
          <div class="item-header">${escapeHtml(sanitizeString(item.role || "Должность", MAX_LENGTHS.role))}  ${escapeHtml(sanitizeString(item.company || "Компания", MAX_LENGTHS.company))}</div>
          <div class="item-meta">
            ${[item.startDate, item.current && !item.endDate ? "Настоящее время" : item.endDate]
              .filter(Boolean)
              .map((d) => escapeHtml(sanitizeString(d, 50)))
              .join(" — ")}${item.location ? `  •  ${escapeHtml(sanitizeString(item.location, MAX_LENGTHS.location))}` : ""}
          </div>
          ${item.description ? `<div class="item-description">${escapeHtml(sanitizeString(item.description, MAX_LENGTHS.description)).replace(/\n/g, "<br>")}</div>` : ""}
        </div>
      `
        )
        .join("")}
    </div>
  ` : ""}

  ${education.length > 0 ? `
    <div class="section">
      <div class="section-title">Образование</div>
      ${education
        .map(
          (item) => `
        <div class="education-item">
          <div class="item-header">${escapeHtml(sanitizeString(item.school || "Учебное заведение", MAX_LENGTHS.school))}</div>
          ${[item.degree, item.level].filter(Boolean).join(" • ") ? `<div class="item-meta">${escapeHtml([item.degree || "Специальность", item.level].filter(Boolean).map((d) => sanitizeString(d, MAX_LENGTHS.degree)).join(" • "))}</div>` : ""}
          ${item.location ? `<div class="item-meta">${escapeHtml(sanitizeString(item.location, MAX_LENGTHS.location))}</div>` : ""}
          <div class="item-meta">
            ${[
              item.startDate,
              item.current && !item.endDate ? "Настоящее время" : item.endDate,
            ]
              .filter(Boolean)
              .map((d) => escapeHtml(sanitizeString(d, 50)))
              .join(" — ")}
          </div>
          ${item.description ? `<div class="item-description">${escapeHtml(sanitizeString(item.description, MAX_LENGTHS.description)).replace(/\n/g, "<br>")}</div>` : ""}
        </div>
      `
        )
        .join("")}
    </div>
  ` : ""}

  ${skills.length > 0 ? `
    <div class="section">
      <div class="section-title">Навыки</div>
      <div class="skills">
        ${skills.map((skill) => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join("")}
      </div>
    </div>
  ` : ""}

  ${links.length > 0 ? `
    <div class="section">
      <div class="section-title">Ссылки</div>
      <div class="links">
        ${links
          .map(
            (link) => `
          <div class="link-item">
            ${link.label ? `<div class="link-label">${escapeHtml(sanitizeString(link.label, MAX_LENGTHS.linkLabel))}</div>` : ""}
            ${link.url ? `<a href="${escapeHtml(sanitizeString(link.url, MAX_LENGTHS.linkUrl))}" class="link-url">${escapeHtml(sanitizeString(link.url, MAX_LENGTHS.linkUrl))}</a>` : ""}
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  ` : ""}
</body>
</html>
  `;
};
