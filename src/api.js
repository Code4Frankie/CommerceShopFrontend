// Single place that talks to the ShopCore API.
// Set VITE_API_URL (see .env.example). Example: https://your-service.onrender.com/api
const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const TOKEN_KEY = "shopcore_token";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (t) => {
  try {
    t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
};

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Check your connection or the API URL.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }
  return data;
}

// The backend may return a bare array or wrap it ({ products: [...] }, { data: [...] }).
const list = (d, key) => (Array.isArray(d) ? d : d?.[key] || d?.data || []);
const one = (d, key) => d?.[key] || d?.data || d;

export const normalizeProduct = (p) => ({
  id: p._id || p.id,
  name: p.name || p.title || "Untitled",
  price: Number(p.price || 0),
  description: p.description || "",
  category: p.category || "",
  stock: p.stock ?? p.quantity ?? null,
  image: p.image?.url || p.images?.[0]?.url || p.images?.[0] || p.imageUrl || p.image || "",
});

export const api = {
  products: async () => list(await request("/products"), "products").map(normalizeProduct),
  product: async (id) => normalizeProduct(one(await request(`/products/${id}`), "product")),
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  createOrder: (items) =>
    request("/orders", {
      method: "POST",
      body: { items: items.map((i) => ({ product: i.id, quantity: i.qty })) },
    }),
  myOrders: async () => list(await request("/orders/my"), "orders"),
};

export const money = (n) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
