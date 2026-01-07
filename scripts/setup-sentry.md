# Настройка Sentry для мониторинга

## Шаг 1: Создайте проект в Sentry

1. Перейдите на https://sentry.io
2. Войдите или зарегистрируйтесь
3. Создайте новый проект:
   - Platform: **Next.js**
   - Project Name: **Resumio**

## Шаг 2: Получите DSN

После создания проекта Sentry покажет вам DSN (Data Source Name).
Он выглядит примерно так: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`

## Шаг 3: Добавьте DSN в переменные окружения

### Для локальной разработки:
Добавьте в `.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

### Для Vercel (Production):
1. Откройте проект в Vercel Dashboard
2. Перейдите в Settings → Environment Variables
3. Добавьте:
   - Key: `NEXT_PUBLIC_SENTRY_DSN`
   - Value: ваш DSN из Sentry
   - Environment: Production, Preview, Development

## Шаг 4: Настройте алерты в Sentry

1. В Sentry Dashboard перейдите в **Alerts**
2. Создайте новый Alert Rule:
   - **When**: An event is seen
   - **Conditions**: 
     - Level: Error или Fatal
     - Count: 1 (или больше для production)
   - **Actions**: 
     - Send a notification via Email
     - (Опционально) Send to Slack

3. Сохраните правило

## Шаг 5: Проверьте что Sentry работает

1. Запустите приложение: `npm run dev`
2. Откройте консоль браузера
3. Sentry должен автоматически инициализироваться (если DSN настроен)

## Готово! ✅

Теперь все ошибки будут автоматически отправляться в Sentry, и вы получите уведомления.

