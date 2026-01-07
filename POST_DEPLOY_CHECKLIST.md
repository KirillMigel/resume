# ✅ Чеклист после деплоя на Vercel

**Проект:** resume1  
**URL:** https://resume1-ten.vercel.app

---

## 🔍 Шаг 1: Проверить Environment Variables

### В Vercel Dashboard:

1. Откройте проект **resume1**
2. Перейдите в **Settings** → **Environment Variables**
3. Проверьте что есть все переменные:

**Обязательные переменные:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://msjgjplzydclpabtuxom.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_VMNR3AzONHF0o_C-DMbk_A_-J_39w9U`
- [ ] `NEXT_PUBLIC_SENTRY_DSN` = `https://a4b4a83b6a90e3cfcebcfb60d105c94d@o4510613184970752.ingest.us.sentry.io/4510613199060992`
- [ ] `NODE_ENV` = `production` (только для Production)

**Если переменных нет:**
1. Нажмите **"Add New"**
2. Добавьте каждую переменную
3. Выберите Environment: **Production, Preview, Development** (кроме NODE_ENV - только Production)
4. Нажмите **"Save"**
5. **Важно:** После добавления переменных нужно **передеплоить** проект!

---

## 🔍 Шаг 2: Проверить Root Directory

### Если проект в подпапке `resume-builder`:

1. Откройте **Settings** → **General**
2. Найдите **"Root Directory"**
3. Если пусто - укажите `resume-builder`
4. Сохраните и передеплойте

---

## 🔍 Шаг 3: Проверить что сайт работает

### Откройте в браузере:

- [ ] https://resume1-ten.vercel.app - главная страница открывается
- [ ] Нет ошибок в консоли браузера (F12 → Console)
- [ ] Логотип и кнопки отображаются

---

## 🔍 Шаг 4: Проверить Health Check

### В терминале:

```bash
curl https://resume1-ten.vercel.app/api/health
```

**Ожидаемый результат:**
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

**Если 404:**
- Возможно нужно указать Root Directory (см. Шаг 2)
- Или передеплоить проект

---

## 🔍 Шаг 5: Протестировать основные функции

### В браузере:

1. **Регистрация:**
   - [ ] Откройте https://resume1-ten.vercel.app
   - [ ] Нажмите "Создать резюме"
   - [ ] Зарегистрируйтесь (или войдите)
   - [ ] Регистрация работает

2. **Создание резюме:**
   - [ ] Заполните личные данные
   - [ ] Добавьте опыт работы
   - [ ] Добавьте образование
   - [ ] Добавьте навыки
   - [ ] Все сохраняется

3. **Экспорт PDF:**
   - [ ] Нажмите "Скачать"
   - [ ] PDF скачивается
   - [ ] PDF открывается корректно

4. **Дашборд:**
   - [ ] Откройте https://resume1-ten.vercel.app/dashboard
   - [ ] Видны сохраненные резюме
   - [ ] Можно редактировать/удалять

---

## 🔍 Шаг 6: Проверить Sentry

### В Sentry Dashboard:

1. Откройте https://sentry.io
2. Перейдите в проект **Resumio**
3. Проверьте **Issues**:
   - [ ] Нет критичных ошибок
   - [ ] Environment = "production" (если есть события)

### Тестовая ошибка:

1. Откройте сайт в браузере
2. Откройте консоль (F12)
3. Выполните:
   ```javascript
   window.Sentry?.captureException(new Error("Test from production"))
   ```
4. Проверьте Sentry Dashboard - должно появиться событие

---

## 🔍 Шаг 7: Проверить логи Vercel

### В Vercel Dashboard:

1. Откройте проект **resume1**
2. Перейдите в **Logs**
3. Проверьте:
   - [ ] Нет критичных ошибок
   - [ ] Нет 500 ошибок
   - [ ] Запросы обрабатываются успешно

---

## ⚠️ Если что-то не работает

### Проблема: Health check возвращает 404

**Решение:**
1. Проверьте Root Directory в Settings → General
2. Если проект в подпапке - укажите `resume-builder`
3. Передеплойте проект

### Проблема: Ошибка "Missing Supabase environment variables"

**Решение:**
1. Проверьте Environment Variables (Шаг 1)
2. Убедитесь что переменные добавлены для **Production**
3. Передеплойте проект

### Проблема: Регистрация не работает

**Решение:**
1. Проверьте Environment Variables
2. Проверьте что Supabase URL и Key правильные
3. Проверьте логи Vercel на ошибки

---

## ✅ Готово!

Если все проверки пройдены - сервис готов к использованию!

**Следующий шаг:** Пригласить бета-тестеров и собрать feedback.

