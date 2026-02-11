import { randomBytes } from "crypto";
import {
  type User,
  type InsertUser,
  type Store,
  type StoreOwner,
  type Product,
  type InsertStore,
  type InsertProduct,
  type StoreWithProducts,
  type PageConfig,
  stores,
  storeOwners,
  products,
} from "@shared/schema";
import { eq, and, asc } from "drizzle-orm";
import { db } from "./db";

// ---- Reusable helpers ----
function generateOwnerToken(): string {
  return randomBytes(32).toString("hex");
}

// ---- Storage interface (users + store owners + stores + products) ----
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createStoreOwner(mobile: string, mpinHash: string): Promise<StoreOwner>;
  getStoreOwnerByMobile(mobile: string): Promise<StoreOwner | undefined>;
  getStoreOwnerById(id: string): Promise<StoreOwner | undefined>;

  createStore(
    data: InsertStore & { templateId?: string | null; pageConfig?: PageConfig | null },
    ownerId?: string
  ): Promise<Store & { ownerToken: string }>;
  getStoreById(id: string): Promise<Store | undefined>;
  getStoreByWhatsapp(whatsapp: string): Promise<Store | undefined>;
  getStoreWithProductsByWhatsapp(whatsapp: string): Promise<StoreWithProducts | undefined>;
  getStoreWithProductsById(id: string): Promise<StoreWithProducts | undefined>;
  updateStore(
    id: string,
    data: Partial<InsertStore> & { templateId?: string | null; pageConfig?: PageConfig | null },
    ownerToken?: string | null
  ): Promise<Store | undefined>;

  addProduct(storeId: string, data: Omit<InsertProduct, "storeId">): Promise<Product>;
  deleteProduct(productId: string, storeId: string, ownerToken?: string | null): Promise<boolean>;
  listProductsByStoreId(storeId: string): Promise<Product[]>;
}

// ---- Drizzle implementation (optimized queries, indexed lookups) ----
class DrizzleStorage implements IStorage {
  private getDb() {
    if (!db) throw new Error("DATABASE_URL is required for DrizzleStorage");
    return db;
  }

  async getUser(id: string): Promise<User | undefined> {
    const { users } = await import("@shared/schema");
    const [row] = await this.getDb().select().from(users).where(eq(users.id, id)).limit(1);
    return row;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { users } = await import("@shared/schema");
    const [row] = await this.getDb().select().from(users).where(eq(users.username, username)).limit(1);
    return row;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { users } = await import("@shared/schema");
    const [row] = await this.getDb().insert(users).values(insertUser).returning();
    if (!row) throw new Error("Failed to create user");
    return row;
  }

  async createStoreOwner(mobile: string, mpinHash: string): Promise<StoreOwner> {
    const [row] = await this.getDb()
      .insert(storeOwners)
      .values({ mobile, mpinHash })
      .returning();
    if (!row) throw new Error("Failed to create store owner");
    return row;
  }

  async getStoreOwnerByMobile(mobile: string): Promise<StoreOwner | undefined> {
    const normalized = mobile.replace(/\D/g, "").replace(/^0+/, "");
    const search = normalized.startsWith("91") ? normalized : `91${normalized}`;
    const [row] = await this.getDb()
      .select()
      .from(storeOwners)
      .where(eq(storeOwners.mobile, search))
      .limit(1);
    return row;
  }

  async getStoreOwnerById(id: string): Promise<StoreOwner | undefined> {
    const [row] = await this.getDb()
      .select()
      .from(storeOwners)
      .where(eq(storeOwners.id, id))
      .limit(1);
    return row;
  }

  async createStore(
    data: InsertStore & { templateId?: string | null; pageConfig?: PageConfig | null },
    ownerId?: string
  ): Promise<Store & { ownerToken: string }> {
    const ownerToken = generateOwnerToken();
    const [row] = await this.getDb()
      .insert(stores)
      .values({
        name: data.name,
        type: data.type,
        whatsapp: data.whatsapp,
        ownerToken,
        ownerId: ownerId ?? null,
        templateId: data.templateId ?? null,
        pageConfig: data.pageConfig ?? null,
      })
      .returning();
    if (!row) throw new Error("Failed to create store");
    return { ...row, ownerToken };
  }

  async getStoreById(id: string): Promise<Store | undefined> {
    const [row] = await this.getDb().select().from(stores).where(eq(stores.id, id)).limit(1);
    return row;
  }

  async getStoreByWhatsapp(whatsapp: string): Promise<Store | undefined> {
    const normalized = whatsapp.replace(/\D/g, "").replace(/^0/, "");
    const search = normalized.startsWith("91") ? normalized : `91${normalized}`;
    const [row] = await this.getDb().select().from(stores).where(eq(stores.whatsapp, search)).limit(1);
    return row;
  }

  async getStoreWithProductsByWhatsapp(whatsapp: string): Promise<StoreWithProducts | undefined> {
    const store = await this.getStoreByWhatsapp(whatsapp);
    if (!store) return undefined;
    const productList = await this.getDb()
      .select()
      .from(products)
      .where(eq(products.storeId, store.id))
      .orderBy(asc(products.sortOrder), asc(products.createdAt));
    return { ...store, products: productList };
  }

  async getStoreWithProductsById(id: string): Promise<StoreWithProducts | undefined> {
    const store = await this.getStoreById(id);
    if (!store) return undefined;
    const productList = await this.getDb()
      .select()
      .from(products)
      .where(eq(products.storeId, store.id))
      .orderBy(asc(products.sortOrder), asc(products.createdAt));
    return { ...store, products: productList };
  }

  async updateStore(
    id: string,
    data: Partial<InsertStore> & { templateId?: string | null; pageConfig?: PageConfig | null },
    ownerToken?: string | null
  ): Promise<Store | undefined> {
    const existing = await this.getStoreById(id);
    if (!existing) return undefined;
    if (ownerToken != null && existing.ownerToken !== ownerToken) return undefined;
    const { templateId, pageConfig, ...rest } = data;
    const [row] = await this.getDb()
      .update(stores)
      .set({
        ...rest,
        ...(templateId !== undefined ? { templateId } : {}),
        ...(pageConfig !== undefined ? { pageConfig } : {}),
        updatedAt: new Date(),
      })
      .where(eq(stores.id, id))
      .returning();
    return row;
  }

  async addProduct(
    storeId: string,
    data: Omit<InsertProduct, "storeId">
  ): Promise<Product> {
    const [row] = await this.getDb()
      .insert(products)
      .values({ ...data, storeId })
      .returning();
    if (!row) throw new Error("Failed to add product");
    return row;
  }

  async deleteProduct(
    productId: string,
    storeId: string,
    ownerToken?: string | null
  ): Promise<boolean> {
    const store = await this.getStoreById(storeId);
    if (!store) return false;
    if (ownerToken != null && store.ownerToken !== ownerToken) return false;
    const deleted = await this.getDb()
      .delete(products)
      .where(and(eq(products.id, productId), eq(products.storeId, storeId)))
      .returning({ id: products.id });
    return deleted.length > 0;
  }

  async listProductsByStoreId(storeId: string): Promise<Product[]> {
    return this.getDb()
      .select()
      .from(products)
      .where(eq(products.storeId, storeId))
      .orderBy(asc(products.sortOrder), asc(products.createdAt));
  }
}

export const storage: IStorage = new DrizzleStorage()

