/**
 * Telegram Bot Service
 * Handles all Telegram bot interactions
 * Supports both webhook (production) and polling (development) modes
 */

import { Telegraf, Context } from "telegraf";
import * as db from "./db";

// Initialize bot
export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "");

type BotContext = Context;

// Middleware to track/upsert users on every message
bot.use(async (ctx: BotContext, next) => {
  if (ctx.from?.id) {
    await db.upsertTelegramUser({
      telegramId: ctx.from.id,
      username: ctx.from.username,
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name,
    }).catch(err => console.error("[Bot] upsertTelegramUser failed:", err));
  }
  return next();
});

// ─── Main Menu ───────────────────────────────────────────────────────────────

const mainMenuKeyboard = {
  inline_keyboard: [
    [{ text: "📚 Уроки", callback_data: "lessons" }],
    [{ text: "📊 Мой прогресс", callback_data: "progress" }],
    [{ text: "💎 Купить доступ", callback_data: "buy_access" }],
  ],
};

bot.command("start", async (ctx: BotContext) => {
  await ctx.reply(
    `👋 Добро пожаловать в Trading Funnel Bot!\n\n` +
    `Здесь вы найдёте полный курс по трейдингу — 13 уроков.\n\n` +
    `📖 Первые 3 урока доступны бесплатно, остальные — за подписку.\n\n` +
    `Выберите действие:`,
    { reply_markup: mainMenuKeyboard }
  );
});

bot.command("help", async (ctx: BotContext) => {
  await ctx.reply(
    `ℹ️ Справка\n\n` +
    `/start — Главное меню\n` +
    `/help — Эта справка\n\n` +
    `По вопросам подписки: @orbitum_support`
  );
});

// ─── Lessons List ─────────────────────────────────────────────────────────────

bot.action("lessons", async (ctx: BotContext) => {
  const lessonsList = await db.getLessons();

  const keyboard = {
    inline_keyboard: [
      ...lessonsList.map(lesson => {
        const isFree = lesson.order <= 3;
        const icon = isFree ? "🆓" : "🔒";
        return [{ text: `${icon} ${lesson.order}. ${lesson.title}`, callback_data: `lesson_${lesson.id}` }];
      }),
      [{ text: "⬅️ Назад", callback_data: "back_menu" }],
    ],
  };

  await ctx.editMessageText("📚 Выберите урок:", { reply_markup: keyboard });
  await ctx.answerCbQuery();
});

// ─── Lesson Detail ────────────────────────────────────────────────────────────

bot.action(/^lesson_(\d+)$/, async (ctx: BotContext) => {
  const lessonId = parseInt((ctx as any).match?.[1] || "0");
  const [lesson, mats, user] = await Promise.all([
    db.getLesson(lessonId),
    db.getMaterialsByLesson(lessonId),
    db.getTelegramUser(ctx.from?.id || 0),
  ]);

  if (!lesson) { await ctx.answerCbQuery("Урок не найден"); return; }

  const canAccess = lesson.order <= 3 || user?.subscriptionStatus === "premium";

  if (!canAccess) {
    await ctx.editMessageText(
      `🔒 *${lesson.title}*\n\nЭтот урок доступен только для Premium подписчиков.\n\nКупите подписку, чтобы получить доступ ко всем материалам.`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💎 Купить Premium", callback_data: "buy_access" }],
            [{ text: "⬅️ К урокам", callback_data: "lessons" }],
          ],
        },
      }
    );
    await ctx.answerCbQuery();
    return;
  }

  const keyboard = {
    inline_keyboard: [
      ...mats.map(m => [{ text: `📄 ${m.order}. ${m.title}`, callback_data: `material_${m.id}` }]),
      [{ text: "⬅️ К урокам", callback_data: "lessons" }],
    ],
  };

  const desc = lesson.description ? `\n\n${lesson.description}` : "";
  await ctx.editMessageText(`📖 *${lesson.title}*${desc}`, { parse_mode: "Markdown", reply_markup: keyboard });
  await ctx.answerCbQuery();
});

