# 🚀 Развертывание Trading Funnel Bot - Упрощенная версия

**Без кода! Только клики в веб-интерфейсе.**

---

## Шаг 1️⃣: Supabase (База данных) - 5 минут

### 1.1 Создание БД

1. Откройте [https://supabase.com](https://supabase.com)

1. Нажмите **Sign Up** (или войдите )

1. Нажмите **"New Project"**

1. Заполните:
  - **Project name**: `trading-funnel-bot`
  - **Database Password**: Придумайте пароль, сохраните его!
  - **Region**: Выберите ближайший регион

1. Нажмите **"Create new project"** и ждите 2-3 минуты

### 1.2 Получение адреса БД

1. В Supabase откройте **Settings** (левое меню)

1. Нажмите **Database**

1. Найдите **Connection string** → **URI**

1. Скопируйте строку (выглядит так):

   ```
   postgresql://postgres:ВАШ_ПАРОЛЬ@db.РЕГИОН.supabase.co:5432/postgres
   ```

1. **Сохраните эту строку** - она нужна для Vercel!

### 1.3 Создание таблиц

1. В Supabase нажмите **SQL Editor** (левое меню)

1. Нажмите **New query**

1. Скопируйте весь текст из файла `drizzle/migrations/0000_init.sql` (он в папке проекта)

1. Вставьте в SQL Editor

1. Нажмите **Run** (или Ctrl+Enter)

1. Готово! Таблицы созданы

**Проверка:** Откройте **Table Editor** - должны быть таблицы: users, lessons, materials, broadcasts

---

## Шаг 2️⃣: GitHub (Хранилище кода) - 3 минуты

### 2.1 Создание репозитория

1. Откройте [https://github.com](https://github.com)

1. Нажмите **Sign Up** (или войдите )

1. Нажмите **"+"** в правом верхнем углу → **"New repository"**

1. Заполните:
  - **Repository name**: `trading-funnel-bot`
  - **Description**: `Telegram bot for trading education`
  - **Visibility**: **Private** (если не хотите, чтобы все видели код)

1. Нажмите **"Create repository"**

### 2.2 Загрузка файлов

1. На странице репозитория нажмите **"Add file"** → **"Upload files"**

1. Откройте папку `/home/ubuntu/trading_funnel_bot` на вашем компьютере

1. Выберите **все файлы и папки** (Ctrl+A)

1. Перетащите их в GitHub или нажмите **"choose your files"**

1. Внизу нажмите **"Commit changes"**

1. Готово! Все файлы загружены

**Проверка:** На странице репозитория должны быть папки: client, server, drizzle, package.json и т.д.

---

## Шаг 3️⃣: Vercel (Хостинг) - 5 минут

### 3.1 Подключение GitHub

1. Откройте [https://vercel.com](https://vercel.com)

1. Нажмите **Sign Up** (или войдите через GitHub )

1. Нажмите **"Add New"** → **"Project"**

1. Нажмите **"Import Git Repository"**

1. Найдите `trading-funnel-bot` в списке

1. Нажмите **"Import"**

### 3.2 Добавление переменных окружения

1. На странице импорта найдите раздел **"Environment Variables"**

1. Добавьте переменные (нажимайте **"Add"** для каждой):

| Название | Значение |
| --- | --- |
| `DATABASE_URL` | Строка из Supabase (шаг 1.2) |
| `TELEGRAM_BOT_TOKEN` | Токен от @BotFather в Telegram |
| `JWT_SECRET` | Любой набор символов (например: `abc123xyz789`) |
| `VITE_APP_ID` | `default` |
| `OAUTH_SERVER_URL` | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | `https://portal.manus.im` |

**Как получить Telegram Bot Token:**

1. Откройте Telegram

1. Найдите @BotFather

1. Отправьте `/newbot`

1. Следуйте инструкциям

1. Скопируйте токен

### 3.3 Развертывание

1. Нажмите **"Deploy"**

1. Ждите (обычно 3-5 минут )

1. Когда появится зеленая галочка - готово!

1. Нажмите **"Visit"** - откроется ваш сайт

**Ваш сайт:** [https://trading-funnel-bot.vercel.app](https://trading-funnel-bot.vercel.app) (примерно )

---

## Шаг 4️⃣: Telegram Бот - 2 минуты

### 4.1 Установка webhook

1. Откройте этот URL в браузере (замените `TOKEN` на ваш токен):

   ```
   https://api.telegram.org/botТОКЕН/setWebhook?url=https://ВАШ_VERCEL_URL/api/telegram/webhook
   ```

   Пример:

   ```
   https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/setWebhook?url=https://trading-funnel-bot.vercel.app/api/telegram/webhook
   ```

1. Если в браузере появилось `"ok":true` - webhook установлен!

### 4.2 Тестирование бота

1. Откройте Telegram

1. Найдите вашего бота

1. Отправьте `/start`

1. Должно появиться меню с уроками

---

## ✅ Чек-лист

- [ ] Supabase проект создан

- [ ] DATABASE_URL скопирован

- [ ] Таблицы созданы в Supabase

- [ ] GitHub репозиторий создан

- [ ] Все файлы загружены на GitHub

- [ ] Vercel проект создан

- [ ] Все переменные окружения добавлены

- [ ] Vercel развернул проект (зеленая галочка )

- [ ] Telegram Bot Token получен

- [ ] Webhook установлен

- [ ] Бот отвечает на `/start` в Telegram

---

## 🔧 Если что-то не работает

### Админ-панель не открывается

1. Откройте https://ВАШ_VERCEL_URL/admin

1. Если ошибка 404 - ждите еще минуту, проект еще загружается

1. Если ошибка 500 - проверьте DATABASE_URL в Vercel Settings

### Бот не отвечает

1. Проверьте, что webhook установлен правильно (откройте URL из шага 4.1 )

1. Убедитесь, что TELEGRAM_BOT_TOKEN правильный

1. Ждите 1-2 минуты после установки webhook

### Ошибка при загрузке файлов на GitHub

1. Если файлов слишком много - загружайте папками

1. Или используйте GitHub Desktop (приложение для Windows/Mac)

---

## 📱 После развертывания

### Админ-панель

- URL: https://ВАШ_VERCEL_URL/admin

- Там можно:
  - Смотреть статистику пользователей
  - Управлять пользователями
  - Отправлять рассылки
  - Видеть структуру курса

### Telegram Бот

- Пользователи могут:
  - Смотреть 13 уроков
  - Первые 3 урока бесплатно
  - Остальные за подписку
  - Отслеживать прогресс

---

## 🔄 Обновление кода

Если нужно изменить что-то:

1. Откройте папку проекта на компьютере

1. Отредактируйте нужный файл

1. Откройте GitHub репозиторий

1. Нажмите **"Add file"** → **"Upload files"**

1. Выберите измененный файл

1. Нажмите **"Commit changes"**

1. Vercel автоматически перестроит проект (2-5 минут )

---

## 💡 Советы

- **Сохраняйте пароли**: DATABASE_URL, TELEGRAM_BOT_TOKEN, JWT_SECRET

- **Не делитесь токенами**: Никому не показывайте TELEGRAM_BOT_TOKEN

- **Резервная копия**: Периодически скачивайте файлы с GitHub

- **Мониторинг**: Смотрите логи в Vercel → Deployments → Logs

---

## 🆘 Контакты

- Supabase Support: [https://supabase.com/support](https://supabase.com/support)

- Vercel Support: [https://vercel.com/support](https://vercel.com/support)

- Telegram Bot API: [https://core.telegram.org/bots](https://core.telegram.org/bots)