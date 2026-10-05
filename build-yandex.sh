#!/bin/bash

# Скрипт сборки Loot Hunter Stories для Яндекс Игр

echo "🎮 Сборка Loot Hunter Stories для Яндекс Игр..."
echo ""

# Очистка предыдущей сборки
echo "🧹 Очистка предыдущей сборки..."
rm -rf dist
rm -f loot-hunter-stories.zip

# Сборка проекта
echo "🔨 Сборка проекта..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки!"
    exit 1
fi

echo "✅ Сборка завершена успешно"
echo ""

# Создание ZIP-архива
echo "📦 Создание ZIP-архива..."
cd dist
zip -r ../loot-hunter-stories.zip .
cd ..

if [ $? -ne 0 ]; then
    echo "❌ Ошибка создания архива!"
    exit 1
fi

echo "✅ Архив создан: loot-hunter-stories.zip"
echo ""

# Информация о размере
SIZE=$(du -h loot-hunter-stories.zip | cut -f1)
echo "📊 Размер архива: $SIZE"
echo ""

echo "🚀 Следующие шаги:"
echo "1. Перейдите на games.yandex.ru"
echo "2. Откройте консоль разработчика"
echo "3. Загрузите файл loot-hunter-stories.zip"
echo "4. Заполните описание игры"
echo "5. Добавьте скриншоты и иконку"
echo "6. Отправьте на модерацию"
echo ""
echo "✅ Готово к публикации!"
