# Инструкция по настройке

## Проблема: Не могу создать резюме и войти в профиль

Это происходит потому, что не настроен Supabase (база данных для хранения резюме и аутентификации).

## Решение:

### 1. Создайте проект в Supabase

1. Перейдите на https://app.supabase.com
2. Войдите или зарегистрируйтесь
3. Создайте новый проект
4. Дождитесь завершения создания проекта (1-2 минуты)

### 2. Получите ключи API

1. В проекте Supabase перейдите в Settings → API
2. Скопируйте:
   - **Project URL** (например: `https://xxxxx.supabase.co`)
   - **anon public** ключ (длинная строка)

### 3. Создайте файл .env.local

В корне проекта `resume-builder` создайте файл `.env.local`:

```bash
cd "/Users/kirillmigel/Desktop/Resume 2/resume-builder"
nano .env.local
```

Или через редактор кода создайте файл `.env.local` со следующим содержимым:

```
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-ключ
```

Замените значения на те, что скопировали из Supabase.

### 4. Создайте таблицу в базе данных

В Supabase перейдите в SQL Editor и выполните:

```sql
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_updated_at ON resumes(updated_at DESC);
```

### 5. Перезапустите dev-сервер

```bash
# Остановите текущий сервер (Ctrl+C)
# Затем запустите снова:
npm run dev
```

### 6. Проверьте работу

1. Откройте http://localhost:3000/auth
2. Создайте аккаунт (email и пароль)
3. После входа вы сможете создавать резюме

## Альтернатива: Работа без Supabase (только для тестирования)

Если вы хотите просто протестировать интерфейс без настройки базы данных, можно временно отключить проверку авторизации, но это не рекомендуется для продакшена.
