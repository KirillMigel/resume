# 💰 Архитектура монетизации сервиса Resumio

**Версия:** 1.0  
**Дата:** 2024-12-31  
**Модель:** Pay-per-download (300₽ за скачивание PDF)

---

## 🎯 Бизнес-логика

### Поток пользователя:

```
1. Пользователь создает резюме (бесплатно)
   ↓
2. Пользователь нажимает "Скачать PDF"
   ↓
3. Проверка: резюме уже оплачено?
   ├─ ДА → Скачиваем PDF сразу
   └─ НЕТ → Показываем страницу оплаты
       ↓
4. Пользователь оплачивает 300₽
   ↓
5. Webhook подтверждает оплату
   ↓
6. Резюме помечается как оплаченное
   ↓
7. PDF скачивается автоматически
   ↓
8. В будущем: повторное скачивание бесплатно
```

---

## 🗄️ Архитектура базы данных

### Таблица: `payments`

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- в копейках (30000 = 300₽)
  currency TEXT NOT NULL DEFAULT 'RUB',
  status TEXT NOT NULL, -- 'pending', 'succeeded', 'failed', 'canceled', 'refunded'
  payment_system TEXT NOT NULL, -- 'yookassa', 'stripe', 'cloudpayments'
  payment_id TEXT, -- ID платежа в платежной системе
  payment_url TEXT, -- URL для оплаты (если нужен)
  metadata JSONB, -- Дополнительные данные от платежной системы
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  succeeded_at TIMESTAMPTZ -- Когда платеж был успешно завершен
);

