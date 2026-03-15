# Trading Funnel Bot - Развертывание

## Требования

- Node.js 18+
- PostgreSQL / MySQL
- Telegram Bot Token
- Manus OAuth credentials

## Переменные окружения

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Database
DATABASE_URL=mysql://user:password@host:3306/trading_bot

# OAuth (автоматически инъектируются Manus)
VITE_APP_ID=...
OAUTH_SERVER_URL=...
JWT_SECRET=...
```

## Получение Telegram Bot Token

1. Откройте Telegram и найдите @BotFather
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Скопируйте полученный токен

## Развертывание

### 1. Локальное тестирование

```bash
# Установка зависимостей
pnpm install

# Миграция БД
pnpm db:push

# Запуск в режиме разработки
pnpm dev
```

Бот будет доступен по адресу: `http://localhost:3000`

### 2. Запуск Telegram бота

Бот автоматически запускается при старте сервера, если установлен `TELEGRAM_BOT_TOKEN`.

Проверьте логи:
```bash
# В терминале разработки
[Bot] Starting Telegram bot...
[Bot] Telegram bot launched successfully
```

### 3. Тестирование бота

1. Найдите вашего бота в Telegram
2. Отправьте `/start`
3. Проверьте меню с уроками

### 4. Админ-панель

Откройте админ-панель в браузере:
- URL: `http://localhost:3000/admin`
- Требуется роль `admin` в БД

## Структура проекта

```
trading_funnel_bot/
├── client/                  # React админ-панель
│   └── src/pages/
│       ├── AdminDashboard.tsx
│       ├── AdminUsers.tsx
│       ├── AdminBroadcasts.tsx
│       └── AdminMaterials.tsx
├── server/
│   ├── telegram-bot.ts      # Telegram бот
│   ├── routers.ts           # tRPC API
│   ├── db.ts                # Функции БД
│   └── seed-data.ts         # Данные уроков
├── drizzle/
│   └── schema.ts            # Схема БД
└── package.json
```

## API Endpoints

### Public (для бота)
- `POST /api/trpc/bot.getUser` - получить пользователя
- `POST /api/trpc/bot.upsertUser` - создать/обновить пользователя
- `POST /api/trpc/bot.getLessons` - список уроков
- `POST /api/trpc/bot.getMaterialsByLesson` - материалы урока
- `POST /api/trpc/bot.getMaterial` - один материал
- `POST /api/trpc/bot.recordView` - записать просмотр
- `POST /api/trpc/bot.getUserProgress` - прогресс пользователя

### Admin (для админ-панели)
- `POST /api/trpc/admin.stats` - статистика
- `POST /api/trpc/admin.users` - список пользователей
- `POST /api/trpc/admin.createBroadcast` - создать рассылку
- `POST /api/trpc/admin.broadcasts` - список рассылок
- `POST /api/trpc/admin.sendBroadcast` - отправить рассылку

## Функции

### Telegram Bot
- ✅ Меню с 13 уроками
- ✅ Бесплатный доступ к первым 3 урокам
- ✅ Просмотр материалов
- ✅ Отслеживание прогресса
- ✅ Кнопка "Купить доступ"

### Админ-панель
- ✅ Dashboard со статистикой
- ✅ Управление пользователями
- ✅ Создание и отправка рассылок
- ✅ Просмотр структуры курса

## Следующие шаги

1. **Интеграция платежей** (Stripe/YooKassa)
   - Добавить `webdev_add_feature` с `feature="stripe"`
   - Реализовать обработку платежей

2. **Автоматизация рассылок**
   - Добавить расписание для рассылок
   - Интеграция с Telegram для отправки

3. **Аналитика**
   - Отслеживание конверсии free → premium
   - Статистика просмотров

4. **Расширение контента**
   - Добавить видео-материалы
   - Интеграция с Notion для контента

## Поддержка

Для вопросов и поддержки свяжитесь с разработчиком.
