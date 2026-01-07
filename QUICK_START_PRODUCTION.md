# Быстрый старт: Подготовка к Production

## ✅ Чеклист (выполнить по порядку)

### 1. Проверка зависимостей (5 минут)
```bash
cd resume-builder
npm audit
npm audit fix  # если есть уязвимости
```

### 2. Включить RLS в Supabase (10 минут)
📄 **Инструкция:** `scripts/setup-rls.md`

**Кратко:**
1. Откройте Supabase Dashboard → SQL Editor
2. Выполните SQL из `scripts/migrate-rls.sql`
3. Проверьте что RLS включен

### 3. Настроить Sentry (15 минут)
📄 **Инструкция:** `scripts/setup-sentry.md`

**Кратко:**
1. Создайте проект в Sentry.io
2. Добавьте `NEXT_PUBLIC_SENTRY_DSN` в `.env.local` и Vercel
3. Настройте алерты на ошибки

### 4. Проверить бэкапы (5 минут)
📄 **Инструкция:** `scripts/check-backups.md`

**Кратко:**
1. Supabase Dashboard → Settings → Database → Backups
2. Убедитесь что бэкапы активны

### 5. Проверить Health Check (2 минуты)
```bash
npm run dev
# В другом терминале:
curl http://localhost:3000/api/health
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

### 6. Проверить сборку (2 минуты)
```bash
npm run build
npm run typecheck
```

### 7. Тестирование основных сценариев (30 минут)

Ручное тестирование:
- [ ] Регистрация нового пользователя
- [ ] Вход в систему
- [ ] Создание резюме
- [ ] Редактирование резюме
- [ ] Экспорт PDF
- [ ] Удаление резюме
- [ ] Проверка что нельзя видеть чужие резюме (после RLS)

## 🚀 После выполнения всех шагов

Проект готов к **ограниченному бета-тестированию** (10-50 пользователей).

## 📊 Мониторинг после запуска

1. Проверяйте Sentry каждые 15 минут первые 2 часа
2. Следите за health check: `curl https://your-domain.com/api/health`
3. Проверяйте логи Vercel

## ⚠️ Если что-то пошло не так

1. Проверьте логи в Sentry
2. Проверьте health endpoint
3. Проверьте переменные окружения в Vercel
4. Откатите деплой если нужно (Vercel Dashboard → Deployments → Rollback)

---

**Время выполнения:** ~1 час  
**Статус после выполнения:** ✅ GO для бета-тестирования

