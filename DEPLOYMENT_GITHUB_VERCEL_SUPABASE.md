# Развертывание Trading Funnel Bot на GitHub, Vercel и Supabase

Полная инструкция по развертыванию Telegram-бота с админ-панелью в production.

---

## Часть 1: GitHub

### Шаг 1.1: Создание репозитория на GitHub

1. Откройте [GitHub](https://github.com) и авторизуйтесь
2. Нажмите **"+"** → **"New repository"**
3. Заполните:
   - **Repository name**: `trading-funnel-bot`
   - **Description**: `Telegram bot for trading education with admin panel`
   - **Visibility**: Private (если нужно скрыть код)
   - Не инициализируйте README, .gitignore, license

### Шаг 1.2: Загрузка кода на GitHub

```bash
# Перейдите в папку проекта
cd /home/ubuntu/trading_funnel_bot

# Инициализируйте git (если еще не инициализирован)
git init

# Добавьте все файлы
git add .

# Первый коммит
git commit -m "Initial commit: Trading Funnel Bot MVP"

# Добавьте удаленный репозиторий
git remote add origin https://github.com/YOUR_USERNAME/trading-funnel-bot.git

# Отправьте на GitHub
git branch -M main
git push -u origin main
```

### Шаг 1.3: Проверка на GitHub

- Откройте https://github.com/YOUR_USERNAME/trading-funnel-bot
- Убедитесь, что все файлы загружены

---

## Часть 2: Supabase (База данных)

### Шаг 2.1: Создание проекта в Supabase

1. Откройте [Supabase](https://supabase.com) и авторизуйтесь
2. Нажмите **"New project"**
3. Заполните:
   - **Project name**: `trading-funnel-bot`
   - **Database password**: Сохраните безопасно!
   - **Region**: Выберите ближайший регион
   - Нажмите **"Create new project"** (ждите 2-3 минуты)

### Шаг 2.2: Получение DATABASE_URL

1. В Supabase перейдите в **Settings** → **Database**
2. Найдите **Connection string** → **URI**
3. Скопируйте строку подключения (выглядит как):
   ```
   postgresql://postgres:PASSWORD@db.REGION.supabase.co:5432/postgres
   ```

### Шаг 2.3: Создание таблиц в Supabase

1. В Supabase откройте **SQL Editor**
2. Создайте новый запрос и скопируйте содержимое из `drizzle/migrations/` (файл с расширением `.sql`)
3. Выполните запрос

Или используйте Drizzle CLI:

```bash
# Установите переменные окружения
export DATABASE_URL="postgresql://postgres:PASSWORD@db.REGION.supabase.co:5432/postgres"

# Примените миграции
pnpm db:push
```

### Шаг 2.4: Проверка таблиц

В Supabase → **Table Editor** должны появиться таблицы:
- `users`
- `telegram_users`
- `lessons`
- `materials`
- `broadcasts`
- `bot_stats`

---

## Часть 3: Vercel (Развертывание)

### Шаг 3.1: Подготовка проекта

Убедитесь, что в корне проекта есть файлы:
- `vercel.json` (конфигурация)
- `.env.example` (пример переменных)

Создайте `vercel.json`:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "other",
  "outputDirectory": "dist",
  "env": {
    "DATABASE_URL": "@database_url",
    "TELEGRAM_BOT_TOKEN": "@telegram_bot_token",
    "JWT_SECRET": "@jwt_secret",
    "VITE_APP_ID": "@vite_app_id",
    "OAUTH_SERVER_URL": "@oauth_server_url",
    "VITE_OAUTH_PORTAL_URL": "@vite_oauth_portal_url"
  }
}
```

Создайте `.env.example`:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here

# OAuth (from Manus)
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
JWT_SECRET=your_jwt_secret
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Optional
VITE_FRONTEND_FORGE_API_KEY=your_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

Добавьте в `.gitignore`:

```
.env
.env.local
.env.*.local
dist/
node_modules/
*.db
*.sqlite
```

### Шаг 3.2: Подключение к Vercel

1. Откройте [Vercel](https://vercel.com) и авторизуйтесь
2. Нажмите **"Add New..."** → **"Project"**
3. Выберите **"Import Git Repository"**
4. Найдите `trading-funnel-bot` и нажмите **"Import"**

### Шаг 3.3: Настройка переменных окружения

1. В Vercel перейдите в **Settings** → **Environment Variables**
2. Добавьте переменные:

```
DATABASE_URL = postgresql://postgres:PASSWORD@db.REGION.supabase.co:5432/postgres
TELEGRAM_BOT_TOKEN = your_bot_token_from_botfather
JWT_SECRET = your_random_secret_key
VITE_APP_ID = your_manus_app_id
OAUTH_SERVER_URL = https://api.manus.im
VITE_OAUTH_PORTAL_URL = https://portal.manus.im
VITE_FRONTEND_FORGE_API_KEY = your_key
VITE_FRONTEND_FORGE_API_URL = https://api.manus.im
```

### Шаг 3.4: Развертывание

1. Нажмите **"Deploy"**
2. Ждите завершения (2-5 минут)
3. После завершения получите URL: `https://trading-funnel-bot.vercel.app`

### Шаг 3.5: Проверка развертывания

```bash
# Проверьте, что админ-панель работает
curl https://trading-funnel-bot.vercel.app

# Проверьте API
curl https://trading-funnel-bot.vercel.app/api/trpc/admin.stats
```

---

## Часть 4: Настройка Telegram бота

### Шаг 4.1: Установка webhook (вместо polling)

Webhook позволяет боту получать обновления через HTTPS вместо постоянного опроса.

```bash
# Установите webhook на Vercel URL
curl -X POST https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://trading-funnel-bot.vercel.app/api/telegram/webhook",
    "allowed_updates": ["message", "callback_query"]
  }'
```

### Шаг 4.2: Проверка webhook

```bash
# Получите информацию о webhook
curl https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo
```

Результат должен показать:
```json
{
  "ok": true,
  "result": {
    "url": "https://trading-funnel-bot.vercel.app/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

---

## Часть 5: Полный чек-лист

### Перед развертыванием

- [ ] Код загружен на GitHub
- [ ] Supabase проект создан
- [ ] Таблицы БД созданы
- [ ] DATABASE_URL скопирован
- [ ] Telegram Bot Token получен от @BotFather
- [ ] Vercel проект создан
- [ ] Все переменные окружения добавлены в Vercel
- [ ] Проект успешно развернут

### После развертывания

- [ ] Админ-панель доступна по https://trading-funnel-bot.vercel.app
- [ ] Telegram бот отвечает на `/start`
- [ ] Webhook установлен и работает
- [ ] Статистика показывает пользователей
- [ ] Рассылки отправляются корректно

---

## Часть 6: Обновление кода

### Обновление на GitHub и автоматический деплой

```bash
# Внесите изменения в код
# Например, отредактируйте client/src/pages/AdminDashboard.tsx

# Добавьте изменения
git add .

# Создайте коммит
git commit -m "Update: Improve admin dashboard UI"

# Отправьте на GitHub
git push origin main
```

Vercel автоматически заметит изменения и перестроит проект (2-5 минут).

---

## Часть 7: Мониторинг и логи

### Логи Vercel

1. Откройте Vercel → **Deployments**
2. Нажмите на последний деплой
3. Смотрите логи в **Logs**

### Логи Supabase

1. Откройте Supabase → **Logs**
2. Смотрите логи БД и API

### Telegram логи

Логи Telegram бота выводятся в консоль Vercel:

```
[Bot] Starting Telegram bot...
[Bot] Telegram bot launched successfully
```

---

## Часть 8: Масштабирование

### Если нужно больше мощности

**Vercel Pro** ($20/месяц):
- Больше вычислительных ресурсов
- Приоритетная поддержка
- Больше функций

**Supabase Pro** ($25/месяц):
- Больше хранилища БД
- Больше API запросов
- Приоритетная поддержка

---

## Часть 9: Безопасность

### Защита переменных окружения

✅ **Правильно:**
- Переменные хранятся в Vercel Settings
- Не коммитятся в GitHub
- Используются `.env.example` для документации

❌ **Неправильно:**
- Коммитить `.env` файл
- Публиковать токены в коде
- Использовать одинаковые пароли

### Защита БД

1. В Supabase включите **Row Level Security (RLS)**
2. Создайте политики доступа для таблиц
3. Ограничьте IP адреса (если возможно)

---

## Часть 10: Решение проблем

### Бот не отвечает

```bash
# Проверьте webhook
curl https://api.telegram.org/bot{TOKEN}/getWebhookInfo

# Переустановите webhook
curl -X POST https://api.telegram.org/bot{TOKEN}/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://trading-funnel-bot.vercel.app/api/telegram/webhook"}'
```

### Ошибка подключения к БД

```bash
# Проверьте DATABASE_URL в Vercel
# Убедитесь, что Supabase проект запущен
# Проверьте пароль БД

# Переподключитесь
export DATABASE_URL="postgresql://..."
pnpm db:push
```

### Админ-панель не загружается

1. Откройте DevTools (F12)
2. Смотрите Console для ошибок
3. Проверьте Network tab для API запросов
4. Смотрите логи Vercel

---

## Контакты и поддержка

- **GitHub Issues**: Создавайте issues для багов
- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.com
- **Telegram Bot API**: https://core.telegram.org/bots/api

---

## Дополнительные ресурсы

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegraf Documentation](https://telegraf.js.org/)
- [tRPC Documentation](https://trpc.io/)

