#!/bin/bash
# Скрипт для выполнения чеклиста перед production

set -e

echo "🚀 Выполнение чеклиста перед production..."
echo ""

# 1. Проверка зависимостей
echo "📦 1. Проверка зависимостей..."
npm audit --audit-level=moderate || echo "⚠️  Есть уязвимости, но продолжаем"
echo ""

# 2. TypeScript проверка
echo "🔍 2. Проверка TypeScript..."
npm run typecheck
echo "✅ TypeScript проверка пройдена"
echo ""

# 3. Линтинг
echo "🧹 3. Линтинг..."
npm run lint || echo "⚠️  Есть предупреждения линтера"
echo ""

# 4. Сборка
echo "🏗️  4. Сборка проекта..."
npm run build
echo "✅ Сборка успешна"
echo ""

# 5. Health check (если сервер запущен)
echo "🏥 5. Проверка health endpoint..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Health check пройден"
else
    echo "⚠️  Health check не доступен (сервер не запущен?)"
    echo "   Запустите: npm run dev"
fi
echo ""

echo "✅ Чеклист выполнен!"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Выполните SQL миграцию RLS (см. scripts/setup-rls.md)"
echo "   2. Настройте Sentry (см. scripts/setup-sentry.md)"
echo "   3. Проверьте бэкапы Supabase (см. scripts/check-backups.md)"
echo ""

