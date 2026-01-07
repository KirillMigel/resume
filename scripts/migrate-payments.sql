-- Миграция: Добавление таблицы payments и обновление resumes для монетизации
-- Дата: 2024-12-31
-- Версия: 1.0

-- ============================================
-- 1. Создание таблицы payments
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- в копейках (30000 = 300₽)
  currency TEXT NOT NULL DEFAULT 'RUB',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled', 'refunded')),
  payment_system TEXT NOT NULL CHECK (payment_system IN ('yookassa', 'stripe', 'cloudpayments')),
  payment_id TEXT, -- ID платежа в платежной системе
  payment_url TEXT, -- URL для оплаты (если нужен)
  metadata JSONB DEFAULT '{}'::jsonb, -- Дополнительные данные от платежной системы
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  succeeded_at TIMESTAMPTZ -- Когда платеж был успешно завершен
);

-- Индексы для payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_resume_id ON payments(resume_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- ============================================
-- 2. Обновление таблицы resumes
-- ============================================

-- Добавляем поля для отслеживания оплаты
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id);

-- Индексы для resumes
CREATE INDEX IF NOT EXISTS idx_resumes_is_paid ON resumes(is_paid);
CREATE INDEX IF NOT EXISTS idx_resumes_paid_at ON resumes(paid_at);

-- ============================================
-- 3. Row Level Security (RLS) для payments
-- ============================================

-- Включаем RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики (если есть)
DROP POLICY IF EXISTS "Users can only see their own payments" ON payments;
DROP POLICY IF EXISTS "Users can only insert their own payments" ON payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON payments;

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

-- ============================================
-- 4. Функция для автоматического обновления updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS trigger_update_payments_updated_at ON payments;
CREATE TRIGGER trigger_update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- ============================================
-- 5. Функция для обновления статуса резюме при успешной оплате
-- ============================================

CREATE OR REPLACE FUNCTION update_resume_on_payment_success()
RETURNS TRIGGER AS $$
BEGIN
  -- Если платеж успешен, обновляем резюме
  IF NEW.status = 'succeeded' AND OLD.status != 'succeeded' THEN
    UPDATE resumes
    SET 
      is_paid = TRUE,
      paid_at = NEW.succeeded_at,
      payment_id = NEW.id
    WHERE id = NEW.resume_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления резюме
DROP TRIGGER IF EXISTS trigger_update_resume_on_payment_success ON payments;
CREATE TRIGGER trigger_update_resume_on_payment_success
  AFTER UPDATE ON payments
  FOR EACH ROW
  WHEN (NEW.status = 'succeeded' AND OLD.status != 'succeeded')
  EXECUTE FUNCTION update_resume_on_payment_success();

-- ============================================
-- Готово!
-- ============================================

-- Проверка:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'payments';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'resumes' AND column_name IN ('is_paid', 'paid_at', 'payment_id');

