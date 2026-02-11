import type { Express, Request } from "express";
import type { Server } from "http";
import { Router } from "express";
import { createHmac, timingSafeEqual, scryptSync, randomBytes } from "crypto";
import { storage } from "./storage";
import { sendOtp, verifyOtp, normalizeMobile, isTwilioConfigured } from "./twilio";
import {
  insertStoreSchema,
  insertProductSchema,
  storeDesignSchema,
  type BusinessType,
  BUSINESS_TYPES,
} from "@shared/schema";
import { z } from "zod";

const OWNER_TOKEN_HEADER = "x-store-owner-token";

// Auth cookies (set by server on login/verify; httpOnly so not visible in JS)
const SESSION_COOKIE = "kb_session"; // Logged-in session: signed "storeId|ownerToken"
const ONBOARDING_PHONE_COOKIE = "kb_onboarding_phone"; // Phone just verified by OTP; required when POST /stores with mpin
const SESSION_MAX_AGE_DAYS = 30;
const ONBOARDING_PHONE_MAX_AGE_MIN = 10;

function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  return secret && secret.length >= 16 ? secret : null;
}

function signPayload(payload: string): string {
  const secret = getSessionSecret();
  if (!secret) return "";
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifySignedCookie(value: string): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;
  try {
    const lastDot = value.lastIndexOf(".");
    if (lastDot === -1) return null;
    const payload = value.slice(0, lastDot);
    const sig = value.slice(lastDot + 1);
    const expected = createHmac("sha256", secret).update(payload).digest("base64url");
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(expected, "utf8"))) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function setSessionCookie(res: import("express").Response, storeId: string, ownerToken: string) {
  const payload = `${storeId}|${ownerToken}`;
  const value = signPayload(payload);
  if (!value) return;
  res.cookie(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function setOnboardingPhoneCookie(res: import("express").Response, mobile: string) {
  const value = signPayload(mobile);
  if (!value) return;
  res.cookie(ONBOARDING_PHONE_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ONBOARDING_PHONE_MAX_AGE_MIN * 60 * 1000,
    path: "/",
  });
}

function clearAuthCookies(res: import("express").Response) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.clearCookie(ONBOARDING_PHONE_COOKIE, { path: "/" });
}

