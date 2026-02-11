/**
 * Central API client: all requests go through /api, credentials included.
 * Reusable and type-safe.
 */

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5014"}/api`;

async function handleRes<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    let message = `${res.status}: ${text}`;
    try {
      const j = JSON.parse(text);
      if (j.message) message = j.message;
    } catch {
      // use text as message
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export type StoreSectionApi = { id: string; type: "hero" | "products_grid" | "cta" | "text" | "banner" | "features"; props?: Record<string, unknown> };
export type PageConfig = { sections: StoreSectionApi[] };

export type StoreWithProducts = {
  id: string;
  name: string;
  type: string;
  whatsapp: string;
  ownerToken?: string | null;
  templateId?: string | null;
  pageConfig?: PageConfig | null;
  createdAt: string;
  updatedAt: string;
  products: Product[];
};

export type Product = {
  id: string;
  storeId: string;
  name: string;
  price: number;
  image: string;
  description?: string | null;
  sortOrder?: number | null;
  createdAt: string;
};

export type CreateStoreBody = {
  name: string;
  type: string;
  whatsapp: string;
  mpin?: string;
  templateId?: string;
  pageConfig?: PageConfig;
};
export type AddProductBody = {
  name: string;
  price: number;
  image?: string;
  description?: string;
};

export const api = {
  async createStore(body: CreateStoreBody): Promise<StoreWithProducts & { ownerToken: string }> {
    const res = await fetch(`${API}/stores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    return handleRes(res);
  },

  async getStoreByWhatsapp(whatsapp: string): Promise<StoreWithProducts> {
    const normalized = whatsapp.replace(/\D/g, "").replace(/^0/, "");
    const search = normalized.startsWith("91") ? normalized : `91${normalized}`;
    const res = await fetch(`${API}/stores/by-whatsapp/${encodeURIComponent(search)}`, {
      credentials: "include",
    });
    return handleRes(res);
  },

  async getStoreById(id: string): Promise<StoreWithProducts> {
    const res = await fetch(`${API}/stores/${encodeURIComponent(id)}`, {
      credentials: "include",
    });
    return handleRes(res);
  },

  async updateStore(
    storeId: string,
    body: { name?: string; type?: string; whatsapp?: string; templateId?: string | null; pageConfig?: PageConfig | null },
    ownerToken?: string | null
  ): Promise<StoreWithProducts> {
    const res = await fetch(`${API}/stores/${encodeURIComponent(storeId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(ownerToken ? { [OWNER_HEADER]: ownerToken } : {}),
      },
      credentials: "include",
      body: JSON.stringify(body),
    });
    return handleRes(res);
  },

  async addProduct(
    storeId: string,
    body: AddProductBody,
    ownerToken?: string | null
  ): Promise<Product> {
    const res = await fetch(`${API}/stores/${encodeURIComponent(storeId)}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ownerToken ? { [OWNER_HEADER]: ownerToken } : {}),
      },
      credentials: "include",
      body: JSON.stringify(body),
    });
    return handleRes(res);
  },

  async deleteProduct(
    storeId: string,
    productId: string,
    ownerToken?: string | null
  ): Promise<void> {
    const res = await fetch(
      `${API}/stores/${encodeURIComponent(storeId)}/products/${encodeURIComponent(productId)}`,
      {
        method: "DELETE",
        headers: ownerToken ? { [OWNER_HEADER]: ownerToken } : {},
        credentials: "include",
      }
    );
    await handleRes<void>(res);
  },
};

export const OWNER_HEADER = "x-store-owner-token";

// Client-side session: which store we're managing + token for API (add/delete product, update store).
// Server also has kb_session cookie; we keep these so we can send x-store-owner-token header without calling /auth/me first.
const STORE_ID_KEY = "kb_store_id";
const OWNER_TOKEN_KEY = "kb_owner_token";

export function getStoredStoreId(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem(STORE_ID_KEY) : null;
}

export function getStoredOwnerToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem(OWNER_TOKEN_KEY) : null;
}

export function setStoredStore(storeId: string, ownerToken: string): void {
  localStorage.setItem(STORE_ID_KEY, storeId);
  localStorage.setItem(OWNER_TOKEN_KEY, ownerToken);
}

export function clearStoredStore(): void {
  localStorage.removeItem(STORE_ID_KEY);
  localStorage.removeItem(OWNER_TOKEN_KEY);
}

// ---- Auth ----
export type SendOtpResponse = { success: true } | { message: string };

export async function sendOtp(mobile: string): Promise<SendOtpResponse> {
  const res = await fetch(`${API}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ mobile }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || res.statusText);
  return data;
}

export type SessionResponse = {
  store: { id: string; name: string; type: string; whatsapp: string };
  ownerToken?: string;
};

/** Check if user has a valid session (cookie). Returns store + token or throws. */
export async function getSession(): Promise<SessionResponse> {
  const res = await fetch(`${API}/auth/me`, { credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Not signed in");
  return data;
}

export async function logout(): Promise<void> {
  await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
}

// ---- Onboarding: verify OTP (sets httpOnly cookie so POST /stores with mpin is allowed) ----
export async function verifyOnboardingOtp(
  mobile: string,
  otp: string
): Promise<{ success: true; mobile: string }> {
  const res = await fetch(`${API}/auth/verify-otp-onboarding`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ mobile, otp }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || res.statusText);
  return data;
}

// ---- Login with MPIN (no OTP) ----
export type LoginWithMpinResponse = {
  store: { id: string; name: string; type: string; whatsapp: string };
  ownerToken?: string;
};

export async function loginWithMpin(
  mobile: string,
  mpin: string
): Promise<LoginWithMpinResponse> {
  const res = await fetch(`${API}/auth/login-with-mpin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ mobile, mpin }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || res.statusText);
  return data;
}
