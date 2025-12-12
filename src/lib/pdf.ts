import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { ResumeData } from "@/lib/resume-data";

const ensureArray = <T>(value: T[] | undefined | null): T[] =>
  Array.isArray(value) ? value : [];
const ensureString = (value: unknown) => (typeof value === "string" ? value : "");

const assetPath = (file: string) => path.join(process.cwd(), "public", file);
const DEFAULT_AVATAR = assetPath("avatar.jpg");
const require = createRequire(import.meta.url);

const resolvePdfkitAfm = (name: string) => require.resolve(`pdfkit/js/data/${name}.afm`);

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

export const createResumePdf = (resume: ResumeData) =>
  new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];
    const accent = resume.theme?.accent || "#218dd0";
    const isCompact = resume.theme?.density === "compact";
    const bodyLineGap = 5;
    const blockSpacing = 18;

    const photoBuffer = dataUrlToBuffer(resume.personal.photo) ?? safeRead(DEFAULT_AVATAR);

    const helveticaPath = resolvePdfkitAfm("Helvetica");
    const helveticaBoldPath = resolvePdfkitAfm("Helvetica-Bold");
    doc.registerFont("Helvetica", helveticaPath);
    doc.registerFont("Helvetica-Bold", helveticaBoldPath);
    const fontRegularName = "Helvetica";
    const fontBoldName = "Helvetica-Bold";

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("error", (err) => reject(err));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const headerColor = "#0f172a";
    doc.fillColor(headerColor);
    const fullName = [resume.personal.fullName, resume.personal.lastName].filter(Boolean).join(" ").trim();

    // Header layout with photo
    const startX = doc.page.margins.left;
    const startY = doc.page.margins.top;
    const photoSize = 86;
    const textX = startX + photoSize + 18;
    const textWidth = doc.page.width - textX - doc.page.margins.right;
    const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // photo clipped to circle
    if (photoBuffer) {
      doc.save();
      doc.circle(startX + photoSize / 2, startY + photoSize / 2, photoSize / 2).clip();
      doc.image(photoBuffer, startX, startY, { width: photoSize, height: photoSize });
      doc.restore();
    }

    doc
      .font(fontBoldName)
      .fontSize(20)
      .fillColor("#1d2433")
      .text(fullName || "Имя Фамилия", textX, startY, { width: textWidth });
    doc
      .moveDown(0.2)
      .font(fontRegularName)
      .fontSize(16)
      .fillColor("#3b4554")
      .text(resume.personal.title || "Желаемая должность", textX, doc.y, { width: textWidth });

    const contacts = [
      ensureString(resume.personal.email),
      ensureString(resume.personal.phone),
      ensureString(resume.personal.location),
      ensureString(resume.personal.website),
    ]
      .filter(Boolean)
      .join("  •  ");
    if (contacts) {
      doc
        .moveDown(0.6)
        .fontSize(14)
        .fillColor("#4b5565")
        .text(contacts, textX, doc.y, { width: textWidth });
    }

    doc.moveDown(1);

    const renderSection = (title: string, render: () => void) => {
      doc.moveDown(isCompact ? 1.0 : 1.2);
      doc.fillColor("#6b7280").font(fontRegularName).fontSize(16).text(title);
      doc.moveDown(isCompact ? 0.4 : 0.5);
      doc.fillColor("#2f3644").font(fontRegularName).fontSize(14);
      render();
    };

    if (resume.summary) {
      doc
        .fillColor("#2f3644")
        .font(fontRegularName)
        .fontSize(14)
        .text(resume.summary, startX, doc.y, { width: contentWidth, lineGap: bodyLineGap });
      // меньше отступа после summary перед опытом
      doc.moveDown(0.4);
    }

    const experience = ensureArray(resume.experience).filter((item) => item.role || item.company || item.description);
    if (experience.length) {
      renderSection("Опыт работы", () => {
        doc.x = startX;
        experience.forEach((item, index) => {
          doc
            .font(fontBoldName)
            .fontSize(16)
            .text(item.role || "Должность", startX, undefined, { continued: true })
            .font(fontRegularName)
            .fillColor("#475569")
            .fontSize(16)
            .text(`  ${[item.company || "Компания"].filter(Boolean).join(" • ")}`);
          const endDate = item.current && !item.endDate ? "Настоящее время" : item.endDate;
          const dates = [item.startDate, endDate].filter(Boolean).join(" — ");
          const locationLine = [item.location].filter(Boolean).join("");
          const datesAndLocation = [dates, locationLine].filter(Boolean).join("  •  ");
          if (datesAndLocation) {
            doc.fontSize(14).fillColor("#94a3b8").text(datesAndLocation, { width: contentWidth });
          }
          if (item.description) {
            const bullets = item.description
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean);
            doc.moveDown(0.3);
            doc
              .fontSize(14)
              .fillColor("#2f3644")
              .text(bullets.join("\n"), { width: contentWidth, lineGap: bodyLineGap });
          }
          if (index !== experience.length - 1) {
            doc.moveDown(isCompact ? 1.1 : 1.3);
          }
        });
      });
    }

    const education = ensureArray(resume.education).filter(
      (item) => item.school || item.degree || item.level || item.description,
    );
    if (education.length) {
      renderSection("Образование", () => {
        doc.x = startX;
        education.forEach((item, index) => {
          doc
            .font(fontBoldName)
            .fontSize(16)
            .fillColor("#1f2937")
            .text(item.school || "Учебное заведение", startX, undefined, { width: contentWidth });
          const degreeLine = [item.degree, item.level].filter(Boolean).join(" • ");
          if (degreeLine) {
            doc
              .font(fontRegularName)
              .fontSize(14)
              .fillColor("#475569")
              .text(degreeLine, { width: contentWidth });
          }
          const locationLine = ensureString(item.location);
          if (locationLine) {
            doc.fontSize(14).fillColor("#5f6b84").text(locationLine, { width: contentWidth });
          }
          const dates = [
            item.startDate,
            item.current && !item.endDate ? "Настоящее время" : item.endDate,
          ]
            .filter(Boolean)
            .join(" — ");
          if (dates) {
            doc.fontSize(14).fillColor("#94a3b8").text(dates, { width: contentWidth });
          }
          if (item.description) {
            doc
              .fontSize(14)
              .fillColor("#2f3644")
              .text(item.description, { width: contentWidth, lineGap: bodyLineGap });
          }
          if (index !== education.length - 1) {
            doc.moveDown(isCompact ? 1.1 : 1.3);
          }
          doc.fillColor("#2f3644").fontSize(14);
        });
      });
    }

    const skills = ensureArray<string>(resume.skills).filter(Boolean);
    if (skills.length) {
      renderSection("Навыки", () => {
        const paddingX = 14;
        const chipHeight = 32;
        const chipGap = 8; // увеличил вертикальный зазор между рядами
        const startXChips = startX;
        const maxWidth = doc.page.width - doc.page.margins.right - startXChips;
        let x = startXChips;
        let y = doc.y;

        skills.forEach((skill) => {
          // Зафиксируем шрифт перед измерениями, чтобы не передавать лишние поля в опции
          doc.font(fontRegularName).fontSize(14);

          const textWidth = doc.widthOfString(skill);
          const chipWidth = textWidth + paddingX * 2;
          if (x + chipWidth > startXChips + maxWidth) {
            x = startXChips;
            y += chipHeight + chipGap;
          }

          const textHeight = doc.heightOfString(skill, {
            width: chipWidth - paddingX * 2,
          });
          const offsetY = (chipHeight - textHeight) / 2;

          doc
            .save()
            .roundedRect(x, y, chipWidth, chipHeight, 16)
            .fillAndStroke("#eef2f7", "#eef2f7")
            .fillColor("#2f3644")
            .font(fontRegularName)
            .fontSize(14)
            .text(skill, x + paddingX, y + offsetY, { width: chipWidth - paddingX * 2, align: "left" });
          doc.restore();

          x += chipWidth + chipGap;
        });

        // move cursor below chips
        doc.y = y + chipHeight + chipGap;
      });
    }

    const links = ensureArray(resume.links).filter((link) => link.label || link.url);
    if (links.length) {
      doc.moveDown(isCompact ? 1.2 : 1.5);
      links.forEach((link, index) => {
          if (link.label) {
            doc.font(fontBoldName).fontSize(14).fillColor("#1f2937").text(link.label);
          }
          if (link.url) {
            doc
              .font(fontRegularName)
              .fontSize(14)
              .fillColor(accent)
              .text(link.url, { link: link.url, underline: false });
        }
        if (index !== links.length - 1) {
          doc.moveDown(isCompact ? 0.8 : 1.0);
          }
      });
    }

    doc.end();
  });
