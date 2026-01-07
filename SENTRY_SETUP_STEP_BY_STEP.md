# 🔧 Пошаговая настройка Sentry

## Шаг 1: Создайте аккаунт и проект в Sentry

1. **Откройте https://sentry.io**
2. **Войдите** или **зарегистрируйтесь** (можно через GitHub)
3. **Создайте новый проект:**
   - Нажмите **"Create Project"** или **"Add Project"**
   - Выберите платформу: **Next.js**
   - Название проекта: **Resumio** (или любое другое)
   - Нажмите **"Create Project"**

---

## Шаг 2: Получите DSN

После создания проекта Sentry покажет вам **DSN** (Data Source Name).

**DSN выглядит так:**
```
https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

**Где найти DSN:**
- Он отображается сразу после создания проекта
- Или: Settings → Projects → ваш проект → Client Keys (DSN)

**Скопируйте DSN** - он понадобится в следующем шаге.

---

## Шаг 3: Добавьте DSN в .env.local

1. **Откройте файл `.env.local`** в корне проекта `resume-builder`
   
   Если файла нет - создайте его:
   ```bash
   cd "/Users/kirillmigel/Desktop/Resume 2/resume-builder"
   touch .env.local
   ```

2. **Добавьте DSN в файл:**
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://ваш-dsn-из-sentry
   ```
   
   Замените `https://ваш-dsn-из-sentry` на реальный DSN из Sentry.

3. **Сохраните файл**

---

## Шаг 4: Перезапустите dev сервер

```bash
# Остановите текущий сервер (Ctrl+C)
# Затем запустите снова:
npm run dev
```

---

## Шаг 5: Настройте алерты (опционально, но рекомендуется)

1. В Sentry Dashboard перейдите в **Alerts** (в левом меню)
2. Нажмите **"Create Alert Rule"**
3. Настройте правило:
   - **Name**: "Resumio Errors"
   - **When**: An event is seen
   - **Conditions**: 
     - Level: **Error** или **Fatal**
     - Count: **1**
   - **Actions**: 
     - Send a notification via **Email**
   - Нажмите **"Save Rule"**

Теперь вы будете получать email при каждой ошибке.

---

## Шаг 6: Проверьте что Sentry работает

1. Откройте приложение: http://localhost:3000
2. Откройте консоль браузера (F12 → Console)
3. Должно быть сообщение об инициализации Sentry (если DSN настроен)

**Или протестируйте вручную:**
В консоли браузера выполните:
```javascript
Sentry.captureMessage("Test message from Resumio");
```

Затем проверьте в Sentry Dashboard → Issues - должно появиться сообщение.

---

## ✅ Готово!

Теперь все ошибки будут автоматически отправляться в Sentry.

---

## 📝 Для Vercel (Production)

Когда будете деплоить на Vercel:

1. Откройте Vercel Dashboard → ваш проект
2. Settings → Environment Variables
3. Добавьте:
   - **Key**: `NEXT_PUBLIC_SENTRY_DSN`
   - **Value**: ваш DSN из Sentry
   - **Environment**: Production, Preview, Development
4. Сохраните и передеплойте проект

---

## 🆘 Если что-то не работает

1. Проверьте что DSN правильный (скопирован полностью)
2. Проверьте что файл `.env.local` в корне проекта
3. Проверьте что перезапустили dev сервер после добавления DSN
4. Проверьте консоль браузера на ошибки

