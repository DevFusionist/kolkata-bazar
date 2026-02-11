import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, uuid, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ---- Store builder: section types and page config (shared client/server) ----
export const SECTION_TYPES = [
  "hero",
  "products_grid",
  "cta",
  "text",
  "banner",
  "features",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export type HeroProps = { title?: string; subtitle?: string; image?: string; ctaText?: string };
export type ProductsGridProps = { columns?: 2 | 3; showPrices?: boolean };
export type CtaProps = { title?: string; buttonText?: string; whatsappPrefill?: boolean };
export type TextProps = { content?: string; align?: "left" | "center" | "right" };
export type BannerProps = { image?: string; link?: string; alt?: string };
export type FeaturesProps = { items?: { icon?: string; title?: string; description?: string }[] };

export type StoreSection = {
  id: string;
  type: SectionType;
  props?: Record<string, unknown>;
};

export type PageConfig = {
  sections: StoreSection[];
};

export const defaultPageConfig: PageConfig = {
  sections: [
    { id: "hero-1", type: "hero", props: { title: "Welcome", subtitle: "Your store", ctaText: "Shop Now" } },
    { id: "products-1", type: "products_grid", props: { columns: 2, showPrices: true } },
    { id: "cta-1", type: "cta", props: { title: "Have questions?", buttonText: "Chat with us" } },
  ],
};

// ---- Users (optional auth) ----
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ---- Business type (shared with client) ----
export const BUSINESS_TYPES = [
  "saree",
  "food",
  "beauty",
  "electronics",
  "handmade",
  "other",
] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

// ---- Store owners (mobile + MPIN; one per store for ownership verification) ----
export const storeOwners = pgTable("store_owners", {
  id: uuid("id").primaryKey().defaultRandom(),
  mobile: varchar("mobile", { length: 20 }).notNull().unique(),
  mpinHash: varchar("mpin_hash", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type StoreOwner = typeof storeOwners.$inferSelect;
export type InsertStoreOwner = typeof storeOwners.$inferInsert;

// ---- Stores ----
export const stores = pgTable(
  "stores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 32 }).notNull(),
    whatsapp: varchar("whatsapp", { length: 20 }).notNull().unique(),
    ownerId: uuid("owner_id").references(() => storeOwners.id, { onDelete: "cascade" }),
    ownerToken: varchar("owner_token", { length: 64 }),
    templateId: varchar("template_id", { length: 64 }),
    pageConfig: jsonb("page_config").$type<PageConfig>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("stores_whatsapp_idx").on(t.whatsapp),
    index("stores_owner_id_idx").on(t.ownerId),
  ]
);

export const insertStoreSchema = createInsertSchema(stores).pick({
  name: true,
  type: true,
  whatsapp: true,
});
export const updateStoreSchema = insertStoreSchema.partial();

/** For create/update: optional template and page config */
export const storeDesignSchema = z.object({
  templateId: z.string().max(64).optional(),
  pageConfig: z.object({ sections: z.array(z.object({ id: z.string(), type: z.enum(SECTION_TYPES as unknown as [string, ...string[]]), props: z.record(z.unknown()).optional() })) }).optional(),
});
export type StoreDesign = z.infer<typeof storeDesignSchema>;

export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;

// ---- Products ----
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    price: real("price").notNull(),
    image: text("image").notNull(),
    description: text("description"),
    sortOrder: real("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("products_store_id_idx").on(t.storeId)]
);

export const insertProductSchema = createInsertSchema(products).pick({
  storeId: true,
  name: true,
  price: true,
  image: true,
  description: true,
  sortOrder: true,
});
export const updateProductSchema = insertProductSchema.partial().omit({ storeId: true });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// ---- API response shapes ----
export type StoreWithProducts = Store & { products: Product[] };
