# 🚀 Пошаговый деплой на Vercel

## Шаг 1: Подготовить код

### 1.1. Закоммитьте все изменения

```bash
cd "/Users/kirillmigel/Desktop/Resume 2/resume-builder"
git status  # Проверить что изменилось
git add .
git commit -m "feat: production ready - monitoring, FAQ, security"
git push
```

---

## Шаг 2: Создать проект в Vercel

### 2.1. Откройте Vercel

1. Перейдите на **https://vercel.com**
2. Войдите (можно через GitHub)

### 2.2. Создайте новый проект

1. Нажмите **"Add New..."** → **"Project"**
2. Если репозиторий уже подключен:
   - Выберите ваш репозиторий
   - Нажмите **"Import"**
3. Если репозитория нет:
   - Нажмите **"Import Git Repository"**
   - Подключите GitHub/GitLab/Bitbucket
   - Выберите репозиторий

---

## Шаг 3: Настроить проект

### 3.1. Настройки сборки

**Framework Preset:** Next.js (определится автоматически)

**Root Directory:**
- Если проект в корне репозитория: оставьте пустым
- Если в подпапке `resume-builder`: укажите `resume-builder`

**Build Command:** `npm run build` (по умолчанию)

**Output Directory:** `.next` (по умолчанию)

**Install Command:** `npm install` (по умолчанию)

---

## Шаг 4: Добавить Environment Variables

### 4.1. Перейдите в Settings → Environment Variables

После создания проекта, в настройках проекта:

1. Перейдите в **Settings** → **Environment Variables**

### 4.2. Добавьте переменные:

**1. NEXT_PUBLIC_SUPABASE_URL**
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://msjgjplzydclpabtuxom.supabase.co`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

**2. NEXT_PUBLIC_SUPABASE_ANON_KEY**
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `sb_publishable_VMNR3AzONHF0o_C-DMbk_A_-J_39w9U`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

**3. NEXT_PUBLIC_SENTRY_DSN**
- **Key:** `NEXT_PUBLIC_SENTRY_DSN`
- **Value:** `https://a4b4a83b6a90e3cfcebcfb60d105c94d@o4510613184970752.ingest.us.sentry.io/4510613199060992`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

**4. NODE_ENV**
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Environment:** ✅ Production только

---

## Шаг 5: Деплой

### 5.1. Нажмите "Deploy"

1. После настройки переменных окружения
2. Нажмите **"Deploy"** (или **"Deploy Project"**)
3. Дождитесь завершения (2-5 минут)

### 5.2. Получите URL

После деплоя вы получите URL вида:
- `resumio-xxxxx.vercel.app`
- Или ваш кастомный домен (если настроен)

---

## Шаг 6: Проверка после деплоя

### 6.1. Проверить что сайт открывается

1. Откройте URL из Vercel
2. Главная страница должна загрузиться
3. Нет ошибок в консоли браузера

### 6.2. Проверить health check

```bash
curl https://ваш-домен.vercel.app/api/health
```

Должно вернуть:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "checks": {
    "database": { "status": "ok" },
    "environment": { "status": "ok" }
  }
}
```

### 6.3. Протестировать основные функции

- [ ] Регистрация работает
- [ ] Вход работает
- [ ] Создание резюме работает
- [ ] Экспорт PDF работает

### 6.4. Проверить Sentry

1. Откройте https://sentry.io
2. Перейдите в **Issues**
3. Проверьте что события приходят из production
4. Environment должен быть "production"

---

## ✅ Готово!

Если все проверки прошли — сервис запущен и готов к использованию!

---

## 🔗 Полезные ссылки

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Sentry Dashboard:** https://sentry.io
- **Supabase Dashboard:** https://app.supabase.com

---

**Время деплоя:** 30-45 минут

