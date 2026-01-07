# 🔔 Настройка алертов в Sentry

## Шаг 1: Откройте Sentry Dashboard

1. Перейдите на https://sentry.io
2. Войдите в свой аккаунт
3. Выберите проект **Resumio**

---

## Шаг 2: Создайте Alert Rule для критичных ошибок

### Alert 1: Критичные ошибки (Error/Fatal)

1. Перейдите в **Alerts** → **Create Alert Rule**
2. Настройте:
   - **Name**: "Critical Errors - Resumio"
   - **When**: An event is seen
   - **Conditions**:
     - Level: **Error** или **Fatal**
     - Count: **1** (для начала, потом можно увеличить)
     - Time window: **1 minute**
   - **Actions**:
     - ✅ Send a notification via **Email**
     - (Опционально) Send to Slack/Discord
   - **Filters** (опционально):
     - Environment: **production**
3. Нажмите **Save Rule**

---

### Alert 2: Много ошибок за короткое время

1. **Create Alert Rule**
2. Настройте:
   - **Name**: "High Error Rate - Resumio"
   - **When**: An event is seen
   - **Conditions**:
     - Level: **Error**
     - Count: **10** (10 ошибок)
     - Time window: **5 minutes**
   - **Actions**:
     - ✅ Send a notification via **Email**
3. Нажмите **Save Rule**

---

### Alert 3: Ошибки в PDF генерации

1. **Create Alert Rule**
2. Настройте:
   - **Name**: "PDF Export Errors"
   - **When**: An event is seen
   - **Conditions**:
     - Level: **Error**
     - Tags: `endpoint` = `/api/export`
     - Count: **1**
   - **Actions**:
     - ✅ Send a notification via **Email**
3. Нажмите **Save Rule**

---

## Шаг 3: Настройте уведомления

1. Перейдите в **Settings** → **Notifications**
2. Добавьте email для получения алертов
3. (Опционально) Подключите Slack/Discord

---

## Шаг 4: Проверьте работу алертов

### Тест 1: Отправка тестового события

В консоли браузера (на странице вашего сайта):
```javascript
Sentry.captureException(new Error("Test error for alerts"));
```

Должно прийти email уведомление.

### Тест 2: Проверка в Sentry Dashboard

1. Перейдите в **Issues**
2. Должно появиться событие "Test error for alerts"
3. Проверьте что оно правильно помечено

---

## ✅ Готово!

Теперь вы будете получать уведомления о критичных ошибках в production.

---

## 📊 Рекомендуемые метрики для отслеживания

После настройки алертов, можно добавить дашборды для отслеживания:
- Количество ошибок в день
- Топ ошибок
- Производительность (latency)
- Использование памяти Puppeteer

---

**Время настройки:** 10-15 минут

