# 💰 План монетизации: Скачивание резюме за 300₽

## 🎯 Концепция

**Модель:** Pay-per-download (плата за скачивание)

**Механика:**
1. Пользователь создает резюме (бесплатно)
2. При попытке скачать PDF → показываем страницу оплаты
3. После успешной оплаты (300₽):
   - PDF скачивается
   - Резюме сохраняется в дашборде с пометкой "Оплачено"
   - Пользователь может скачивать это резюме повторно бесплатно

---

## 🔧 Техническая реализация

### 1. Выбор платежной системы

#### Вариант A: ЮKassa (Яндекс.Касса) ⭐ Рекомендуется для РФ
**Плюсы:**
- Работает в России
- Принимает карты, СБП, электронные кошельки
- Комиссия: ~3-5%
- Хорошая документация

**Минусы:**
- Только для РФ/СНГ

**Документация:** https://yookassa.ru/developers

---

#### Вариант B: Stripe
**Плюсы:**
- Международные платежи
- Отличная документация
- Много способов оплаты

**Минусы:**
- Не работает напрямую в РФ (нужен посредник)
- Комиссия: ~3% + 30₽

**Документация:** https://stripe.com/docs

---

#### Вариант C: CloudPayments
**Плюсы:**
- Работает в России
- Простая интеграция
- Комиссия: ~2.5-3%

**Минусы:**
- Меньше функций чем у ЮKassa

**Документация:** https://cloudpayments.ru/docs

---

### 2. Структура базы данных

