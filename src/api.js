// Every call to the ShopCore API lives here, matched to the backend contract
// (CommerceEngine repo: routes, controllers and docs/openapi.json).
//
// VITE_API_URL must include the version prefix, e.g. https://your-api.onrender.com/api/v1

const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");
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
    /* storage unavailable */
  }
};

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

const qs = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, v);
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
};

// Backend errors look like { success:false, message }.
async function request(path, { method = "GET", body, form, query } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (form) {
    payload = form; // multipart: the browser sets the Content-Type boundary itself
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${BASE}${path}${qs(query)}`, { method, headers, body: payload });
  } catch {
    throw new Error("Cannot reach the server. Check your connection and try again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token && onUnauthorized) onUnauthorized();
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

// ---------- normalisers ----------
const imgUrl = (i) => (typeof i === "string" ? i : i?.url || "");

export const normalizeProduct = (p = {}) => {
  const images = (p.images || []).map(imgUrl).filter(Boolean);
  const cat = p.category;
  return {
    id: p._id || p.id,
    name: p.name || "Untitled",
    description: p.description || "",
    price: Number(p.price || 0),
    stock: p.stock ?? 0,
    category: cat && typeof cat === "object" ? cat._id : cat || "",
    categoryName: cat && typeof cat === "object" ? cat.name : "",
    images,
    image: images[0] || "",
    ratingsAverage: p.ratingsAverage || 0,
    ratingsCount: p.ratingsCount || 0,
  };
};

// Cart items come back as { product:{_id,name,price,stock,images}, quantity, subtotal }.
const normalizeCart = (d) => ({
  items: (d.cart?.items || []).map((i) => {
    const p = i.product || {};
    return {
      id: p._id || p.id,
      name: p.name,
      price: Number(p.price || 0),
      stock: p.stock ?? null,
      image: imgUrl(p.images?.[0]),
      qty: i.quantity,
    };
  }),
  total: Number(d.cart?.total || 0),
});

const paged = (d, key, map = (x) => x) => ({
  items: (d[key] || []).map(map),
  total: d.total ?? 0,
  page: d.page ?? 1,
  pages: d.pages ?? 1,
});

export const api = {
  // auth -> { success, token, user }
  register: (b) => request("/auth/register", { method: "POST", body: b }),
  login: (b) => request("/auth/login", { method: "POST", body: b }),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token, password) =>
    request(`/auth/reset-password/${token}`, { method: "POST", body: { password } }),

  // users
  me: () => request("/users/me"),
  updateMe: (b) => request("/users/me", { method: "PUT", body: b }),
  changePassword: (b) => request("/users/me/password", { method: "PUT", body: b }),

  // categories -> { categories:[{_id,name,description}] }
  categories: async () => (await request("/categories")).categories || [],
  createCategory: (b) => request("/categories", { method: "POST", body: b }),
  updateCategory: (id, b) => request(`/categories/${id}`, { method: "PUT", body: b }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: "DELETE" }),

  // products -> { products, total, page, limit, pages }
  products: async (query) => {
    const d = await request("/products", { query });
    return { ...paged(d, "products", normalizeProduct), products: (d.products || []).map(normalizeProduct) };
  },
  product: async (id) => normalizeProduct((await request(`/products/${id}`)).product),
  createProduct: (form) => request("/products", { method: "POST", form }),
  updateProduct: (id, form) => request(`/products/${id}`, { method: "PUT", form }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),

  // cart (server side, needs login) -> { cart:{ items, total } }
  getCart: async () => normalizeCart(await request("/cart")),
  addToCart: async (productId, quantity = 1) =>
    normalizeCart(await request("/cart/items", { method: "POST", body: { productId, quantity } })),
  updateCartItem: async (productId, quantity) =>
    normalizeCart(await request(`/cart/items/${productId}`, { method: "PUT", body: { quantity } })),
  removeCartItem: async (productId) => normalizeCart(await request(`/cart/items/${productId}`, { method: "DELETE" })),
  clearCart: async () => normalizeCart(await request("/cart", { method: "DELETE" })),

  // orders. Items: { product, name, price, quantity }, plus total and status.
  createOrder: async (shippingAddress) => (await request("/orders", { method: "POST", body: { shippingAddress } })).order,
  myOrders: async (query) => paged(await request("/orders/mine", { query }), "orders"),
  getOrder: async (id) => (await request(`/orders/${id}`)).order,
  cancelOrder: async (id) => (await request(`/orders/${id}/cancel`, { method: "PUT" })).order,
  allOrders: async (query) => paged(await request("/orders", { query }), "orders"), // admin
  setOrderStatus: async (id, status) =>
    (await request(`/orders/${id}/status`, { method: "PUT", body: { status } })).order, // admin

  // payments -> initialize: { reference, authorizationUrl } | verify: { status }
  initPayment: (orderId) => request("/payments/initialize", { method: "POST", body: { orderId } }),
  verifyPayment: (reference) => request(`/payments/verify/${encodeURIComponent(reference)}`),
};

export const money = (n) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

export const shortId = (id = "") => String(id).slice(-6).toUpperCase();
