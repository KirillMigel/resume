import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Блог о резюме и карьере | Resumio",
  description: "Полезные статьи о том, как создать эффективное резюме, пройти собеседование, развить карьеру в IT. Советы по написанию резюме, подготовке к интервью, поиску работы.",
  keywords: [
    "как создать резюме",
    "резюме для IT",
    "примеры резюме",
    "как написать резюме",
    "резюме программиста",
    "собеседование IT",
    "карьера в IT",
    "поиск работы",
    "резюме разработчика",
    "CV для IT",
  ],
  openGraph: {
    title: "Блог о резюме и карьере | Resumio",
    description: "Полезные статьи о том, как создать эффективное резюме, пройти собеседование, развить карьеру в IT",
    type: "website",
    siteName: "Resumio",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