-- Индексы
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_resume_id ON payments(resume_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_id ON payments(payment_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);
```

### Обновление таблицы: `resumes`

```sql
-- Добавляем поля для отслеживания оплаты
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_resumes_is_paid ON resumes(is_paid);
CREATE INDEX IF NOT EXISTS idx_resumes_paid_at ON resumes(paid_at);
```

### Row Level Security (RLS) для `payments`

```sql
-- Включаем RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Политика: Пользователи видят только свои платежи
CREATE POLICY "Users can only see their own payments" 
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Политика: Пользователи могут создавать только свои платежи
CREATE POLICY "Users can only insert their own payments" 
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Политика: Пользователи могут обновлять только свои платежи (для статусов)
CREATE POLICY "Users can update their own payments" 
  ON payments FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## 🔌 API Endpoints

### 1. `/api/payments/create` (POST)

**Назначение:** Создает платеж и возвращает URL для оплаты

**Request:**
```json
{
  "resumeId": "uuid",
  "amount": 30000
}
```

**Response (успех):**
```json
{
  "paymentId": "uuid",
  "paymentUrl": "https://yookassa.ru/checkout/...",
  "amount": 30000,
  "status": "pending"
}
```

**Response (ошибка):**
```json
{
  "error": "Resume already paid",
  "message": "Это резюме уже оплачено"
}
```

**Логика:**
1. Проверяем что резюме существует и принадлежит пользователю
2. Проверяем что резюме еще не оплачено
3. Создаем запись в `payments` со статусом `pending`
4. Создаем платеж в платежной системе (ЮKassa/Stripe)
5. Сохраняем `payment_id` и `payment_url`
6. Возвращаем данные для редиректа

---

### 2. `/api/payments/webhook` (POST)

**Назначение:** Webhook от платежной системы для подтверждения оплаты

**Request (от ЮKassa):**
```json
{
  "type": "notification",
  "event": "payment.succeeded",
  "object": {
    "id": "payment_id_from_yookassa",
    "status": "succeeded",
    "amount": {
      "value": "300.00",
      "currency": "RUB"
    },
    "metadata": {
      "resumeId": "uuid",
      "userId": "uuid"
    }
  }
}
```

**Логика:**
1. Проверяем подпись запроса (безопасность)
2. Находим платеж по `payment_id`
3. Проверяем что платеж еще не обработан (идемпотентность)
4. Обновляем статус платежа на `succeeded`
5. Обновляем резюме: `is_paid = true`, `paid_at = NOW()`
6. Отправляем email пользователю (опционально)
7. Логируем событие в Sentry

---

### 3. `/api/payments/status/:paymentId` (GET)

**Назначение:** Проверяет статус платежа (для polling на фронтенде)

**Response:**
```json
{
  "status": "succeeded",
  "resumeId": "uuid",
  "canDownload": true,
  "paymentUrl": "https://yookassa.ru/checkout/..." // если pending
}
```

**Логика:**
1. Находим платеж по ID
2. Проверяем права доступа (только владелец)
3. Возвращаем текущий статус

---

### 4. `/api/export` (POST) - Обновление

**Изменения:**
- Добавить проверку оплаты перед генерацией PDF
- Если резюме не оплачено → вернуть ошибку с кодом `402 Payment Required`
- Если оплачено → генерировать PDF как обычно

**Request (без изменений):**
```json
{
  "resumeId": "uuid", // НОВОЕ: нужно передавать ID резюме
  "personal": {...},
  ...
}
```

**Response (если не оплачено):**
```json
{
  "error": "payment_required",
  "message": "Для скачивания резюме требуется оплата",
  "paymentUrl": "/payment/:resumeId"
}
```

---

## 🎨 Frontend компоненты

### 1. `PaymentModal` (новый компонент)

**Расположение:** `src/components/payment/payment-modal.tsx`

**Функционал:**
- Модальное окно с информацией о платеже
- Сумма: 300₽
- Кнопка "Оплатить" → редирект на `paymentUrl`
- Кнопка "Отмена"

**Props:**
```typescript
{
  resumeId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

---

### 2. `ExportButton` (обновление)

**Изменения:**
- Перед скачиванием проверять статус оплаты
- Если не оплачено → показывать `PaymentModal`
- Если оплачено → скачивать PDF как обычно

**Новая логика:**
```typescript
const handleDownload = async () => {
  // 1. Проверяем статус оплаты
  const paymentStatus = await checkPaymentStatus(resumeId);
  
  if (!paymentStatus.isPaid) {
    // 2. Показываем модалку оплаты
    setShowPaymentModal(true);
    return;
  }
  
  // 3. Скачиваем PDF
  await downloadPDF();
};
```

---

### 3. Страница `/payment/:resumeId` (новая)

**Расположение:** `src/app/payment/[resumeId]/page.tsx`

**Функционал:**
- Информация о резюме
- Сумма платежа (300₽)
- Кнопка "Оплатить" → создает платеж и редиректит на `paymentUrl`
- Обработка успешной оплаты (polling статуса)
- После успешной оплаты → редирект на скачивание PDF

**UI:**
```
┌─────────────────────────────┐
│  Оплата резюме              │
├─────────────────────────────┤
│  Резюме: [Название]         │
│  Сумма: 300₽                │
│                             │
│  [Оплатить 300₽]            │
│                             │
│  Способы оплаты:            │
│  • Банковская карта          │
│  • СБП                       │
│  • Электронные кошельки     │
└─────────────────────────────┘
```

---

### 4. Dashboard (обновление)

**Изменения:**
- Показывать статус оплаты для каждого резюме
- Иконка/бейдж "Оплачено" / "Не оплачено"
- Кнопка "Скачать" работает только для оплаченных
- Для неоплаченных → кнопка "Оплатить и скачать"

**UI:**
```
┌─────────────────────────────┐
│  Мои резюме                 │
├─────────────────────────────┤
│  [Резюме 1] [✅ Оплачено]   │
│  [Скачать] [Редактировать]   │
│                             │
│  [Резюме 2] [❌ Не оплачено]│
│  [Оплатить 300₽] [Редактировать]│
└─────────────────────────────┘
```

---

## 🔐 Безопасность

### 1. Проверка подписи webhook

```typescript
// ЮKassa отправляет подпись в заголовке
const signature = request.headers.get('x-yookassa-signature');
const isValid = verifySignature(body, signature, YOOKASSA_SECRET_KEY);
if (!isValid) {
  throw new Error('Invalid webhook signature');
}
```

### 2. Проверка суммы на сервере

```typescript
// Всегда проверяем сумму на сервере
const EXPECTED_AMOUNT = 30000; // 300₽ в копейках
if (payment.amount !== EXPECTED_AMOUNT) {
  throw new Error('Invalid payment amount');
}
```

### 3. Идемпотентность webhook

```typescript
// Проверяем что платеж не обработан дважды
const existingPayment = await getPayment(paymentId);
if (existingPayment.status === 'succeeded') {
  return; // Уже обработан, игнорируем
}
```

### 4. Проверка прав доступа

```typescript
// Пользователь может оплачивать только свои резюме
const resume = await fetchResume(resumeId, userId);
if (!resume || resume.user_id !== userId) {
  throw new Error('Access denied');
}
```

---

## 📊 Мониторинг и метрики

### Метрики для отслеживания:

1. **Количество созданных платежей** (`payments.created`)
2. **Количество успешных платежей** (`payments.succeeded`)
3. **Конверсия** (созданные → успешные)
4. **Средняя сумма платежа**
5. **Ошибки платежей** (`payments.failed`)

### Алерты в Sentry:

- Webhook не приходит > 5 минут после создания платежа
- Много failed платежей (>10% за час)
- Ошибки при создании платежа
- Ошибки при обработке webhook

---

## 🚀 План реализации (пошагово)

### Этап 1: Подготовка (День 1)

- [ ] Выбрать платежную систему (ЮKassa рекомендуется)
- [ ] Создать аккаунт и получить ключи
- [ ] Добавить ключи в `.env.local` и Vercel Environment Variables
- [ ] Изучить документацию платежной системы

**Время:** 2-3 часа

---

### Этап 2: База данных (День 1-2)

- [ ] Создать SQL миграцию для таблицы `payments`
- [ ] Обновить таблицу `resumes` (добавить поля)
- [ ] Настроить RLS для `payments`
- [ ] Протестировать миграции в Supabase

**Время:** 2-3 часа

---

### Этап 3: Backend API (День 2-3)

- [ ] Создать `/api/payments/create`
- [ ] Создать `/api/payments/webhook`
- [ ] Создать `/api/payments/status/:id`
- [ ] Обновить `/api/export` (добавить проверку оплаты)
- [ ] Добавить функции для работы с платежами в `lib/supabase/payments.ts`

**Время:** 4-6 часов

---

### Этап 4: Frontend (День 3-4)

- [ ] Создать компонент `PaymentModal`
- [ ] Создать страницу `/payment/:resumeId`
- [ ] Обновить `ExportButton` (добавить проверку оплаты)
- [ ] Обновить Dashboard (показывать статус оплаты)
- [ ] Добавить обработку успешной оплаты (polling)

**Время:** 4-6 часов

---

### Этап 5: Тестирование (День 4-5)

- [ ] Тест создания платежа (тестовый аккаунт)
- [ ] Тест webhook (симуляция от платежной системы)
- [ ] Тест скачивания после оплаты
- [ ] Тест повторного скачивания (должно быть бесплатно)
- [ ] Тест отмены платежа
- [ ] Тест обработки ошибок

**Время:** 3-4 часа

---

### Этап 6: Документация и запуск (День 5)

- [ ] Обновить документацию
- [ ] Настроить мониторинг
- [ ] Протестировать на production (малые суммы)
- [ ] Опубликовать договор оферты

**Время:** 2-3 часа

---

## 📦 Зависимости

### Новые npm пакеты:

```json
{
  "dependencies": {
    "@yookassa/node-sdk": "^2.0.0", // Для ЮKassa
    // или
    "stripe": "^14.0.0", // Для Stripe
  }
}
```

---

## 🔄 Альтернативные модели монетизации

### 1. Подписка (500₽/месяц)
- Неограниченное количество резюме
- Приоритетная поддержка
- Дополнительные шаблоны

### 2. Пакеты
- 3 резюме за 750₽ (экономия 150₽)
- 5 резюме за 1200₽ (экономия 300₽)

### 3. Freemium
- Бесплатно: 1 резюме
- Платно: неограниченно

---

## ⚠️ Важные моменты

1. **НДС:** Если вы ИП/ООО, нужно учесть НДС (20%)
2. **Возвраты:** Политика возврата средств (14 дней по закону)
3. **Договор оферты:** Обязательно для приема платежей
4. **Обработка персональных данных:** Нужно согласие пользователя
5. **Логирование:** Все платежи должны логироваться для аудита

---

## 📝 Чеклист перед запуском

- [ ] Платежная система настроена
- [ ] Тестовые платежи работают
- [ ] Webhook настроен и работает
- [ ] RLS включен для payments
- [ ] Обработка ошибок реализована
- [ ] Логирование платежей
- [ ] Мониторинг настроен
- [ ] Договор оферты опубликован
- [ ] Политика возврата средств
- [ ] Тестирование на реальных картах (малые суммы)

---

**Следующий шаг:** Начать с Этапа 1 - выбор платежной системы и получение ключей.

