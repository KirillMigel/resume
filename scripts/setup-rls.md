# Инструкция по включению RLS в Supabase

## Шаг 1: Откройте Supabase Dashboard

1. Перейдите на https://app.supabase.com
2. Войдите в свой аккаунт
3. Выберите проект Resumio

## Шаг 2: Откройте SQL Editor

1. В левом меню нажмите на "SQL Editor"
2. Нажмите "New query"

## Шаг 3: Выполните SQL миграцию

Скопируйте и выполните следующий SQL код:

```sql
-- Включаем RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Политика: Пользователи могут видеть только свои резюме
CREATE POLICY "Users can only see their own resumes" 
  ON resumes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Политика: Пользователи могут создавать только свои резюме
CREATE POLICY "Users can only insert their own resumes" 
  ON resumes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Политика: Пользователи могут обновлять только свои резюме
CREATE POLICY "Users can only update their own resumes" 
  ON resumes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Политика: Пользователи могут удалять только свои резюме
CREATE POLICY "Users can only delete their own resumes" 
  ON resumes
  FOR DELETE
  USING (auth.uid() = user_id);
```

## Шаг 4: Проверьте что RLS включен

Выполните проверочный запрос:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'resumes';
```

Должно вернуть: `resumes | true`

## Шаг 5: Проверьте политики

```sql
SELECT * FROM pg_policies WHERE tablename = 'resumes';
```

Должно быть 4 политики (SELECT, INSERT, UPDATE, DELETE).

## Готово! ✅

После выполнения этих шагов ваши данные будут защищены на уровне базы данных.

