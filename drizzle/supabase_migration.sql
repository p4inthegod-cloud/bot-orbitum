-- ============================================================
-- Trading Funnel Bot — Supabase PostgreSQL Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enums
CREATE TYPE role AS ENUM ('user', 'admin');
CREATE TYPE subscription_status AS ENUM ('free', 'premium', 'trial');
CREATE TYPE content_type AS ENUM ('text', 'link', 'pdf', 'video');
CREATE TYPE access_level AS ENUM ('free', 'premium');
CREATE TYPE target_users AS ENUM ('all', 'free', 'premium', 'specific');
CREATE TYPE broadcast_status AS ENUM ('draft', 'scheduled', 'sent');

-- Users (admin panel auth)
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  "openId"    VARCHAR(64) NOT NULL UNIQUE,
  name        TEXT,
  email       VARCHAR(320),
  "loginMethod" VARCHAR(64),
  role        role NOT NULL DEFAULT 'user',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "lastSignedIn" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Lessons
CREATE TABLE lessons (
  id            SERIAL PRIMARY KEY,
  lesson_number INTEGER NOT NULL UNIQUE,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  "order"       INTEGER NOT NULL,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Materials
CREATE TABLE materials (
  id           SERIAL PRIMARY KEY,
  lesson_id    INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  content_type content_type DEFAULT 'text',
  content_url  TEXT,
  content_text TEXT,
  access_level access_level DEFAULT 'free',
  "order"      INTEGER NOT NULL,
  "createdAt"  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Telegram users (bot subscribers)
CREATE TABLE telegram_users (
  id                     SERIAL PRIMARY KEY,
  telegram_id            BIGINT NOT NULL UNIQUE,
  username               VARCHAR(255),
  first_name             VARCHAR(255),
  last_name              VARCHAR(255),
  subscription_status    subscription_status DEFAULT 'free',
  subscription_expires_at TIMESTAMP,
  is_blocked             BOOLEAN DEFAULT FALSE,
  joined_at              TIMESTAMP NOT NULL DEFAULT NOW(),
  last_active_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdAt"            TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"            TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User progress
CREATE TABLE user_progress (
  id              SERIAL PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  material_id     INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  viewed_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Broadcasts
CREATE TABLE broadcasts (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  content          TEXT NOT NULL,
  target_users     target_users DEFAULT 'all',
  specific_user_ids TEXT,
  status           broadcast_status DEFAULT 'draft',
  scheduled_at     TIMESTAMP,
  sent_at          TIMESTAMP,
  recipients_count INTEGER DEFAULT 0,
  success_count    INTEGER DEFAULT 0,
  created_by       INTEGER,
  "createdAt"      TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bot stats
CREATE TABLE bot_stats (
  id               SERIAL PRIMARY KEY,
  date             TIMESTAMP NOT NULL,
  total_users      INTEGER DEFAULT 0,
  free_users       INTEGER DEFAULT 0,
  premium_users    INTEGER DEFAULT 0,
  new_users_today  INTEGER DEFAULT 0,
  materials_viewed INTEGER DEFAULT 0,
  broadcasts_sent  INTEGER DEFAULT 0,
  "createdAt"      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── Seed: 13 lessons ────────────────────────────────────────────────────────
INSERT INTO lessons (lesson_number, title, description, "order") VALUES
(1,  'Вступление и риск-менеджмент',    'Основы трейдинга и управление рисками',  1),
(2,  'Постоянство в трейдинге',          'Психология и дисциплина трейдера',       2),
(3,  'Трендовая структура (часть 1)',    'Как читать структуру рынка',             3),
(4,  'Трендовая структура (часть 2)',    'Продолжение изучения структуры',         4),
(5,  'Ликвидность (часть 1)',            'Зоны ликвидности и их значение',         5),
(6,  'Ликвидность (часть 2)',            'Sweep ликвидности и охота за стопами',   6),
(7,  'Точки интереса (часть 1)',         'Ключевые уровни и зоны интереса',        7),
(8,  'Точки интереса (часть 2)',         'Order blocks и зоны дисбаланса',         8),
(9,  'Ренджи (часть 1)',                 'Торговые диапазоны и их анализ',         9),
(10, 'Ренджи (часть 2)',                 'Работа внутри диапазонов',              10),
(11, 'SMT (Smart Money Concepts)',       'Манипуляции умных денег',               11),
(12, 'Торговые сессии',                 'Азиатская, Лондонская, Нью-Йорк',       12),
(13, 'Проп-трейдинговые компании',      'Как пройти оценку и получить капитал',  13);

-- ─── Seed: sample materials for first 3 lessons ──────────────────────────────
INSERT INTO materials (lesson_id, title, content_type, content_text, access_level, "order") VALUES
(1, 'Что такое трейдинг и зачем им заниматься', 'text',
 'Трейдинг — это покупка и продажа финансовых активов с целью получения прибыли от изменения цены. В этом уроке мы разберём базовые концепции и почему правильный старт критически важен.', 'free', 1),
(1, 'Основы управления рисками (Risk Management)', 'text',
 'Правило №1 в трейдинге — сохранение капитала. Никогда не рискуй более 1-2% от депозита в одной сделке. Используй стоп-лоссы всегда.', 'free', 2),
(1, 'Размер позиции и расчёт лота', 'text',
 'Формула расчёта: Лот = (Депозит × Риск%) / (Стоп в пунктах × Стоимость пункта). Научись считать размер позиции автоматически.', 'free', 3),
(2, 'Почему 90% трейдеров теряют деньги', 'text',
 'Главная причина — отсутствие дисциплины и торговля по эмоциям. В этом уроке разберём психологические ловушки и как их избежать.', 'free', 1),
(2, 'Создание торгового плана', 'text',
 'Торговый план должен включать: критерии входа, критерии выхода, управление риском, разрешённые инструменты и время торговли.', 'free', 2),
(3, 'Что такое рыночная структура', 'text',
 'Рыночная структура — это последовательность Higher Highs (HH) и Higher Lows (HL) в восходящем тренде, или Lower Lows (LL) и Lower Highs (LH) в нисходящем.', 'free', 1),
(3, 'Break of Structure (BOS) и Change of Character (CHoCH)', 'text',
 'BOS — подтверждение продолжения тренда. CHoCH — сигнал возможного разворота. Это ключевые концепции Smart Money подхода.', 'free', 2),
-- Premium lessons (4-13) - placeholder materials
(4, 'Структура на младших таймфреймах', 'text', 'Контент доступен для Premium подписчиков.', 'premium', 1),
(5, 'Внешняя и внутренняя ликвидность', 'text', 'Контент доступен для Premium подписчиков.', 'premium', 1),
(6, 'Sweep ликвидности — как определить', 'text', 'Контент доступен для Premium подписчиков.', 'premium', 1),
(7, 'Order Blocks (OB)', 'text', 'Контент доступен для Premium подписчиков.', 'premium', 1),
(8, 'Fair Value Gap (FVG)', 'text', 'Контент доступен для Premium подписчиков.', 'premium', 1),
(9, 'Определение диапазонов', 'text', 'Контент доступен для Premium подписчиков.', 'premium', 1),
(10, 'Торговля от границ диапазона', 'text', 'Контент доступен для Premium подписчиков.', 'premium', 1),
(11, 'Smart Money Trap', 'text', 'Контент доступен для Premium подписчиков.', 'premium', 1),
(12, 'Killzones и лучшее время для торговли', 'text', 'Контент доступен для Premium подписчиков.', 'premium', 1),
(13, 'FTMO, MyForexFunds и другие пропы', 'text', 'Контент доступен для Premium подписчиков.', 'premium', 1);
