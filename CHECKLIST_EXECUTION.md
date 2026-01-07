# Чеклист выполнения: Подготовка к Production

## ✅ Автоматически выполнено

- [x] Health check endpoint создан (`/api/health`)
- [x] SQL миграция для RLS создана (`scripts/migrate-rls.sql`)
- [x] Sentry server-side интеграция добавлена
- [x] Скрипты в package.json обновлены
- [x] Документация создана

## 📋 Ручные шаги (выполнить сейчас)

### 1. Обновить Next.js (КРИТИЧНО для безопасности)

```bash
cd resume-builder
npm install next@14.2.35
npm run build  # Проверить что всё работает
```

**Статус:** ⚠️ Требуется выполнить

---

### 2. Включить RLS в Supabase (КРИТИЧНО для безопасности)

**Время:** 5 минут

1. Откройте https://app.supabase.com
2. Выберите ваш проект
3. Перейдите в **SQL Editor**
4. Скопируйте и выполните SQL из файла `scripts/migrate-rls.sql`

**Проверка:**
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'resumes';
```
Должно вернуть: `resumes | true`

**Статус:** ❌ Не выполнено

---

### 3. Настроить Sentry (для мониторинга)

**Время:** 15 минут

1. Создайте проект на https://sentry.io (платформа: Next.js)
2. Скопируйте DSN
3. Добавьте в `.env.local`:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=ваш_dsn_из_sentry
   ```
4. Для Vercel: добавьте переменную в Settings → Environment Variables
5. Настройте алерты в Sentry Dashboard → Alerts

**Статус:** ⚠️ Требуется выполнить

---

### 4. Проверить бэкапы Supabase

**Время:** 2 минуты

1. Supabase Dashboard → Settings → Database → Backups
2. Убедитесь что статус "Active"

**Статус:** ⚠️ Требуется проверить

---

### 5. Проверить Health Check

**Время:** 2 минуты

```bash
npm run dev
# В другом терминале:
curl http://localhost:3000/api/health
```

Должно вернуть JSON со статусом "healthy"

**Статус:** ⚠️ Требуется проверить

---

### 6. Исправить уязвимости (опционально)

```bash
npm audit
npm audit fix  # Безопасные исправления
# npm audit fix --force  # Только если готовы к breaking changes
```

**Статус:** ⚠️ Есть уязвимости (Next.js 14.2.14 → 14.2.35)

---

## 🎯 После выполнения всех шагов

Проект будет готов к **ограниченному бета-тестированию** (10-50 пользователей).

## 📊 Мониторинг после запуска

1. Проверяйте Sentry первые 2 часа каждые 15 минут
2. Следите за health endpoint
3. Проверяйте логи Vercel

---

## 🚨 Критичные шаги (выполнить ПЕРЕД деплоем)

1. ✅ RLS включен в Supabase
2. ✅ Next.js обновлен до 14.2.35
3. ✅ Sentry настроен и получает события
4. ✅ Health check работает
5. ✅ Бэкапы активны

---

**Следующий шаг:** Выполните шаги 1-5 из списка выше.

