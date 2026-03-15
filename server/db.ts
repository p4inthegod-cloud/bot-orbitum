import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  InsertUser, users,
  telegramUsers, InsertTelegramUser, TelegramUser,
  materials, lessons, broadcasts, InsertBroadcast,
  userProgress,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ Telegram User Functions ============

export async function getTelegramUser(telegramId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(telegramUsers).where(eq(telegramUsers.telegramId, telegramId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertTelegramUser(user: InsertTelegramUser): Promise<TelegramUser> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getTelegramUser(user.telegramId as number);
  if (existing) {
    await db.update(telegramUsers).set({ ...user, lastActiveAt: new Date(), updatedAt: new Date() }).where(eq(telegramUsers.telegramId, user.telegramId as number));
    return getTelegramUser(user.telegramId as number) as Promise<TelegramUser>;
  } else {
    await db.insert(telegramUsers).values(user);
    return getTelegramUser(user.telegramId as number) as Promise<TelegramUser>;
  }
}

export async function getAllTelegramUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(telegramUsers).orderBy(desc(telegramUsers.createdAt));
}

export async function getTelegramUsersByStatus(status: "free" | "premium" | "trial") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(telegramUsers).where(eq(telegramUsers.subscriptionStatus, status));
}

export async function setUserSubscription(telegramId: number, status: "free" | "premium" | "trial") {
  const db = await getDb();
  if (!db) return;
  await db.update(telegramUsers).set({ subscriptionStatus: status, updatedAt: new Date() }).where(eq(telegramUsers.telegramId, telegramId));
}

// ============ Lessons & Materials Functions ============

export async function getLessons() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessons).orderBy(lessons.order);
}

export async function getLesson(lessonId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMaterialsByLesson(lessonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(materials).where(eq(materials.lessonId, lessonId)).orderBy(materials.order);
}

export async function getMaterial(materialId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(materials).where(eq(materials.id, materialId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ User Progress Functions ============

export async function recordMaterialView(telegramId: number, materialId: number) {
  const db = await getDb();
  if (!db) return;
  const user = await getTelegramUser(telegramId);
  if (!user) return;
  await db.insert(userProgress).values({ telegramUserId: telegramId, materialId });
}

export async function getUserViewedMaterials(telegramId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userProgress).where(eq(userProgress.telegramUserId, telegramId));
}

// ============ Broadcasts Functions ============

export async function createBroadcast(broadcast: InsertBroadcast) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(broadcasts).values(broadcast).returning();
  return result[0];
}

export async function getBroadcasts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(broadcasts).orderBy(desc(broadcasts.createdAt));
}

export async function getBroadcast(broadcastId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(broadcasts).where(eq(broadcasts.id, broadcastId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBroadcastStatus(broadcastId: number, status: "draft" | "scheduled" | "sent", sentAt?: Date, successCount?: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(broadcasts).set({ status, sentAt: sentAt || new Date(), updatedAt: new Date(), ...(successCount !== undefined ? { successCount } : {}) }).where(eq(broadcasts.id, broadcastId));
}

// ============ Statistics Functions ============

export async function getStats() {
  const db = await getDb();
  if (!db) return null;

  const [totalUsers] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(telegramUsers);
  const [freeUsers] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(telegramUsers).where(eq(telegramUsers.subscriptionStatus, "free"));
  const [premiumUsers] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(telegramUsers).where(eq(telegramUsers.subscriptionStatus, "premium"));
  const [totalMaterials] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(materials);
  const [totalBroadcasts] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(broadcasts).where(eq(broadcasts.status, "sent"));

  return {
    totalUsers: totalUsers?.count || 0,
    freeUsers: freeUsers?.count || 0,
    premiumUsers: premiumUsers?.count || 0,
    totalMaterials: totalMaterials?.count || 0,
    totalBroadcasts: totalBroadcasts?.count || 0,
  };
}
