# 🔒 Пошаговая инструкция: Включение RLS в Supabase

## 📍 Что делать на вашем скриншоте:

### Вариант 1: Использовать текущий запрос (проще)

1. **В редакторе SQL** (большое белое окно с кодом):
   - Удалите весь текущий код (CREATE TABLE и CREATE INDEX)
   - Или просто добавьте новый код внизу

2. **Скопируйте и вставьте этот SQL код:**

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

3. **Нажмите зеленую кнопку "Run"** (внизу справа, с иконкой ▶️)

4. **Проверьте результат:**
   - В панели "Results" (внизу) должно появиться сообщение об успехе
   - Если есть ошибка - скопируйте её и покажите мне

---

### Вариант 2: Создать новый запрос

1. **Нажмите кнопку "+"** (справа от вкладки "SQL User Resumes...")
   - Это создаст новую пустую вкладку

2. **Вставьте SQL код** (тот же, что выше)

3. **Нажмите "Run"**

---

## ✅ Проверка что RLS включен:

После выполнения SQL, создайте новый запрос и выполните:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'resumes';
```

**Ожидаемый результат:**
```
tablename | rowsecurity
----------+------------
resumes   | true
```

Если видите `rowsecurity = true` - значит RLS включен! ✅

---

## 🎯 Кратко:

1. Вставьте SQL код в редактор
2. Нажмите зеленую кнопку **"Run"** (внизу справа)
3. Проверьте результат

Готово! 🚀

