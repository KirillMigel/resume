/**
 * Валидация и санитизация данных для production
 */

// Максимальные длины полей
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

// Максимальное количество элементов
const MAX_COUNTS = {
  experience: 20,
  education: 20,
  skills: 50,
  links: 10,
} as const;

// Максимальный размер base64 изображения (5MB)
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

/**
 * Санитизация строки - удаление опасных символов и обрезка
 */
export function sanitizeString(value: string, maxLength: number): string {
  if (typeof value !== "string") return "";
  
  // Удаляем потенциально опасные HTML теги
  let sanitized = value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
  
  // Обрезаем до максимальной длины
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Валидация email
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= MAX_LENGTHS.email;
}

/**
 * Валидация URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) && url.length <= MAX_LENGTHS.linkUrl;
  } catch {
    return false;
  }
}

/**
 * Валидация base64 изображения
 */
export function isValidBase64Image(base64: string): boolean {
  if (!base64 || typeof base64 !== "string") return false;
  
  // Проверяем формат
  if (!base64.startsWith("data:image/")) return false;
  
  // Проверяем размер (приблизительно)
  const base64Length = base64.length;
  // Base64 увеличивает размер примерно на 33%, поэтому делим на 1.33
  const estimatedSize = (base64Length * 3) / 4;
  
  return estimatedSize <= MAX_PHOTO_SIZE;
}

/**
 * Валидация и санитизация персональных данных
 */
export function validatePersonal(data: {
  fullName?: unknown;
  lastName?: unknown;
  title?: unknown;
  email?: unknown;
  phone?: unknown;
  location?: unknown;
  website?: unknown;
  photo?: unknown;
}) {
  const result: {
    fullName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    photo: string;
  } = {
    fullName: "",
    lastName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    photo: "",
  };

  if (typeof data.fullName === "string") {
    result.fullName = sanitizeString(data.fullName, MAX_LENGTHS.fullName);
  }
  if (typeof data.lastName === "string") {
    result.lastName = sanitizeString(data.lastName, MAX_LENGTHS.lastName);
  }
  if (typeof data.title === "string") {
    result.title = sanitizeString(data.title, MAX_LENGTHS.title);
  }
  if (typeof data.email === "string") {
    const email = data.email.trim();
    result.email = isValidEmail(email) ? email : "";
  }
  if (typeof data.phone === "string") {
    result.phone = sanitizeString(data.phone, MAX_LENGTHS.phone);
  }
  if (typeof data.location === "string") {
    result.location = sanitizeString(data.location, MAX_LENGTHS.location);
  }
  if (typeof data.website === "string") {
    const website = data.website.trim();
    result.website = website && isValidUrl(website) ? website : "";
  }
  if (typeof data.photo === "string") {
    result.photo = isValidBase64Image(data.photo) ? data.photo : "";
  }

  return result;
}

/**
 * Валидация и санитизация массива навыков
 */
export function validateSkills(skills: unknown): string[] {
  if (!Array.isArray(skills)) return [];
  
  return skills
    .slice(0, MAX_COUNTS.skills)
    .filter((skill): skill is string => typeof skill === "string")
    .map((skill) => sanitizeString(skill, MAX_LENGTHS.skill))
    .filter((skill) => skill.length > 0);
}

/**
 * Валидация и санитизация ссылок
 */
export function validateLinks(links: unknown): Array<{ id: string; label: string; url: string }> {
  if (!Array.isArray(links)) return [];
  
  return links
    .slice(0, MAX_COUNTS.links)
    .filter((link): link is { id?: string; label?: unknown; url?: unknown } => 
      typeof link === "object" && link !== null
    )
    .map((link) => {
      const label = typeof link.label === "string" 
        ? sanitizeString(link.label, MAX_LENGTHS.linkLabel) 
        : "";
      const url = typeof link.url === "string" && isValidUrl(link.url)
        ? link.url.trim()
        : "";
      
      return {
        id: typeof link.id === "string" ? link.id : crypto.randomUUID(),
        label,
        url,
      };
    })
    .filter((link) => link.label || link.url);
}

