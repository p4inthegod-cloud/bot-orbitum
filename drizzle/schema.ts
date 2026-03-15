import {
  pgTable,
  pgEnum,
  text,
  varchar,
  integer,
  bigint,
  boolean,
  timestamp,
  serial,
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["free", "premium", "trial"]);
export const contentTypeEnum = pgEnum("content_type", ["text", "link", "pdf", "video"]);
export const accessLevelEnum = pgEnum("access_level", ["free", "premium"]);
export const targetUsersEnum = pgEnum("target_users", ["all", "free", "premium", "specific"]);
export const broadcastStatusEnum = pgEnum("broadcast_status", ["draft", "scheduled", "sent"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  lessonNumber: integer("lesson_number").notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  contentType: contentTypeEnum("content_type").default("text"),
  contentUrl: text("content_url"),
  contentText: text("content_text"),
  accessLevel: accessLevelEnum("access_level").default("free"),
  order: integer("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

export const telegramUsers = pgTable("telegram_users", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }).notNull().unique(),
  username: varchar("username", { length: 255 }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default("free"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  isBlocked: boolean("is_blocked").default(false),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type TelegramUser = typeof telegramUsers.$inferSelect;
export type InsertTelegramUser = typeof telegramUsers.$inferInsert;

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  telegramUserId: bigint("telegram_user_id", { mode: "number" }).notNull(),
  materialId: integer("material_id").notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

export const broadcasts = pgTable("broadcasts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  targetUsers: targetUsersEnum("target_users").default("all"),
  specificUserIds: text("specific_user_ids"),
  status: broadcastStatusEnum("status").default("draft"),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  recipientsCount: integer("recipients_count").default(0),
  successCount: integer("success_count").default(0),
  createdBy: integer("created_by"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type Broadcast = typeof broadcasts.$inferSelect;
export type InsertBroadcast = typeof broadcasts.$inferInsert;

export const botStats = pgTable("bot_stats", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  totalUsers: integer("total_users").default(0),
  freeUsers: integer("free_users").default(0),
  premiumUsers: integer("premium_users").default(0),
  newUsersToday: integer("new_users_today").default(0),
  materialsViewed: integer("materials_viewed").default(0),
  broadcastsSent: integer("broadcasts_sent").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type BotStat = typeof botStats.$inferSelect;
export type InsertBotStat = typeof botStats.$inferInsert;