#### Новая таблица: `payments`

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- в копейках (30000 = 300₽)
  status TEXT NOT NULL, -- 'pending', 'succeeded', 'failed', 'canceled'
  payment_system TEXT NOT NULL, -- 'yookassa', 'stripe', etc.
  payment_id TEXT, -- ID платежа в платежной системе
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_resume_id ON payments(resume_id);
CREATE INDEX idx_payments_status ON payments(status);
```

#### Обновление таблицы: `resumes`

```sql
ALTER TABLE resumes ADD COLUMN is_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE resumes ADD COLUMN paid_at TIMESTAMPTZ;
CREATE INDEX idx_resumes_is_paid ON resumes(is_paid);
```

---

### 3. API Endpoints

#### `/api/payments/create` (POST)
Создает платеж и возвращает URL для оплаты

**Request:**
```json
{
  "resumeId": "uuid",
  "amount": 30000
}
```

**Response:**
```json
{
  "paymentId": "uuid",
  "paymentUrl": "https://yookassa.ru/checkout/...",
  "amount": 30000
}
```

---

#### `/api/payments/webhook` (POST)
Webhook от платежной системы для подтверждения оплаты

**Request (от ЮKassa):**
```json
{
  "event": "payment.succeeded",
  "object": {
    "id": "payment_id",
    "status": "succeeded",
    "amount": { "value": "300.00" },
    "metadata": {
      "resumeId": "uuid",
      "userId": "uuid"
    }
  }
}
```

**Действия:**
1. Проверяем подпись запроса
2. Обновляем статус платежа в БД
3. Помечаем резюме как оплаченное
4. Отправляем email пользователю (опционально)

---

#### `/api/payments/status/:paymentId` (GET)
Проверяет статус платежа

**Response:**
```json
{
  "status": "succeeded",
  "resumeId": "uuid",
  "canDownload": true
}
```

---

### 4. Обновление компонентов

#### `ExportButton` → `ExportButtonWithPayment`

```typescript
// Логика:
1. Проверяем: isResumePaid(resumeId)
2. Если оплачено → сразу скачиваем
3. Если нет → показываем модалку оплаты
4. После оплаты → скачиваем
```

---

#### Новая страница: `/payment/:resumeId`

Страница оплаты с:
- Информацией о резюме
- Суммой (300₽)
- Кнопкой "Оплатить"
- Способы оплаты (карта, СБП, и т.д.)

---

### 5. Обновление Dashboard

- Показывать статус оплаты для каждого резюме
- Фильтр "Оплаченные" / "Неоплаченные"
- Кнопка "Скачать" только для оплаченных (или ведет на оплату)

---

## 📋 План реализации (пошагово)

### День 1: Настройка платежной системы
- [ ] Выбрать платежную систему (ЮKassa рекомендуется)
- [ ] Создать аккаунт и получить ключи
- [ ] Добавить ключи в `.env.local`:
  ```env
  YOOKASSA_SHOP_ID=your_shop_id
  YOOKASSA_SECRET_KEY=your_secret_key
  YOOKASSA_WEBHOOK_SECRET=your_webhook_secret
  ```

---

### День 2: База данных и API
- [ ] Создать таблицу `payments` в Supabase
- [ ] Добавить поля `is_paid`, `paid_at` в `resumes`
- [ ] Создать API endpoint `/api/payments/create`
- [ ] Создать API endpoint `/api/payments/webhook`
- [ ] Создать API endpoint `/api/payments/status/:id`
- [ ] Настроить RLS для таблицы `payments`

---

### День 3: Frontend
- [ ] Создать страницу `/payment/:resumeId`
- [ ] Обновить `ExportButton` → добавить проверку оплаты
- [ ] Обновить Dashboard → показывать статус оплаты
- [ ] Добавить модалку оплаты
- [ ] Добавить обработку успешной оплаты

---

### День 4: Тестирование
- [ ] Тест создания платежа
- [ ] Тест webhook (можно использовать тестовый аккаунт)
- [ ] Тест скачивания после оплаты
- [ ] Тест повторного скачивания (должно быть бесплатно)
- [ ] Тест отмены платежа

---

## 🔒 Безопасность

### 1. Проверка подписи webhook
```typescript
// ЮKassa отправляет подпись в заголовке
const signature = request.headers['x-yookassa-signature'];
const isValid = verifySignature(body, signature, secret);
if (!isValid) throw new Error('Invalid signature');
```

### 2. Проверка суммы
```typescript
// Всегда проверяем сумму на сервере
if (payment.amount !== 30000) {
  throw new Error('Invalid amount');
}
```

### 3. Идемпотентность
```typescript
// Проверяем что платеж не обработан дважды
const existingPayment = await getPayment(paymentId);
if (existingPayment.status === 'succeeded') {
  return; // Уже обработан
}
```

### 4. RLS для payments
```sql
-- Пользователи видят только свои платежи
CREATE POLICY "Users can only see their own payments" 
  ON payments FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 📊 Мониторинг

### Метрики для отслеживания:
- Количество созданных платежей
- Количество успешных платежей
- Конверсия (созданные → успешные)
- Средняя сумма платежа
- Ошибки платежей

### Алерты:
- Webhook не приходит > 5 минут
- Много failed платежей (>10% за час)
- Ошибки при создании платежа

---

## 💡 Дополнительные возможности

### 1. Промокоды
- Скидка 10-20% для первых пользователей
- Промокод "BETA" для бесплатного скачивания

### 2. Пакеты
- 3 резюме за 750₽ (экономия 150₽)
- 5 резюме за 1200₽ (экономия 300₽)

### 3. Подписка
- 500₽/месяц = неограниченное количество резюме

---

## ⚠️ Важные моменты

1. **НДС:** Если вы ИП/ООО, нужно учесть НДС (20%)
2. **Возвраты:** Политика возврата средств (14 дней по закону)
3. **Договор оферты:** Обязательно для приема платежей
4. **Обработка персональных данных:** Нужно согласие пользователя

---

## 📝 Чеклист перед запуском платежей

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

## 🚀 Оценка времени

- **Минимум:** 3-4 дня (базовая реализация)
- **Рекомендуется:** 5-7 дней (с тестами и мониторингом)
- **Идеально:** 7-10 дней (с дополнительными фичами)

---

**Следующий шаг:** Выбрать платежную систему и начать с Дня 1 плана реализации.

