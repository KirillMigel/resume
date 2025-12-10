export type Experience = {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  level: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

export type LinkItem = {
  id: string;
  label: string;
  url: string;
};

export type ResumeTheme = {
  accent: string;
  density: "normal" | "compact";
};

export type ResumeData = {
  personal: {
    fullName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    photo: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  links: LinkItem[];
  theme: ResumeTheme;
};

const uid = () => crypto.randomUUID();

export const blankExperience = (): Experience => ({
  id: uid(),
  role: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
});

export const blankEducation = (): Education => ({
  id: uid(),
  school: "",
  degree: "",
  level: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
});

export const blankLink = (): LinkItem => ({
  id: uid(),
  label: "",
  url: "",
});

export const emptyResume = (): ResumeData => ({
  personal: {
    fullName: "",
    lastName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    photo: "",
  },
  summary: "",
  experience: [blankExperience()],
  education: [blankEducation()],
  skills: [],
  links: [blankLink()],
  theme: {
    accent: "#218dd0",
    density: "normal",
  },
});

export const demoResume: ResumeData = {
  personal: {
    fullName: "Полина",
    lastName: "Иванова",
    title: "Product Designer",
    email: "polina@example.com",
    phone: "+7 (999) 123-45-67",
    location: "Москва, Россия",
    website: "https://polina.design",
    photo: "",
  },
  summary:
    "Создаю понятные цифровые продукты, люблю системный подход к дизайну и тесную работу с бизнесом. Веду команды, организую дизайн-процессы и отвечаю за результат.",
  experience: [
    {
      id: uid(),
      role: "Lead Product Designer",
      company: "Flowly",
      location: "Москва, Россия",
      startDate: "Июнь 2021",
      endDate: "Настоящее время",
      current: true,
      description:
        "Руководила командой из 4 дизайнеров, построила дизайн-систему, увеличила конверсию онбординга на 22%.",
    },
    {
      id: uid(),
      role: "Senior Product Designer",
      company: "MarketJet",
      location: "Санкт-Петербург",
      startDate: "Март 2019",
      endDate: "Май 2021",
      current: false,
      description:
        "Запустила новый B2B кабинет, который принес +15% выручки. Настроила процесс исследования пользователей.",
    },
  ],
  education: [
    {
      id: uid(),
      school: "Британская высшая школа дизайна",
      degree: "Дизайн цифровых продуктов",
      level: "Магистратура",
      location: "Москва",
      startDate: "2017",
      endDate: "2019",
      current: false,
      description: "Проекты с реальными заказчиками, защита диплома с оценкой «отлично».",
    },
  ],
  skills: [
    "Product thinking",
    "Design systems",
    "UX research",
    "Figma",
    "Team leadership",
  ],
  links: [
    { id: uid(), label: "LinkedIn", url: "https://linkedin.com/in/polina" },
    { id: uid(), label: "Dribbble", url: "https://dribbble.com/polina" },
  ],
  theme: {
    accent: "#218dd0",
    density: "normal",
  },
};
