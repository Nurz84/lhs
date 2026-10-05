@echo off
REM Скрипт сборки Loot Hunter Stories для Яндекс Игр (Windows)

echo.
echo 🎮 Сборка Loot Hunter Stories для Яндекс Игр...
echo.

REM Очистка предыдущей сборки
echo 🧹 Очистка предыдущей сборки...
if exist dist rmdir /s /q dist
if exist loot-hunter-stories.zip del loot-hunter-stories.zip

REM Сборка проекта
echo 🔨 Сборка проекта...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Ошибка сборки!
    pause
    exit /b 1
)

echo ✅ Сборка завершена успешно
echo.

REM Создание ZIP-архива
echo 📦 Создание ZIP-архива...
powershell -Command "Compress-Archive -Path dist\* -DestinationPath loot-hunter-stories.zip -Force"

if %errorlevel% neq 0 (
    echo ❌ Ошибка создания архива!
    pause
    exit /b 1
)

echo ✅ Архив создан: loot-hunter-stories.zip
echo.

REM Информация о размере
for %%A in (loot-hunter-stories.zip) do echo 📊 Размер архива: %%~zA байт
echo.

echo 🚀 Следующие шаги:
echo 1. Перейдите на games.yandex.ru
echo 2. Откройте консоль разработчика
echo 3. Загрузите файл loot-hunter-stories.zip
echo 4. Заполните описание игры
echo 5. Добавьте скриншоты и иконку
echo 6. Отправьте на модерацию
echo.
echo ✅ Готово к публикации!
pause
