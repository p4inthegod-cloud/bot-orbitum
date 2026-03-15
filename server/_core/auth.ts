/**
 * Standalone JWT auth — replaces Manus OAuth entirely.
 * Admin logs in with ADMIN_SECRET, gets a signed JWT cookie.
 */
import { SignJWT, jwtVerify } from "jose";
import type { Request } from "express";
import { parse as parseCookies } from "cookie";
import { ENV } from "./env";
import * as db from "../db";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export type SessionPayload = {
  openId: string;
  name: string;
};

function secretKey() {
  const secret = ENV.cookieSecret || "fallback-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ openId: payload.openId, name: payload.name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
    .sign(secretKey());
}

export async function verifySession(
  cookieValue: string | undefined | null
): Promise<SessionPayload | null> {
  if (!cookieValue) return null;
  try {
    const { payload } = await jwtVerify(cookieValue, secretKey(), {
      algorithms: ["HS256"],
    });
    const { openId, name } = payload as Record<string, unknown>;
    if (typeof openId !== "string" || typeof name !== "string") return null;
    return { openId, name };
  } catch {
    return null;
  }
}

export async function authenticateRequest(req: Request): Promise<User | null> {
  const rawCookies = parseCookies(req.headers.cookie ?? "");
  const token = rawCookies[COOKIE_NAME];
  const session = await verifySession(token);
  if (!session) return null;
  return (await db.getUserByOpenId(session.openId)) ?? null;
}
