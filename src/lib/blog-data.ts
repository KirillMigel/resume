/**
 * Типы и данные для блога
 * Контент оптимизирован для SEO по тематике резюме и карьеры
 */

export type BlogCategory = "Все" | "Создание резюме" | "Собеседование" | "Карьера" | "Советы";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  category: Exclude<BlogCategory, "Все">;
  date: string;
  excerpt?: string;
  content?: string;
  image?: string; // Путь к иллюстрации
  published: boolean;
  metaKeywords?: string[]; // Для SEO
  metaDescription?: string; // Для SEO
};

// Статьи о резюме и карьере (оптимизированы для SEO)
export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "kak-sozdat-rezyume-dlya-it",
    title: "Как создать резюме для IT: пошаговое руководство с примерами",
    category: "Создание резюме",
    date: "2024-12-22",
    excerpt: "Подробное руководство по созданию эффективного резюме для IT-специалистов. Структура, ключевые слова, примеры.",
    metaKeywords: ["резюме IT", "как создать резюме", "резюме программиста", "примеры резюме"],
    metaDescription: "Узнайте, как создать резюме для IT-специалиста. Пошаговое руководство с примерами и советами по структуре, ключевым словам и оформлению.",
    published: true,
  },
  {
    id: "2",
    slug: "kak-opisat-opyit-raboty-v-rezyume",
    title: "Как описать опыт работы в резюме: примеры для разработчиков",
    category: "Создание резюме",
    date: "2024-12-22",
    excerpt: "Как правильно описать опыт работы в резюме разработчика. Формулы, примеры, частые ошибки.",
    metaKeywords: ["опыт работы в резюме", "как описать опыт", "резюме разработчика", "примеры описания опыта"],
    metaDescription: "Узнайте, как правильно описать опыт работы в резюме разработчика. Примеры формулировок, структура, ключевые слова для IT.",
    published: true,
  },
  {
    id: "3",
    slug: "kak-proyti-sobesedovanie-v-it",
    title: "Как пройти собеседование в IT: подготовка и ответы на вопросы",
    category: "Собеседование",
    date: "2024-12-22",
    excerpt: "Полное руководство по подготовке к собеседованию в IT-компанию. Типичные вопросы, как отвечать, что спрашивать.",
    metaKeywords: ["собеседование IT", "как пройти собеседование", "вопросы на собеседовании", "подготовка к интервью"],
    metaDescription: "Узнайте, как успешно пройти собеседование в IT-компанию. Типичные вопросы, как отвечать, что спрашивать, как подготовиться.",
    published: true,
  },
  {
    id: "4",
    slug: "kak-ukazat-navyiki-v-rezyume",
    title: "Какие навыки указать в резюме: чеклист для IT-специалистов",
    category: "Создание резюме",
    date: "2024-12-21",
    excerpt: "Какие технические и soft skills указать в резюме. Чеклист навыков для разных IT-профессий.",
    metaKeywords: ["навыки в резюме", "технические навыки", "soft skills", "навыки программиста"],
    metaDescription: "Узнайте, какие навыки указать в резюме IT-специалиста. Чеклист технических и soft skills для разных профессий.",
    published: true,
  },
  {
    id: "5",
    slug: "kak-napisat-cv-dlya-raboty",
    title: "Как написать CV для работы: структура и примеры",
    category: "Создание резюме",
    date: "2024-12-19",
    excerpt: "Структура CV, что включить, как оформить. Разница между резюме и CV, примеры для IT.",
    metaKeywords: ["как написать CV", "структура CV", "CV примеры", "резюме vs CV"],
    metaDescription: "Узнайте, как правильно написать CV для работы. Структура, что включить, примеры оформления для IT-специалистов.",
    published: true,
  },
  {
    id: "6",
    slug: "kak-razvit-kareru-v-it",
    title: "Как развить карьеру в IT: от junior до senior",
    category: "Карьера",
    date: "2024-12-18",
    excerpt: "Путь развития карьеры в IT. Как стать senior разработчиком, что изучать, как расти.",
    metaKeywords: ["карьера в IT", "junior senior", "развитие карьеры", "как стать senior"],
    metaDescription: "Узнайте, как развить карьеру в IT от junior до senior. План развития, что изучать, как расти профессионально.",
    published: true,
  },
  {
    id: "7",
    slug: "kak-podgotovitsya-k-tehnicheskomu-sobesedovaniyu",
    title: "Как подготовиться к техническому собеседованию: алгоритмы и задачи",
    category: "Собеседование",
    date: "2024-12-17",
    excerpt: "Подготовка к техническому интервью. Алгоритмы, структуры данных, как решать задачи, ресурсы для подготовки.",
    metaKeywords: ["техническое собеседование", "алгоритмы собеседование", "задачи на собеседовании", "подготовка к интервью"],
    metaDescription: "Узнайте, как подготовиться к техническому собеседованию. Алгоритмы, структуры данных, примеры задач, ресурсы для подготовки.",
    published: true,
  },
  {
    id: "8",
    slug: "kak-ukazat-obrazovanie-v-rezyume",
    title: "Как указать образование в резюме: примеры для IT",
    category: "Создание резюме",
    date: "2024-12-16",
    excerpt: "Как правильно указать образование в резюме. Что писать, если нет высшего образования, примеры.",
    metaKeywords: ["образование в резюме", "как указать образование", "резюме без образования", "образование IT"],
    metaDescription: "Узнайте, как правильно указать образование в резюме IT-специалиста. Примеры, что делать без высшего образования.",
    published: true,
  },
];

export const categories: BlogCategory[] = ["Все", "Создание резюме", "Собеседование", "Карьера", "Советы"];

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  if (category === "Все") {
    return blogPosts.filter((post) => post.published);
  }
  return blogPosts.filter((post) => post.published && post.category === category);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug && post.published);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    "янв",
    "фев",
    "мар",
    "апр",
    "май",
    "июн",
    "июл",
    "авг",
    "сен",
    "окт",
    "ноя",
    "дек",
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}
