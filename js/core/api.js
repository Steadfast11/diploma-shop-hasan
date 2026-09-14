/* ============================================================
   api.js — ЕДИНСТВЕННЫЙ файл, который общается с СЕРВЕРОМ.
   Правило: fetch() только здесь. Скрипты страниц вызывают
   функции из этого файла, сами fetch не делают. Благодаря этому:
     - base URL в одном месте
     - токен добавляется в одном месте
     - ошибка ловится в одном месте (вызывающий делает try/catch)
   Документация API: docs/api-reference.md
   ============================================================ */

import { API_BASE } from "./config.js";
import { getToken, clearToken } from "./storage.js";

/* Внутренний помощник — через него проходит КАЖДЫЙ запрос.
   path  : например "/products" (добавляется после API_BASE)
   method: "GET" (по умолчанию), "POST", "PATCH", "DELETE"
   body  : если объект, преобразуется в JSON
   auth  : если true, добавляется Authorization: Bearer <token> */
async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;
  }

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // API всегда возвращает JSON (даже ошибку: { message: "..." })
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // 401: токен истёк или был выполнен logout -> очищаем локально
    if (res.status === 401 && auth) clearToken();
    // "пробрасываем" ошибку -> вызывающий код ловит её через try/catch
    const err = new Error(data.message || `Xatolik (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ---------- Auth (docs 5.1) ---------- */
export const register = (payload) => request("/register", { method: "POST", body: payload });
export const login = (payload) => request("/login", { method: "POST", body: payload });
export const logout = () => request("/logout", { method: "POST", auth: true });
export const getMe = () => request("/me", { auth: true });

/* ---------- Каталог (токен не нужен, docs 5.2) ---------- */
export function getProducts({ category, minPrice, maxPrice, page, limit } = {}) {
  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  if (minPrice != null) qs.set("minPrice", minPrice);
  if (maxPrice != null) qs.set("maxPrice", maxPrice);
  if (page) qs.set("page", page);
  if (limit) qs.set("limit", limit);
  const s = qs.toString();
  return request("/products" + (s ? "?" + s : ""));
}
export const getNewest = (limit = 8) => request(`/products/newest?limit=${limit}`);
export const getBestsellers = (limit = 8) => request(`/products/bestsellers?limit=${limit}`);
export const getProduct = (id) => request(`/products/${id}`);
export const getCategories = () => request("/categories");
export const getCategoryProducts = (id) => request(`/categories/${id}/products`);

/* ---------- Корзина (токен, docs 5.3) ----------
   Ответ API приходит в виде { message, cart: { items, total } } —
   возвращаем то, что внутри { items, total } (чтобы вызывающему было проще). */
const unwrapCart = (r) => r.cart ?? r;
export const getCart = () => request("/cart", { auth: true }).then(unwrapCart);
export const addToCart = (productId, qty = 1) =>
  request("/cart", { method: "POST", auth: true, body: { productId, qty } }).then(unwrapCart);
export const updateCartItem = (productId, qty) =>
  request(`/cart/${productId}`, { method: "PATCH", auth: true, body: { qty } }).then(unwrapCart);
export const removeCartItem = (productId) =>
  request(`/cart/${productId}`, { method: "DELETE", auth: true }).then(unwrapCart);
export const clearCart = () => request("/cart", { method: "DELETE", auth: true }).then(unwrapCart);

/* ---------- Заказ (токен, docs 5.4) ---------- */
export const createOrder = () => request("/orders", { method: "POST", auth: true });
export const getOrders = () => request("/orders", { auth: true });

/* ---------- Комментарий (токен, docs 5.5) ---------- */
export const addComment = (productId, text) =>
  request(`/products/${productId}/comments`, { method: "POST", auth: true, body: { text } });
export const deleteComment = (productId, commentId) =>
  request(`/products/${productId}/comments/${commentId}`, { method: "DELETE", auth: true });
