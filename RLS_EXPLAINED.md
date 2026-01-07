# 🔒 Зачем нужен RLS (Row Level Security)?

## Проблема без RLS

### Текущая ситуация в коде:

**Функция `fetchResumes()` в `src/lib/supabase/resumes.ts`:**
```typescript
export const fetchResumes = async (): Promise<ResumeListItem[]> => {
  const { data, error } = await supabase
    .from("resumes")
    .select("id,title,updated_at,photo:data->personal->>photo,role:data->personal->>title")
    .order("updated_at", { ascending: false });
  // ❌ НЕТ фильтрации по user_id!
  return (data as ResumeListItem[]) ?? [];
};
```

**Что происходит:**
- ❌ Запрос возвращает ВСЕ резюме из базы данных
- ❌ Любой авторизованный пользователь может увидеть чужие резюме
- ❌ Можно получить доступ к чужим данным, зная ID резюме
- ❌ Защита только на уровне приложения (если забыть проверку - данные утекут)

### Пример атаки:

```typescript
// Злоумышленник может:
const allResumes = await fetchResumes(); // Получить ВСЕ резюме
const someoneResume = await fetchResume("чужой-id"); // Получить чужое резюме
```

---

## Решение: RLS (Row Level Security)

### Что такое RLS?

**RLS** - это механизм безопасности на уровне базы данных, который автоматически фильтрует строки в зависимости от того, кто делает запрос.

### Как это работает:

```sql
-- RLS автоматически добавляет условие к каждому запросу:
WHERE auth.uid() = user_id

-- То есть каждый SELECT превращается в:
SELECT * FROM resumes 
WHERE auth.uid() = user_id  -- ← Автоматически!
```

### Преимущества:

✅ **Защита на уровне БД** - даже если забыть проверку в коде, БД не вернет чужие данные  
✅ **Автоматическая фильтрация** - не нужно помнить добавлять `.eq("user_id", userId)`  
✅ **Второй слой безопасности** - если код сломается, БД защитит  
✅ **Невозможно обойти** - защита работает на уровне PostgreSQL  

---

## Что делает наша миграция RLS?

### 1. Включает RLS на таблице:
```sql
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
```

### 2. Создает 4 политики безопасности:

#### SELECT (чтение):
```sql
CREATE POLICY "Users can only see their own resumes" 
  ON resumes FOR SELECT
  USING (auth.uid() = user_id);
```
**Результат:** Пользователь видит только свои резюме

#### INSERT (создание):
```sql
CREATE POLICY "Users can only insert their own resumes" 
  ON resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```
**Результат:** Пользователь может создать резюме только со своим user_id

#### UPDATE (обновление):
```sql
CREATE POLICY "Users can only update their own resumes" 
  ON resumes FOR UPDATE
  USING (auth.uid() = user_id);
```
**Результат:** Пользователь может обновить только свои резюме

#### DELETE (удаление):
```sql
CREATE POLICY "Users can only delete their own resumes" 
  ON resumes FOR DELETE
  USING (auth.uid() = user_id);
```
**Результат:** Пользователь может удалить только свои резюме

---

## Пример работы:

### Без RLS:
```typescript
// Пользователь A делает запрос:
const resumes = await supabase.from("resumes").select("*");
// Результат: ВСЕ резюме (A, B, C, D...) ❌
```

### С RLS:
```typescript
// Пользователь A делает запрос:
const resumes = await supabase.from("resumes").select("*");
// Результат: Только резюме пользователя A ✅
// БД автоматически добавила: WHERE auth.uid() = user_id
```

---

## Почему это критично для production?

1. **GDPR/Защита данных** - утечка персональных данных = штрафы
2. **Репутация** - если пользователи увидят чужие резюме, доверие потеряно
3. **Юридические риски** - ответственность за утечку данных
4. **Безопасность** - без RLS любой баг в коде = утечка данных

---

## Итог:

**Без RLS:** Защита только в коде (можно забыть/сломать)  
**С RLS:** Защита в БД + в коде (двойная защита) ✅

**RLS = обязательный минимум для production!**

