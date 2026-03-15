import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { bot } from "./telegram-bot";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Admin API — protected by adminProcedure (role === 'admin')
  admin: router({
    stats: adminProcedure.query(async () => {
      return db.getStats();
    }),

    users: adminProcedure.query(async () => {
      return db.getAllTelegramUsers();
    }),

    setSubscription: adminProcedure
      .input(z.object({
        telegramId: z.number(),
        status: z.enum(["free", "premium", "trial"]),
      }))
      .mutation(async ({ input }) => {
        await db.setUserSubscription(input.telegramId, input.status);
        return { success: true };
      }),

    createBroadcast: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        targetUsers: z.enum(["all", "free", "premium", "specific"]),
        specificUserIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ input }) => {
        const specificUserIds = input.specificUserIds?.length
          ? JSON.stringify(input.specificUserIds)
          : null;
        return db.createBroadcast({
          title: input.title,
          content: input.content,
          targetUsers: input.targetUsers,
          specificUserIds,
          status: "draft",
        });
      }),

    broadcasts: adminProcedure.query(async () => {
      return db.getBroadcasts();
    }),

    // ✅ Fixed: actually sends messages via Telegram
    sendBroadcast: adminProcedure
      .input(z.object({ broadcastId: z.number() }))
      .mutation(async ({ input }) => {
        const broadcast = await db.getBroadcast(input.broadcastId);
        if (!broadcast) throw new TRPCError({ code: "NOT_FOUND", message: "Broadcast not found" });
        if (broadcast.status === "sent") throw new TRPCError({ code: "BAD_REQUEST", message: "Already sent" });

        // Get target users
        let users: { telegramId: number }[] = [];
        if (broadcast.targetUsers === "all") {
          users = await db.getAllTelegramUsers();
        } else if (broadcast.targetUsers === "specific" && broadcast.specificUserIds) {
          const ids: number[] = JSON.parse(broadcast.specificUserIds);
          users = ids.map(id => ({ telegramId: id }));
        } else {
          users = await db.getTelegramUsersByStatus(broadcast.targetUsers as "free" | "premium" | "trial");
        }

        let successCount = 0;
        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        if (!botToken) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Bot token not configured" });
        }

        // Send messages with rate limiting (30 msg/sec Telegram limit)
        for (const user of users) {
          try {
            await bot.telegram.sendMessage(user.telegramId, broadcast.content, { parse_mode: "Markdown" });
            successCount++;
            // Small delay to avoid hitting Telegram rate limits
            await new Promise(r => setTimeout(r, 35));
          } catch (err: any) {
            // User may have blocked the bot — log and continue
            console.warn(`[Broadcast] Failed to send to ${user.telegramId}:`, err?.message);
          }
        }

        await db.updateBroadcastStatus(input.broadcastId, "sent", new Date(), successCount);
        return { success: true, sent: successCount, total: users.length };
      }),
  }),

  // Bot public API (used by tRPC if needed externally)
  bot: router({
    getUser: publicProcedure
      .input(z.object({ telegramId: z.number() }))
      .query(async ({ input }) => db.getTelegramUser(input.telegramId)),

    getLessons: publicProcedure.query(async () => db.getLessons()),

    getMaterialsByLesson: publicProcedure
      .input(z.object({ lessonId: z.number() }))
      .query(async ({ input }) => db.getMaterialsByLesson(input.lessonId)),
  }),
});

export type AppRouter = typeof appRouter;
