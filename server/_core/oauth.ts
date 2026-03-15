import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

export function registerOAuthRoutes(app: Express) {
  // Admin login via secret key — no external OAuth needed
  app.post("/api/auth/admin-login", async (req: Request, res: Response) => {
    const { secret } = req.body ?? {};

    if (!secret || secret !== ENV.adminSecret) {
      res.status(401).json({ error: "Invalid admin secret" });
      return;
    }

    const adminOpenId = "admin_local";

    // Ensure admin user exists in DB
    await db.upsertUser({
      openId: adminOpenId,
      name: "Admin",
      role: "admin",
      lastSignedIn: new Date(),
    });

    const sessionToken = await sdk.createSessionToken(adminOpenId, {
      name: "Admin",
      expiresInMs: ONE_YEAR_MS,
    });

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    res.json({ success: true });
  });

  // Legacy OAuth callback route — kept to not break existing routes
  app.get("/api/oauth/callback", (_req: Request, res: Response) => {
    res.redirect(302, "/");
  });
}
