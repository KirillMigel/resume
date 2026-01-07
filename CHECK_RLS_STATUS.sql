-- Проверка статуса RLS для таблицы resumes

-- 1. Проверка что RLS включен
SELECT 
  tablename, 
  rowsecurity as "RLS включен"
FROM pg_tables 
WHERE tablename = 'resumes';

-- 2. Проверка всех политик RLS
SELECT 
  policyname as "Название политики",
  cmd as "Операция",
  qual as "Условие"
FROM pg_policies 
WHERE tablename = 'resumes'
ORDER BY cmd;

-- Ожидаемый результат:
-- 1. tablename = 'resumes', RLS включен = true
-- 2. Должно быть 4 политики (SELECT, INSERT, UPDATE, DELETE)