// ─── Material Content ─────────────────────────────────────────────────────────

bot.action(/^material_(\d+)$/, async (ctx: BotContext) => {
  const materialId = parseInt((ctx as any).match?.[1] || "0");
  const material = await db.getMaterial(materialId);

  if (!material) { await ctx.answerCbQuery("Материал не найден"); return; }

  // Record view
  await db.recordMaterialView(ctx.from?.id || 0, materialId).catch(() => {});

  let content = `📄 *${material.title}*`;
  if (material.description) content += `\n_${material.description}_`;
  content += `\n\n`;

  if (material.contentType === "link" && material.contentUrl) {
    content += `🔗 [Открыть материал](${material.contentUrl})`;
  } else if (material.contentText) {
    content += material.contentText;
  } else {
    content += "_Материал пока недоступен_";
  }

  await ctx.editMessageText(content, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "⬅️ К уроку", callback_data: `lesson_${material.lessonId}` }],
        [{ text: "📚 К урокам", callback_data: "lessons" }],
      ],
    },
  });

  await ctx.answerCbQuery("✅ Просмотрено");
});

// ─── Progress ─────────────────────────────────────────────────────────────────

bot.action("progress", async (ctx: BotContext) => {
  const [viewed, allLessons] = await Promise.all([
    db.getUserViewedMaterials(ctx.from?.id || 0),
    db.getLessons(),
  ]);

  const user = await db.getTelegramUser(ctx.from?.id || 0);
  const statusLabel = user?.subscriptionStatus === "premium" ? "💎 Premium" : "🆓 Бесплатный";

  await ctx.editMessageText(
    `📊 *Ваш прогресс*\n\n` +
    `Статус: ${statusLabel}\n` +
    `Уроков в курсе: ${allLessons.length}\n` +
    `Просмотрено материалов: ${viewed.length}\n\n` +
    `Продолжайте учиться! 💪`,
    {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: [[{ text: "⬅️ Назад", callback_data: "back_menu" }]] },
    }
  );
  await ctx.answerCbQuery();
});

// ─── Buy Access ───────────────────────────────────────────────────────────────

bot.action("buy_access", async (ctx: BotContext) => {
  await ctx.editMessageText(
    `💎 *Premium подписка*\n\n` +
    `Получите доступ ко всем 13 урокам и материалам курса.\n\n` +
    `📩 Свяжитесь с нами для оформления:`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📩 Написать @orbitum_support", url: "https://t.me/orbitum_support" }],
          [{ text: "⬅️ Назад", callback_data: "back_menu" }],
        ],
      },
    }
  );
  await ctx.answerCbQuery();
});

// ─── Back to Menu ─────────────────────────────────────────────────────────────

bot.action("back_menu", async (ctx: BotContext) => {
  await ctx.editMessageText("👋 *Trading Funnel Bot*\n\nВыберите действие:", {
    parse_mode: "Markdown",
    reply_markup: mainMenuKeyboard,
  });
  await ctx.answerCbQuery();
});

// ─── Error Handler ────────────────────────────────────────────────────────────

bot.catch((err: any, ctx: any) => {
  console.error("[Bot] Error:", err?.message || err);
  if (ctx?.reply) {
    ctx.reply("❌ Произошла ошибка. Попробуйте позже.").catch(() => {});
  }
});

// ─── Launch ───────────────────────────────────────────────────────────────────

export async function launchBot() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn("[Bot] TELEGRAM_BOT_TOKEN not set, skipping bot launch");
    return;
  }

  try {
    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;

    if (webhookUrl && process.env.NODE_ENV === "production") {
      // Production: webhook mode (works with Vercel/Railway/any server)
      const webhookPath = "/api/telegram/webhook";
      await bot.telegram.setWebhook(`${webhookUrl}${webhookPath}`);
      console.log(`[Bot] Webhook set: ${webhookUrl}${webhookPath}`);
    } else {
      // Development: polling mode
      await bot.launch();
      console.log("[Bot] Polling mode started");
    }
  } catch (error) {
    console.error("[Bot] Failed to launch:", error);
  }
}

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
