# 🎯 Действия для запуска в Production

## ⚡ Быстрый старт (30 минут)

### 1. Обновить Next.js (5 мин) ⚠️ КРИТИЧНО

```bash
cd resume-builder
rm -rf node_modules package-lock.json
npm install
npm run build  # Проверить что работает
```

**Почему:** Есть критические уязвимости безопасности в Next.js 14.2.14

---

### 2. Включить RLS в Supabase (5 мин) 🔴 КРИТИЧНО

1. Откройте https://app.supabase.com → ваш проект
2. SQL Editor → New query
3. Скопируйте весь SQL из файла `scripts/migrate-rls.sql`
4. Выполните (Run)
5. Проверьте:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'resumes';
   ```
   Должно быть: `resumes | true`

**Почему:** Без RLS пользователи могут видеть чужие резюме

---

### 3. Настроить Sentry (15 мин) 🟠 ВАЖНО

1. Создайте аккаунт на https://sentry.io
2. Создайте проект (Platform: Next.js)
3. Скопируйте DSN
4. Добавьте в `.env.local`:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```
5. Для Vercel: Settings → Environment Variables → добавить `NEXT_PUBLIC_SENTRY_DSN`
6. В Sentry Dashboard → Alerts → создать правило:
   - When: Error или Fatal
   - Action: Email notification

**Почему:** Нужен мониторинг ошибок в production

---

### 4. Проверить бэкапы (2 мин)

1. Supabase Dashboard → Settings → Database → Backups
2. Убедитесь что статус "Active"

**Почему:** Нужны бэкапы на случай проблем

---

### 5. Проверить Health Check (2 мин)

```bash
npm run dev
# В другом терминале:
curl http://localhost:3000/api/health
```

Должно вернуть JSON со `"status": "healthy"`

**Почему:** Нужен способ проверки работоспособности

---

## ✅ После выполнения всех шагов

Проект готов к **ограниченному бета-тестированию** (10-50 пользователей)

---

## 📋 Чеклист готовности

- [ ] Next.js обновлен до 14.2.35
- [ ] RLS включен в Supabase
- [ ] Sentry настроен и получает события
- [ ] Бэкапы активны
- [ ] Health check работает
- [ ] `npm run build` проходит без ошибок
- [ ] Протестированы основные сценарии:
  - [ ] Регистрация
  - [ ] Создание резюме
  - [ ] Экспорт PDF
  - [ ] Удаление резюме

---

## 🚀 Деплой

После выполнения всех шагов:

1. Закоммитьте изменения:
   ```bash
   git add .
   git commit -m "feat: production readiness improvements"
   git push
   ```

2. Деплой на Vercel:
   - Подключите GitHub репозиторий
   - Добавьте Environment Variables
   - Deploy

3. После деплоя:
   - Проверьте: `curl https://your-domain.com/api/health`
   - Проверьте Sentry (должны появиться события)
   - Протестируйте основные функции

---

## 📞 Если что-то пошло не так

1. Проверьте логи в Vercel Dashboard
2. Проверьте Sentry на ошибки
3. Проверьте health endpoint
4. Откатите деплой если нужно (Vercel → Deployments → Rollback)

---

**Время выполнения:** ~30 минут  
**Готовность после:** ✅ GO для бета-тестирования

