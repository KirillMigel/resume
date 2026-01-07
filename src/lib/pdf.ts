import { PDFDocument, rgb, PDFFont, PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "node:fs";
import path from "node:path";
import { ResumeData } from "@/lib/resume-data";

const ensureArray = <T>(value: T[] | undefined | null): T[] =>
  Array.isArray(value) ? value : [];
const ensureString = (value: unknown) => (typeof value === "string" ? value : "");

const fontPath = (file: string) => path.join(process.cwd(), "assets", "fonts", file);
const assetPath = (file: string) => path.join(process.cwd(), "public", file);
const DEFAULT_AVATAR = assetPath("avatar.jpg");

const dataUrlToBuffer = (value: string | undefined | null) => {
  if (!value) return null;
  const match = /^data:image\/(png|jpe?g);base64,(.+)$/i.exec(value);
  if (!match) return null;
  try {
    return Buffer.from(match[2], "base64");
  } catch {
    return null;
  }
};

const safeRead = (filepath: string) => {
  try {
    if (fs.existsSync(filepath)) {
      return fs.readFileSync(filepath);
    }
  } catch {
    // ignore
  }
  return null;
};

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0.13, 0.55, 0.82]; // default blue
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

export const createResumePdf = async (resume: ResumeData): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();
  
  // Register fontkit for custom fonts
  pdfDoc.registerFontkit(fontkit);
  
  const page = pdfDoc.addPage([595, 842]); // A4 size in points
  const { width, height } = page.getSize();
  const margin = 40;
  const startX = margin;
  const startY = height - margin;
  const contentWidth = width - margin * 2;

  const accent = resume.theme?.accent || "#218dd0";
  const accentRgb = hexToRgb(accent);
  const isCompact = resume.theme?.density === "compact";

  // Load fonts
  const fontRegularPath = fontPath("Inter-Regular.ttf");
  const fontBoldPath = fontPath("Inter-Bold.ttf");
  
  const fontRegularData = safeRead(fontRegularPath);
  const fontBoldData = safeRead(fontBoldPath);

  let fontRegular: PDFFont;
  let fontBold: PDFFont;

  if (fontRegularData && fontBoldData) {
    fontRegular = await pdfDoc.embedFont(fontRegularData);
    fontBold = await pdfDoc.embedFont(fontBoldData);
  } else {
    // Fallback to standard fonts
    fontRegular = await pdfDoc.embedFont("Helvetica");
    fontBold = await pdfDoc.embedFont("Helvetica-Bold");
  }

  let currentY = startY;

  // Helper to wrap text and calculate height
  const wrapText = (text: string, font: PDFFont, size: number, maxWidth: number): string[] => {
    if (!text || !text.trim()) return [];
    
    const words = text.trim().split(/\s+/);
    if (words.length === 0) return [];
    
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      let width: number;
      
      try {
        width = font.widthOfTextAtSize(testLine, size);
      } catch {
        // Fallback: estimate width (rough approximation)
        width = testLine.length * size * 0.6;
      }
      
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
        // If single word is too long, force it anyway
        try {
          const wordWidth = font.widthOfTextAtSize(word, size);
          if (wordWidth > maxWidth) {
            lines.push(word);
            currentLine = "";
          }
        } catch {
          // If we can't measure, just add it
          lines.push(word);
          currentLine = "";
        }
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [text]; // Fallback to original text if empty
  };

  // Helper to add text and return new Y position
  const addText = (
    text: string,
    x: number,
    y: number,
    options: {
      font?: PDFFont;
      size?: number;
      color?: [number, number, number];
      maxWidth?: number;
      lineHeight?: number;
    } = {}
  ): number => {
    const {
      font = fontRegular,
      size = 14,
      color = [0.18, 0.18, 0.18],
      maxWidth = contentWidth,
      lineHeight = 1.5,
    } = options;

    if (!text || !text.trim()) return y;

    // Split by explicit line breaks first
    const paragraphs = text.split("\n").map(p => p.trim()).filter(p => p);
    if (paragraphs.length === 0) return y;

    let lineY = y;
    const lineSpacing = size * lineHeight;
    let totalLines = 0;

    paragraphs.forEach((paragraph, paraIndex) => {
      // Wrap each paragraph
      const lines = wrapText(paragraph, font, size, maxWidth);
      
      if (lines.length === 0) return;
      
      lines.forEach((line) => {
        page.drawText(line, {
          x,
          y: lineY,
          size,
          font,
          color: rgb(color[0], color[1], color[2]),
        });
        lineY -= lineSpacing;
        totalLines++;
      });

      // Add extra space between paragraphs (but not after last paragraph)
      if (paraIndex < paragraphs.length - 1) {
        lineY -= size * 0.3;
      }
    });

    // Return the final Y position - this is where the next element should start
    return lineY;
  };

  // Photo
  const photoSize = 86;
  const photoBuffer = dataUrlToBuffer(resume.personal.photo) ?? safeRead(DEFAULT_AVATAR);
  if (photoBuffer) {
    try {
      let image;
      try {
        image = await pdfDoc.embedPng(photoBuffer);
      } catch {
        image = await pdfDoc.embedJpg(photoBuffer);
      }
      const imageDims = image.scale(photoSize / image.width);
      page.drawImage(image, {
        x: startX,
        y: currentY - photoSize,
        width: imageDims.width,
        height: imageDims.height,
      });
    } catch {
      // Skip photo if embedding fails
    }
  }

  // Header text
  const textX = startX + photoSize + 18;
  const textWidth = contentWidth - photoSize - 18;
  const fullName = [resume.personal.fullName, resume.personal.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  currentY = addText(fullName || "Имя Фамилия", textX, currentY, {
    font: fontBold,
    size: 20,
    color: [0.11, 0.14, 0.20],
    maxWidth: textWidth,
  });

  currentY = addText(resume.personal.title || "Желаемая должность", textX, currentY, {
    size: 16,
    color: [0.23, 0.27, 0.33],
    maxWidth: textWidth,
  });

    const contacts = [
      ensureString(resume.personal.email),
      ensureString(resume.personal.phone),
      ensureString(resume.personal.location),
      ensureString(resume.personal.website),
    ]
      .filter(Boolean)
      .join("  •  ");

    if (contacts) {
    currentY = addText(contacts, textX, currentY, {
      size: 14,
      color: [0.29, 0.34, 0.39],
      maxWidth: textWidth,
    });
  }

  currentY -= isCompact ? 15 : 20;

  // Summary
    if (resume.summary) {
    currentY = addText(resume.summary, startX, currentY, {
      size: 14,
      color: [0.18, 0.21, 0.27],
      maxWidth: contentWidth,
      lineHeight: 1.5,
    });
    currentY -= isCompact ? 8 : 12;
  }

  // Experience
    const experience = ensureArray(resume.experience).filter(
    (item) => item.role || item.company || item.description
    );
    if (experience.length) {
    currentY -= isCompact ? 12 : 18;
    currentY = addText("Опыт работы", startX, currentY, {
      size: 16,
      color: [0.42, 0.45, 0.50],
      maxWidth: contentWidth,
    });
    currentY -= 10;

    experience.forEach((item, expIndex) => {
      const roleText = `${item.role || "Должность"}  ${item.company || "Компания"}`;
      currentY = addText(roleText, startX, currentY, {
        font: fontBold,
        size: 16,
        color: [0.12, 0.16, 0.22],
        maxWidth: contentWidth,
        lineHeight: 1.3,
      });

      const endDate = item.current && !item.endDate ? "Настоящее время" : item.endDate;
      const dates = [item.startDate, endDate].filter(Boolean).join(" — ");
      const locationLine = item.location ? `  •  ${item.location}` : "";
      const datesAndLocation = dates + locationLine;

      if (datesAndLocation) {
        currentY -= 4;
        currentY = addText(datesAndLocation, startX, currentY, {
          size: 14,
          color: [0.58, 0.64, 0.72],
          maxWidth: contentWidth,
          lineHeight: 1.3,
        });
      }

      if (item.description) {
        currentY -= 6;
        currentY = addText(item.description, startX, currentY, {
          size: 14,
          color: [0.18, 0.21, 0.27],
          maxWidth: contentWidth,
          lineHeight: 1.5,
        });
      }

      // Consistent spacing between items (but not after last)
      if (expIndex < experience.length - 1) {
        currentY -= isCompact ? 14 : 18;
      }
    });
  }

  // Education
    const education = ensureArray(resume.education).filter(
    (item) => item.school || item.degree || item.level || item.description
    );
    if (education.length) {
    currentY -= isCompact ? 18 : 24;
    currentY = addText("Образование", startX, currentY, {
      size: 16,
      color: [0.42, 0.45, 0.50],
      maxWidth: contentWidth,
    });
    currentY -= 10;

    education.forEach((item, eduIndex) => {
      currentY = addText(item.school || "Учебное заведение", startX, currentY, {
        font: fontBold,
        size: 16,
        color: [0.12, 0.16, 0.22],
        maxWidth: contentWidth,
        lineHeight: 1.3,
      });

      const degreeLine = [item.degree, item.level].filter(Boolean).join(" • ");
      if (degreeLine) {
        currentY -= 2;
        currentY = addText(degreeLine, startX, currentY, {
          size: 14,
          color: [0.28, 0.34, 0.41],
          maxWidth: contentWidth,
          lineHeight: 1.3,
        });
      }

      if (item.location) {
        currentY -= 2;
        currentY = addText(item.location, startX, currentY, {
          size: 14,
          color: [0.37, 0.42, 0.52],
          maxWidth: contentWidth,
          lineHeight: 1.3,
        });
      }

      const dates = [
        item.startDate,
        item.current && !item.endDate ? "Настоящее время" : item.endDate,
      ]
        .filter(Boolean)
        .join(" — ");
      if (dates) {
        currentY -= 2;
        currentY = addText(dates, startX, currentY, {
          size: 14,
          color: [0.58, 0.64, 0.72],
          maxWidth: contentWidth,
          lineHeight: 1.3,
        });
      }

      if (item.description) {
        currentY -= 6;
        currentY = addText(item.description, startX, currentY, {
          size: 14,
          color: [0.18, 0.21, 0.27],
          maxWidth: contentWidth,
          lineHeight: 1.5,
        });
      }

      // Add spacing between education items (but not after last)
      if (eduIndex < education.length - 1) {
        currentY -= isCompact ? 12 : 16;
      }
    });
  }

  // Skills
    const skills = ensureArray<string>(resume.skills).filter(Boolean);
    if (skills.length) {
    currentY -= isCompact ? 20 : 30;
    currentY = addText("Навыки", startX, currentY, {
      size: 16,
      color: [0.42, 0.45, 0.50],
      maxWidth: contentWidth,
    });
    currentY -= 10;

    let chipX = startX;
    const chipHeight = 24;
    const chipGap = 8;
    let chipY = currentY;

    skills.forEach((skill) => {
      const textWidth = fontRegular.widthOfTextAtSize(skill, 14);
      const chipWidth = textWidth + 28;

      if (chipX + chipWidth > startX + contentWidth) {
        chipX = startX;
        chipY -= chipHeight + chipGap;
      }

      page.drawRectangle({
        x: chipX,
        y: chipY - chipHeight,
        width: chipWidth,
        height: chipHeight,
        color: rgb(0.93, 0.95, 0.97),
        borderColor: rgb(0.93, 0.95, 0.97),
        borderWidth: 0,
      });

      page.drawText(skill, {
        x: chipX + 14,
        y: chipY - chipHeight + 5,
        size: 14,
        font: fontRegular,
        color: rgb(0.18, 0.21, 0.27),
      });

      chipX += chipWidth + chipGap;
    });

    currentY = chipY - chipHeight - 20;
  }

  // Links
    const links = ensureArray(resume.links).filter((link) => link.label || link.url);
    if (links.length) {
    currentY -= isCompact ? 20 : 30;
        links.forEach((link) => {
          if (link.label) {
        currentY = addText(link.label, startX, currentY, {
          font: fontBold,
          size: 14,
          color: [0.12, 0.16, 0.22],
          maxWidth: contentWidth,
        });
          }
          if (link.url) {
        currentY = addText(link.url, startX, currentY, {
          size: 14,
          color: accentRgb,
          maxWidth: contentWidth,
        });
      }
      currentY -= 15;
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};
