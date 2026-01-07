import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Часто задаваемые вопросы | Resumio",
  description: "Ответы на частые вопросы о создании резюме, экспорте PDF и использовании сервиса Resumio",
};

export default function FAQPage() {
  const faqs = [
    {
      question: "Как создать резюме?",
      answer: "Зарегистрируйтесь или войдите в аккаунт, затем нажмите 'Создать резюме' в дашборде. Заполните все необходимые разделы: личные данные, опыт работы, образование, навыки и ссылки. Резюме сохраняется автоматически.",
    },
    {
      question: "Можно ли редактировать резюме после создания?",
      answer: "Да, вы можете редактировать резюме в любое время. Просто откройте его в конструкторе, внесите изменения и сохраните.",
    },
    {
      question: "Как скачать резюме в PDF?",
      answer: "В конструкторе резюме нажмите кнопку 'Скачать' в правом верхнем углу. PDF файл будет сгенерирован и загружен на ваше устройство.",
    },
    {
      question: "Сколько резюме я могу создать?",
      answer: "Вы можете создать неограниченное количество резюме. Каждое резюме сохраняется отдельно в вашем дашборде.",
    },
    {
      question: "Можно ли добавить фото в резюме?",
      answer: "Да, вы можете загрузить фото в разделе 'Личные данные'. Фото автоматически обрезается и оптимизируется для резюме.",
    },
    {
      question: "Как удалить резюме?",
      answer: "В дашборде нажмите на меню (три точки) рядом с резюме и выберите 'Удалить'. Подтвердите удаление.",
    },
    {
      question: "Безопасны ли мои данные?",
      answer: "Да, все данные защищены. Мы используем шифрование и Row Level Security (RLS) для защиты ваших резюме. Только вы можете видеть и редактировать свои резюме.",
    },
    {
      question: "Что делать, если PDF не скачивается?",
      answer: "Проверьте подключение к интернету и попробуйте снова. Если проблема сохраняется, убедитесь что все обязательные поля заполнены. Если ошибка повторяется, свяжитесь с поддержкой.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Header with Logo and Navigation */}
      <header className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="/">
                <Image src="/resumio-logo.svg" alt="Resumio" width={143} height={40} priority />
              </Link>
              <Link
                href="/blog"
                className="text-sm font-medium text-[#333948] transition hover:text-[#218dd0] sm:text-base"
              >
                Блог
              </Link>
            </div>
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e3e2e7] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition hover:border-[#218dd0] sm:h-11 sm:w-11"
              aria-label="Профиль"
            >
              <Image src="/user.svg" alt="Профиль" width={24} height={24} loading="lazy" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold text-[#1f2937] sm:text-5xl">Часто задаваемые вопросы</h1>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="rounded-2xl border border-[#dfe7f4] bg-white p-6">
              <h2 className="mb-3 text-lg font-semibold text-[#1f2937]">{faq.question}</h2>
              <p className="text-[#4b5563] leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-[#dfe7f4] bg-[#f4f7fb] p-8 text-center">
          <h2 className="mb-4 text-xl font-semibold text-[#1f2937]">Не нашли ответ?</h2>
          <p className="mb-6 text-[#4b5563]">
            Свяжитесь с нами, и мы поможем решить ваш вопрос
          </p>
          <a
            href="mailto:support@example.com"
            className="inline-flex items-center justify-center rounded-full bg-[#218dd0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0c74c1]"
          >
            Написать в поддержку
          </a>
        </div>
      </div>
    </main>
  );
}

