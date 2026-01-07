-- Миграция: Включение Row Level Security (RLS) для таблицы resumes
-- Дата: 2024-12-23
-- Описание: Защита данных пользователей на уровне БД

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

-- Проверка: Убедитесь что RLS включен
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'resumes';
-- Должно вернуть: resumes | true