function getCookie(req: import("express").Request, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  const match = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`).exec(raw);
  return match ? decodeURIComponent(match[1].trim()) : undefined;
}

// Reusable validation middleware
function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: { body: unknown }, _res: unknown, next: (err?: unknown) => void) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next({ status: 400, message: "Validation failed", details: result.error.flatten() });
      return;
    }
    (req as { body: T }).body = result.data;
    next();
  };
}

// Normalize WhatsApp/mobile to 91XXXXXXXXXX (no leading +)
function normalizeWhatsapp(v: string): string {
  const digits = v.replace(/\D/g, "").replace(/^0+/, "");
  return digits.startsWith("91") ? digits : `91${digits}`;
}

// MPIN: hash with scrypt for verification; 6-digit PIN
function hashMpin(mpin: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(mpin, salt, 64);
  return `${salt}:${key.toString("hex")}`;
}

function verifyMpin(mpin: string, storedHash: string): boolean {
  try {
    const [salt, keyHex] = storedHash.split(":");
    if (!salt || !keyHex) return false;
    const key = scryptSync(mpin, salt, 64);
    const keyBuf = Buffer.from(keyHex, "hex");
    return key.length === keyBuf.length && timingSafeEqual(key, keyBuf);
  } catch {
    return false;
  }
}

export async function registerRoutes(
  _httpServer: Server,
  app: Express
): Promise<Server> {
  const api = Router();

  // ---- Auth: send-otp (onboarding), verify-otp-onboarding (sets cookie), login-with-mpin (sets session), auth/me, logout ----
  const sendOtpBody = z.object({ mobile: z.string().min(10).max(15) });
  api.post(
    "/auth/send-otp",
    validateBody(sendOtpBody),
    async (req: { body: z.infer<typeof sendOtpBody> }, res, next) => {
      try {
        if (!isTwilioConfigured()) {
          res.status(503).json({
            message: "OTP service is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID.",
          });
          return;
        }
        const mobile = normalizeMobile(req.body.mobile);
        const result = await sendOtp(mobile);
        if (!result.success) {
          res.status(400).json({ message: result.message });
          return;
        }
        res.json({ success: true });
      } catch (e) {
        next(e);
      }
    }
  );

  const verifyOtpBody = z.object({
    mobile: z.string().min(10).max(15),
    otp: z.string().min(4).max(9),
  });

  // Onboarding: verify OTP and set cookie so POST /stores (with mpin) is allowed
  api.post(
    "/auth/verify-otp-onboarding",
    validateBody(verifyOtpBody),
    async (req: { body: z.infer<typeof verifyOtpBody> }, res, next) => {
      try {
        if (!isTwilioConfigured()) {
          res.status(503).json({ message: "OTP service is not configured." });
          return;
        }
        const mobileE164 = normalizeMobile(req.body.mobile);
        const result = await verifyOtp(mobileE164, req.body.otp);
        if (!result.success) {
          res.status(400).json({ message: result.message });
          return;
        }
        const mobileStored = normalizeWhatsapp(req.body.mobile);
        setOnboardingPhoneCookie(res, mobileStored);
        res.json({ success: true, mobile: mobileStored });
      } catch (e) {
        next(e);
      }
    }
  );

  // Login: verify MPIN (no OTP)
  const loginMpinBody = z.object({
    mobile: z.string().min(10).max(15),
    mpin: z.string().length(6).regex(/^\d{6}$/),
  });
  api.post(
    "/auth/login-with-mpin",
    validateBody(loginMpinBody),
    async (req: { body: z.infer<typeof loginMpinBody> }, res, next) => {
      try {
        const normalized = normalizeWhatsapp(req.body.mobile);
        const store = await storage.getStoreByWhatsapp(normalized);
        if (!store) {
          res.status(404).json({ message: "No shop linked to this number. Sign up first." });
          return;
        }
        if (!store.ownerId) {
          res.status(400).json({ message: "This shop has no owner set. Please contact support." });
          return;
        }
        const owner = await storage.getStoreOwnerById(store.ownerId);
        if (!owner || !verifyMpin(req.body.mpin, owner.mpinHash)) {
          res.status(401).json({ message: "Invalid MPIN." });
          return;
        }
        setSessionCookie(res, store.id, store.ownerToken ?? "");
        res.json({
          store: {
            id: store.id,
            name: store.name,
            type: store.type,
            whatsapp: store.whatsapp,
            products: [],
          },
          ownerToken: store.ownerToken ?? undefined,
        });
      } catch (e) {
        next(e);
      }
    }
  );

  api.get("/auth/me", async (req: Request, res, next) => {
    try {
      const value = getCookie(req, SESSION_COOKIE);
      const payload = value ? verifySignedCookie(value) : null;
      if (!payload) {
        res.status(401).json({ message: "Not signed in" });
        return;
      }
      const [storeId, ownerToken] = payload.split("|");
      if (!storeId || !ownerToken) {
        res.status(401).json({ message: "Invalid session" });
        return;
      }
      const store = await storage.getStoreById(storeId);
      if (!store || store.ownerToken !== ownerToken) {
        res.status(401).json({ message: "Session expired" });
        return;
      }
      res.json({
        store: {
          id: store.id,
          name: store.name,
          type: store.type,
          whatsapp: store.whatsapp,
          products: [], // client will fetch full store if needed
        },
        ownerToken: store.ownerToken ?? undefined,
      });
    } catch (e) {
      next(e);
    }
  });

  api.post("/auth/logout", (_req, res) => {
    clearAuthCookies(res);
    res.status(204).send();
  });

  // ---- Stores ----
  const createStoreBody = insertStoreSchema
    .merge(storeDesignSchema.partial())
    .extend({
      type: z.enum(BUSINESS_TYPES as unknown as [string, ...string[]]),
      mpin: z.string().length(6).regex(/^\d{6}$/).optional(), // required when creating from onboarding (verified phone)
    });

  api.post(
    "/stores",
    validateBody(createStoreBody),
    async (req: Request & { body: z.infer<typeof createStoreBody> }, res, next) => {
      try {
        const { name, type, whatsapp, mpin, templateId, pageConfig } = req.body;
        const normalizedWhatsapp = normalizeWhatsapp(whatsapp);
        const pendingValue = getCookie(req, ONBOARDING_PHONE_COOKIE);
        const pendingPhone = pendingValue ? verifySignedCookie(pendingValue) : null;
        if (pendingPhone && normalizeWhatsapp(pendingPhone) !== normalizedWhatsapp) {
          res.status(403).json({ message: "Phone number does not match the one verified by OTP." });
          return;
        }
        let ownerId: string | undefined;
        if (mpin != null && mpin.length === 6) {
          if (!pendingPhone) {
            res.status(403).json({ message: "Verify your phone with OTP first, then create the shop." });
            return;
          }
          const existing = await storage.getStoreByWhatsapp(normalizedWhatsapp);
          if (existing) {
            res.status(409).json({ message: "A store with this WhatsApp number already exists." });
            return;
          }
          const owner = await storage.createStoreOwner(normalizedWhatsapp, hashMpin(mpin));
          ownerId = owner.id;
        }
        const store = await storage.createStore(
          {
            name,
            type: type as BusinessType,
            whatsapp: normalizedWhatsapp,
            templateId: templateId ?? null,
            pageConfig: pageConfig ?? null,
          },
          ownerId
        );
        if (pendingPhone) {
          setSessionCookie(res, store.id, store.ownerToken);
          res.clearCookie(ONBOARDING_PHONE_COOKIE, { path: "/" });
        }
        res.status(201).json(store);
      } catch (e) {
        if (e instanceof Error && e.message?.includes("unique")) {
          res.status(409).json({ message: "A store with this WhatsApp number already exists." });
          return;
        }
        next(e);
      }
    }
  );

  // Get store by ID (dashboard) or by WhatsApp (public)
  api.get("/stores/by-whatsapp/:whatsapp", async (req, res, next) => {
    try {
      const whatsapp = normalizeWhatsapp(req.params.whatsapp);
      const store = await storage.getStoreWithProductsByWhatsapp(whatsapp);
      if (!store) {
        res.status(404).json({ message: "Store not found" });
        return;
      }
      res.json(store);
    } catch (e) {
      next(e);
    }
  });

  api.get("/stores/:id", async (req, res, next) => {
    try {
      const store = await storage.getStoreWithProductsById(req.params.id);
      if (!store) {
        res.status(404).json({ message: "Store not found" });
        return;
      }
      res.json(store);
    } catch (e) {
      next(e);
    }
  });

  const updateStoreBody = insertStoreSchema
    .partial()
    .merge(storeDesignSchema.partial())
    .extend({
      type: z.enum(BUSINESS_TYPES as unknown as [string, ...string[]]).optional(),
    });

  api.patch(
    "/stores/:id",
    validateBody(updateStoreBody),
    async (req: Request<{ id: string }>, res, next) => {
      try {
        const token = req.headers[OWNER_TOKEN_HEADER] as string | undefined;
        const body = req.body as z.infer<typeof updateStoreBody>;
        const payload = body.whatsapp
          ? { ...body, whatsapp: normalizeWhatsapp(body.whatsapp) }
          : body;
        const store = await storage.updateStore(
          req.params.id,
          payload as Parameters<typeof storage.updateStore>[1],
          token ?? null
        );
        if (!store) {
          res.status(404).json({ message: "Store not found or access denied" });
          return;
        }
        res.json(store);
      } catch (e) {
        next(e);
      }
    }
  );

  // ---- Products ----
  const addProductBody = insertProductSchema.omit({ storeId: true }).extend({
    name: z.string().min(1).max(255),
    price: z.number().positive(),
    image: z.string().optional(),
    description: z.string().optional(),
  });

  api.post(
    "/stores/:storeId/products",
    validateBody(addProductBody),
    async (req: Request<{ storeId: string }>, res, next) => {
      try {
        const { storeId } = req.params;
        const store = await storage.getStoreById(storeId);
        if (!store) {
          res.status(404).json({ message: "Store not found" });
          return;
        }
        const token = req.headers[OWNER_TOKEN_HEADER] as string | undefined;
        if (store.ownerToken != null && store.ownerToken !== token) {
          res.status(403).json({ message: "Access denied" });
          return;
        }
        const body = req.body as z.infer<typeof addProductBody>;
        const image =
          body.image && body.image.trim()
            ? body.image
            : `https://source.unsplash.com/random/400x400/?product`;
        const product = await storage.addProduct(storeId, {
          name: body.name,
          price: body.price,
          image,
          description: body.description ?? null,
          sortOrder: body.sortOrder ?? 0,
        });
        res.status(201).json(product);
      } catch (e) {
        next(e);
      }
    }
  );

  api.delete(
    "/stores/:storeId/products/:productId",
    async (req: Request<{ storeId: string; productId: string }>, res, next) => {
      try {
        const token = req.headers[OWNER_TOKEN_HEADER] as string | undefined;
        const ok = await storage.deleteProduct(
          req.params.productId,
          req.params.storeId,
          token ?? null
        );
        if (!ok) {
          res.status(404).json({ message: "Product not found or access denied" });
          return;
        }
        res.status(204).send();
      } catch (e) {
        next(e);
      }
    }
  );

  app.use("/api", api);
  return _httpServer;
}
